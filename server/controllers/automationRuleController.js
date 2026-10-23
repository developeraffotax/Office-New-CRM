import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import AutomationRule from "../models/automationRuleModel.js";
import { resolveAutomation } from "../utils/ruleEngine.js";

const FIELDS = {
  email: ["type", "companyName", "from", "fromName", "to", "subject", "snippet", "hasAttachments"],
  whatsapp: ["companyName", "phone", "profileName", "message"],
};
const OPS = ["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with", "one_of", "is_empty", "is_not_empty"];
const NO_VALUE_OPS = ["is_empty", "is_not_empty"];
const STRATEGIES = ["fixed", "round_robin", "random"];
const MAX_DEPTH = 3;
const MAX_ITEMS = 25;

// ---------- validation / sanitising ----------

function validateGroup(group, channel, depth = 0) {
  if (!group || typeof group !== "object") return "Conditions are required.";
  if (depth >= MAX_DEPTH) return "Conditions are nested too deeply.";
  if (!["AND", "OR"].includes(group.operator)) return "Group operator must be AND or OR.";
  if (!Array.isArray(group.items) || group.items.length > MAX_ITEMS) return "Invalid condition list.";

  for (const item of group.items) {
    if (item?.items) {
      const err = validateGroup(item, channel, depth + 1);
      if (err) return err;
      continue;
    }
    if (!FIELDS[channel].includes(item?.field)) return `Invalid field "${item?.field}" for ${channel}.`;
    if (!OPS.includes(item?.op)) return `Invalid operator "${item?.op}".`;
    if (!NO_VALUE_OPS.includes(item.op) && !String(item.value ?? "").trim()) {
      return "Every condition needs a value.";
    }
  }
  return null;
}

// Rebuild from known keys only, so nothing unexpected gets stored
function cleanGroup(group) {
  return {
    operator: group.operator,
    items: group.items.map((i) =>
      i.items
        ? cleanGroup(i)
        : { field: i.field, op: i.op, value: NO_VALUE_OPS.includes(i.op) ? "" : String(i.value).trim() },
    ),
  };
}

async function buildActions(actions = {}) {
  const strategy = actions.assign?.strategy || "fixed";
  if (!STRATEGIES.includes(strategy)) return { error: "Invalid assignment strategy." };

  const requested = (actions.assign?.users || []).filter((id) => mongoose.Types.ObjectId.isValid(id));
  const users = requested.length
    ? (await userModel.find({ _id: { $in: requested }, isActive: true }).select("_id").lean()).map((u) => u._id)
    : [];

  const category = String(actions.category || "").trim();

  if (!users.length && !category) return { error: "Pick at least one user or a category." };

  return { value: { strategy, users, category } };
}

// ---------- handlers ----------

export const getRules = async (req, res) => {
  try {
    const filter = req.query.channel ? { channel: req.query.channel } : {};
    const rules = await AutomationRule.find(filter).sort({ channel: 1, priority: 1, createdAt: 1 }).lean();
    return res.json({ success: true, data: rules });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch rules." });
  }
};

export const createRule = async (req, res) => {
  try {
    const { name, channel, enabled = true, stopOnMatch = true, conditions, actions } = req.body;

    if (!String(name || "").trim()) return res.status(400).json({ success: false, message: "Rule name is required." });
    if (!FIELDS[channel]) return res.status(400).json({ success: false, message: "Invalid channel." });

    const condErr = validateGroup(conditions, channel);
    if (condErr) return res.status(400).json({ success: false, message: condErr });

    const { error, value } = await buildActions(actions);
    if (error) return res.status(400).json({ success: false, message: error });

    // New rules go on top (specific rules usually get added after broad ones)
    const top = await AutomationRule.findOne({ channel }).sort({ priority: 1 }).select("priority").lean();
    const priority = top ? top.priority - 10 : 100;

    const rule = await AutomationRule.create({
      name: name.trim(),
      channel,
      enabled: Boolean(enabled),
      stopOnMatch: Boolean(stopOnMatch),
      priority,
      conditions: cleanGroup(conditions),
      actions: {
        category: value.category,
        assign: { strategy: value.strategy, users: value.users },
      },
    });

    return res.status(201).json({ success: true, data: rule });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to create rule." });
  }
};

export const updateRule = async (req, res) => {
  try {
    const rule = await AutomationRule.findById(req.params.id).lean();
    if (!rule) return res.status(404).json({ success: false, message: "Rule not found." });

    const b = req.body;
    const set = {};

    if (b.name !== undefined) {
      if (!String(b.name).trim()) return res.status(400).json({ success: false, message: "Rule name is required." });
      set.name = String(b.name).trim();
    }
    if (b.enabled !== undefined) set.enabled = Boolean(b.enabled);
    if (b.stopOnMatch !== undefined) set.stopOnMatch = Boolean(b.stopOnMatch);

    if (b.conditions !== undefined) {
      const err = validateGroup(b.conditions, rule.channel);
      if (err) return res.status(400).json({ success: false, message: err });
      set.conditions = cleanGroup(b.conditions);
    }

    if (b.actions !== undefined) {
      const { error, value } = await buildActions(b.actions);
      if (error) return res.status(400).json({ success: false, message: error });
      // dotted paths so the round-robin counter is left alone
      set["actions.category"] = value.category;
      set["actions.assign.strategy"] = value.strategy;
      set["actions.assign.users"] = value.users;
    }

    const updated = await AutomationRule.findByIdAndUpdate(rule._id, { $set: set }, { new: true });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to update rule." });
  }
};

export const deleteRule = async (req, res) => {
  try {
    await AutomationRule.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Rule removed." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to remove rule." });
  }
};

// body: { channel, ids: [ruleId, ...] } in the new top-to-bottom order
export const reorderRules = async (req, res) => {
  try {
    const { channel, ids } = req.body;
    if (!FIELDS[channel] || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: "Invalid reorder payload." });
    }

    await AutomationRule.bulkWrite(
      ids
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id, index) => ({
          updateOne: { filter: { _id: id, channel }, update: { $set: { priority: (index + 1) * 10 } } },
        })),
    );

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to reorder rules." });
  }
};

// Dry run: POST { channel, context: { subject: "Govt Gateway", to: "info@affotax.com", ... } }
export const testRules = async (req, res) => {
  try {
    const { channel, context = {} } = req.body;
    if (!FIELDS[channel]) return res.status(400).json({ success: false, message: "Invalid channel." });

    const result = await resolveAutomation(channel, context, { dryRun: true });
    const user = result.userId ? await userModel.findById(result.userId).select("name").lean() : null;

    return res.json({ success: true, data: { ...result, userName: user?.name || null } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to test rules." });
  }
};