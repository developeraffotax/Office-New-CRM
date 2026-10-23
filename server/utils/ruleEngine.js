import AutomationRule from "../models/automationRuleModel.js";
import userModel from "../models/userModel.js";

const norm = (v) => String(v ?? "").trim().toLowerCase();

function testLeaf({ field, op, value }, ctx) {
  const actual = norm(ctx[field]);
  const expected = norm(value);

  switch (op) {
    case "equals":
      return actual === expected;
    case "not_equals":
      return actual !== expected;
    case "contains":
      return actual.includes(expected);
    case "not_contains":
      return !actual.includes(expected);
    case "starts_with":
      return actual.startsWith(expected);
    case "ends_with":
      return actual.endsWith(expected);
    case "one_of":
      return expected
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .includes(actual);
    case "is_empty":
      return actual === "";
    case "is_not_empty":
      return actual !== "";
    default:
      return false;
  }
}

// Recursively evaluates a { operator, items } group. Empty group = match everything.
export function evaluateGroup(group, ctx) {
  const items = group?.items ?? [];
  if (!items.length) return true;

  const check = (item) =>
    item.items ? evaluateGroup(item, ctx) : testLeaf(item, ctx);

  return group.operator === "OR" ? items.some(check) : items.every(check);
}

async function pickUser(rule, dryRun) {
  const { strategy, users = [], currentIndex = 0 } = rule.actions?.assign || {};
  if (!users.length) return null;

  // Only hand work to active users, keeping the configured order
  const active = await userModel
    .find({ _id: { $in: users }, isActive: true })
    .select("_id")
    .lean();
  const ids = users.filter((id) => active.some((a) => a._id.equals(id)));
  if (!ids.length) return null;

  switch (strategy) {
    case "random":
      return ids[Math.floor(Math.random() * ids.length)];

    case "round_robin": {
      if (dryRun) return ids[currentIndex % ids.length];

      // Atomic increment so two simultaneous emails never get the same slot
      const before = await AutomationRule.findOneAndUpdate(
        { _id: rule._id },
        { $inc: { "actions.assign.currentIndex": 1 } },
        { new: false },
      )
        .select("actions.assign.currentIndex")
        .lean();

      const idx = (before?.actions?.assign?.currentIndex ?? 0) % ids.length;
      return ids[idx];
    }

    case "fixed":
    default:
      return ids[0];
  }
}

/*
  Walks enabled rules for the channel in priority order.
  - The first matching rule that yields a user sets the user.
  - The first matching rule that has a category sets the category.
  - A matching rule with stopOnMatch = true ends the walk.

  Returns { userId, category, matchedRules: [{ _id, name }] }
*/
export async function resolveAutomation(channel, ctx, { dryRun = false } = {}) {
  const rules = await AutomationRule.find({ channel, enabled: true })
    .sort({ priority: 1, createdAt: 1 })
    .lean();

  const result = { userId: null, category: "", matchedRules: [] };

  for (const rule of rules) {
    if (!evaluateGroup(rule.conditions, ctx)) continue;

    result.matchedRules.push({ _id: rule._id, name: rule.name });

    if (!result.userId) {
      const userId = await pickUser(rule, dryRun);
      if (userId) result.userId = userId;
    }

    if (!result.category && rule.actions?.category) {
      result.category = rule.actions.category;
    }

    if (rule.stopOnMatch) break;
  }

  return result;
}