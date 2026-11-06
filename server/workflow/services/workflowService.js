import mongoose from "mongoose";
import WorkflowTemplate from "../models/workflowTemplateModel.js";
import JobWorkflow, { STEP_STATUSES } from "../models/jobWorkflowModel.js";
import { cleanRichText } from "../utils/sanitizeRichText.js";

/* ---- adjust if your model names / user fields differ ---- */
const CLIENT_MODEL = "Client"; // mongoose.model("Client", clientSchema)
const USER_MODEL = "Users"; // use "Users" if that's how your user model is registered
const USER_FIELDS = "name email avatar"; // fields returned for assignee display
/* --------------------------------------------------------- */

const OPEN_STATUSES = ["pending", "in_progress", "blocked"];
const ASSIGNEE_MODES = ["fixed", "jobHolder", "leadUser", "unassigned"];
const MAX_BULK_TARGETS = 2000;
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;
const ObjectId = mongoose.Types.ObjectId;

// Looked up lazily so this file doesn't need to know where your models live.
const Client = () => mongoose.model(CLIENT_MODEL);
const User = () => mongoose.model(USER_MODEL);

export class WorkflowError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/* ------------------------------ helpers ------------------------------ */

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toObjectId = (value, label = "id") => {
  const str = String(value?._id || value || "");
  if (!OBJECT_ID_RE.test(str)) throw new WorkflowError(`Invalid ${label}`);
  return new ObjectId(str);
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const renumber = (wf) => {
  [...wf.steps].sort((a, b) => a.order - b.order).forEach((s, i) => (s.order = i));
};

const progressOf = (steps) => {
  const counted = steps.filter((s) => s.status !== "skipped");
  const done = counted.filter((s) => s.status === "done").length;
  return { done, total: counted.length, percent: counted.length ? Math.round((done / counted.length) * 100) : 0 };
};

// Accepts a user id, a name or an email. job.jobHolder / job.leadUser are plain strings on your Client model.
async function resolveUserId(value, cache = new Map()) {
  const key = String(value?._id || value || "").trim();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key);
  let id = null;
  if (OBJECT_ID_RE.test(key)) {
    id = new ObjectId(key);
  } else {
    const user = await User()
      .findOne({ $or: [{ name: new RegExp(`^${escapeRegex(key)}$`, "i") }, { email: key.toLowerCase() }] })
      .select("_id")
      .lean();
    id = user?._id || null;
  }
  cache.set(key, id);
  return id;
}

const userName = async (id) =>
  id ? (await User().findById(id).select("name").lean())?.name || "unknown user" : "nobody";

// Writes into the Client.activities array you already have (same one updateClientJob logs to).
async function logActivity(clientIds, userId, text) {
  const ids = [].concat(clientIds).filter(Boolean);
  if (!ids.length) return;
  await Client().updateMany({ _id: { $in: ids } }, { $push: { activities: { user: userId, activity: text } } });
}

// Plug your notification queue in here (e.g. add a job to notificationQueue).
export const onStepAssigned = async ({ clientId, step, assigneeId, byUserId }) => {};

/* ------------------------------ templates ------------------------------ */

const normalizeTemplateSteps = (steps) => {
  if (!Array.isArray(steps) || !steps.length) throw new WorkflowError("Add at least one step");
  return steps.map((s, i) => {
    const title = String(s.title || "").trim();
    if (!title) throw new WorkflowError(`Step ${i + 1} needs a title`);
    const mode = ASSIGNEE_MODES.includes(s.assigneeMode) ? s.assigneeMode : "unassigned";
    const assigneeId = s.assignee?._id || s.assignee || null;
    if (mode === "fixed" && !assigneeId) throw new WorkflowError(`Step ${i + 1}: choose a user`);
    const offset = s.dueOffsetDays === "" || s.dueOffsetDays == null ? null : Number(s.dueOffsetDays);
    if (offset !== null && (!Number.isFinite(offset) || offset < 0)) {
      throw new WorkflowError(`Step ${i + 1}: due days must be 0 or more`);
    }
    return {
      ...(s._id && OBJECT_ID_RE.test(String(s._id)) ? { _id: s._id } : {}), // keep ids stable for sync
      order: i,
      title,
      description: cleanRichText(s.description),
      assigneeMode: mode,
      assignee: mode === "fixed" ? toObjectId(assigneeId, "user") : null,
      dueOffsetDays: offset,
    };
  });
};

export const listTemplates = ({ jobType, includeInactive = false } = {}) => {
  const q = {};
  if (jobType) q.jobType = new RegExp(`^${escapeRegex(jobType)}$`, "i");
  if (!includeInactive) q.isActive = true;
  return WorkflowTemplate.find(q).sort({ jobType: 1, name: 1 }).lean();
};

export const getTemplate = async (id) => {
  const t = await WorkflowTemplate.findById(toObjectId(id, "template id")).lean();
  if (!t) throw new WorkflowError("Template not found", 404);
  return t;
};

export const createTemplate = (body, userId) => {
  const name = String(body.name || "").trim();
  const jobType = String(body.jobType || "").trim();
  // if (!name || !jobType) throw new WorkflowError("Name and job type are required");
  if (!name ) throw new WorkflowError("Template Name is required");
  return WorkflowTemplate.create({
    name,
    jobType,
    description: String(body.description || "").trim(),
    isActive: body.isActive !== false,
    steps: normalizeTemplateSteps(body.steps),
    createdBy: userId,
    updatedBy: userId,
  });
};

export const updateTemplate = async (id, body, userId) => {
  const t = await WorkflowTemplate.findById(toObjectId(id, "template id"));
  if (!t) throw new WorkflowError("Template not found", 404);
  const name = String(body.name || "").trim();
  const jobType = String(body.jobType || "").trim();
  // if (!name || !jobType) throw new WorkflowError("Name and job type are required");
  if (!name ) throw new WorkflowError("Template Name is required");
  t.name = name;
  t.jobType = jobType;
  t.description = String(body.description || "").trim();
  t.isActive = body.isActive !== false;
  t.steps = normalizeTemplateSteps(body.steps);
  t.version += 1;
  t.updatedBy = userId;
  return t.save();
};

// Jobs that already use the template keep their own copy of the steps.
export const deleteTemplate = async (id) => {
  const t = await WorkflowTemplate.findByIdAndDelete(toObjectId(id, "template id"));
  if (!t) throw new WorkflowError("Template not found", 404);
  return { deleted: true };
};

/* ------------------------- apply template to jobs ------------------------- */

async function resolveStepAssignee(templateStep, client, cache) {
  switch (templateStep.assigneeMode) {
    case "fixed":
      return templateStep.assignee || null;
    case "jobHolder":
      return resolveUserId(client.job?.jobHolder, cache);
    case "leadUser":
      return resolveUserId(client.job?.leadUser, cache);
    default:
      return null;
  }
}

async function buildSteps(template, client, cache, startDate) {
  const steps = [];
  let unresolved = 0;
  const ordered = [...template.steps].sort((a, b) => a.order - b.order);
  for (const [i, ts] of ordered.entries()) {
    const assignee = await resolveStepAssignee(ts, client, cache);
    if (!assignee && ts.assigneeMode !== "unassigned") unresolved += 1;
    steps.push({
      _id: new ObjectId(),
      templateStepId: ts._id,
      order: i,
      title: ts.title,
      description: ts.description || "",
      assignee,
      status: "pending",
      dueDate: ts.dueOffsetDays != null ? addDays(startDate, ts.dueOffsetDays) : null,
    });
  }
  return { steps, unresolved };
}

function buildClientQuery({ jobIds, filter }) {
  if (Array.isArray(jobIds) && jobIds.length) {
    return { _id: { $in: jobIds.map((id) => toObjectId(id, "job id")) } };
  }
  const q = {};
  if (filter?.jobName) q["job.jobName"] = new RegExp(`^${escapeRegex(filter.jobName)}$`, "i");
  if (filter?.jobStatus) q["job.jobStatus"] = filter.jobStatus;
  if (filter?.jobHolder) q["job.jobHolder"] = filter.jobHolder;
  if (!Object.keys(q).length) throw new WorkflowError("Pick specific jobs or set at least one filter");
  q.isActive = { $ne: false }; // filter mode skips inactive clients
  return q;
}

export const applyTemplate = async (
  { templateId, jobIds, filter, ifExists = "skip", dryRun = false },
  userId
) => {
  if (!["skip", "replace"].includes(ifExists)) throw new WorkflowError("ifExists must be skip or replace");

  const template = await WorkflowTemplate.findById(toObjectId(templateId, "template id")).lean();
  if (!template) throw new WorkflowError("Template not found", 404);
  if (!template.isActive) throw new WorkflowError("This template is switched off");
  if (!template.steps?.length) throw new WorkflowError("This template has no steps");

  const clients = await Client()
    .find(buildClientQuery({ jobIds, filter }))
    .select("clientName companyName job.jobName job.jobHolder job.leadUser")
    .limit(MAX_BULK_TARGETS + 1)
    .lean();
  if (clients.length > MAX_BULK_TARGETS) {
    throw new WorkflowError(`More than ${MAX_BULK_TARGETS} jobs match. Narrow the filter.`);
  }

  const existing = await JobWorkflow.find({ clientId: { $in: clients.map((c) => c._id) } })
    .select("clientId")
    .lean();
  const existingIds = new Set(existing.map((w) => String(w.clientId)));
  const existingCount = clients.filter((c) => existingIds.has(String(c._id))).length;

  const summary = {
    matched: clients.length,
    willCreate: clients.length - existingCount,
    willReplace: ifExists === "replace" ? existingCount : 0,
    willSkip: ifExists === "skip" ? existingCount : 0,
  };

  if (dryRun) {
    return {
      ...summary,
      sample: clients.slice(0, 8).map((c) => ({
        _id: c._id,
        clientName: c.clientName,
        companyName: c.companyName,
        jobName: c.job?.jobName,
      })),
    };
  }

  const targets = ifExists === "replace" ? clients : clients.filter((c) => !existingIds.has(String(c._id)));
  const cache = new Map();
  const now = new Date();
  const ops = [];
  let unresolvedSteps = 0;

  for (const c of targets) {
    const { steps, unresolved } = await buildSteps(template, c, cache, now);
    unresolvedSteps += unresolved;
    ops.push({
      updateOne: {
        filter: { clientId: c._id },
        update: {
          $set: {
            templateId: template._id,
            templateName: template.name,
            templateVersion: template.version,
            steps,
            appliedBy: userId,
          },
        },
        upsert: true,
      },
    });
  }

  for (let i = 0; i < ops.length; i += 500) {
    await JobWorkflow.bulkWrite(ops.slice(i, i + 500), { ordered: false });
  }
  await logActivity(
    targets.map((c) => c._id),
    userId,
    `Workflow "${template.name}" applied (${template.steps.length} steps)`
  );

  return { ...summary, applied: targets.length, unresolvedSteps };
};

/* ----------------------------- per-job workflow ----------------------------- */

const findWorkflow = async (clientId) => {
  const wf = await JobWorkflow.findOne({ clientId: toObjectId(clientId, "job id") });
  if (!wf) throw new WorkflowError("This job has no workflow yet", 404);
  return wf;
};

export const getJobWorkflow = async (clientId) => {
  const wf = await JobWorkflow.findOne({ clientId: toObjectId(clientId, "job id") })
    .populate("steps.assignee", USER_FIELDS)
    .populate("steps.completedBy", "name")
    .lean();
  if (!wf) return null;
  wf.steps.sort((a, b) => a.order - b.order);
  wf.progress = progressOf(wf.steps);
  return wf;
};



// A workflow with no template behind it. It starts empty and is built step by step with addStep.
export const createManualWorkflow = async (clientId, userId) => {
  const id = toObjectId(clientId, "job id");
  if (!(await Client().exists({ _id: id }))) throw new WorkflowError("Job not found", 404);
  try {
    await JobWorkflow.create({
      clientId: id,
      templateId: null,
      templateName: "Manual workflow",
      templateVersion: 0,
      steps: [],
      appliedBy: userId,
    });
  } catch (err) {
    if (err?.code === 11000) throw new WorkflowError("This job already has a workflow", 409); // unique clientId
    throw err;
  }
  await logActivity(id, userId, "Manual workflow created");
  return getJobWorkflow(clientId);
};





export const removeJobWorkflow = async (clientId, userId) => {
  const res = await JobWorkflow.deleteOne({ clientId: toObjectId(clientId, "job id") });
  if (res.deletedCount) await logActivity(clientId, userId, "Workflow removed");
  return { removed: res.deletedCount > 0 };
};

export const updateStep = async (clientId, stepId, patch, userId) => {
  const wf = await findWorkflow(clientId);
  const step = wf.steps.id(stepId);
  if (!step) throw new WorkflowError("Step not found", 404);

  const changes = [];
  let newAssignee = null;

  if (patch.title !== undefined) {
    const title = String(patch.title).trim();
    if (!title) throw new WorkflowError("Step needs a title");
    if (title !== step.title) {
      changes.push(`title "${step.title}" → "${title}"`);
      step.title = title;
      step.customized = true;
    }
  }

  if (patch.description !== undefined) {
    const description = cleanRichText(patch.description);
    if (description !== step.description) {
      step.description = description;
      step.customized = true;
      changes.push("description edited");
    }
  }

  if (patch.assignee !== undefined) {
    const id = patch.assignee ? await resolveUserId(patch.assignee) : null;
    if (patch.assignee && !id) throw new WorkflowError("User not found");
    if (String(id || "") !== String(step.assignee || "")) {
      changes.push(`assigned to ${await userName(id)}`);
      step.assignee = id;
      newAssignee = id;
    }
  }

  if (patch.status !== undefined) {
    if (!STEP_STATUSES.includes(patch.status)) throw new WorkflowError("Invalid status");
    if (patch.status !== step.status) {
      changes.push(`status ${step.status} → ${patch.status}`);
      step.status = patch.status;
      step.completedAt = patch.status === "done" ? new Date() : null;
      step.completedBy = patch.status === "done" ? userId : null;
    }
  }

  if (patch.dueDate !== undefined) {
    const due = patch.dueDate ? new Date(patch.dueDate) : null;
    if (due && Number.isNaN(due.getTime())) throw new WorkflowError("Invalid due date");
    if ((due?.getTime() ?? null) !== (step.dueDate?.getTime() ?? null)) {
      changes.push(due ? `due ${due.toISOString().slice(0, 10)}` : "due date cleared");
      step.dueDate = due;
    }
  }

  if (patch.note !== undefined) {
    const note = String(patch.note).trim().slice(0, 1000);
    if (note !== step.note) {
      step.note = note;
      changes.push("note updated");
    }
  }

  if (changes.length) {
    await wf.save();
    await logActivity(clientId, userId, `Workflow step "${step.title}": ${changes.join(", ")}`);
    if (newAssignee && String(newAssignee) !== String(userId)) {
      await onStepAssigned({ clientId, step, assigneeId: newAssignee, byUserId: userId });
    }
  }
  return getJobWorkflow(clientId);
};

export const addStep = async (clientId, body, userId) => {
  const title = String(body.title || "").trim();
  if (!title) throw new WorkflowError("Step needs a title");
  const wf = await findWorkflow(clientId);

  const assignee = body.assignee ? await resolveUserId(body.assignee) : null;
  if (body.assignee && !assignee) throw new WorkflowError("User not found");
  const due = body.dueDate ? new Date(body.dueDate) : null;
  if (due && Number.isNaN(due.getTime())) throw new WorkflowError("Invalid due date");

  const after = body.afterStepId ? wf.steps.id(body.afterStepId) : null;
  wf.steps.push({
    order: after ? after.order + 0.5 : wf.steps.length,
    title,
    description: cleanRichText(body.description),
    assignee,
    dueDate: due,
    customized: true,
  });
  renumber(wf);
  await wf.save();
  await logActivity(clientId, userId, `Workflow step added: "${title}"`);
  return getJobWorkflow(clientId);
};

export const deleteStep = async (clientId, stepId, userId) => {
  const wf = await findWorkflow(clientId);
  const step = wf.steps.id(stepId);
  if (!step) throw new WorkflowError("Step not found", 404);
  const title = step.title;
  wf.steps.pull({ _id: step._id });
  renumber(wf);
  await wf.save();
  await logActivity(clientId, userId, `Workflow step removed: "${title}"`);
  return getJobWorkflow(clientId);
};

export const reorderSteps = async (clientId, orderedIds, userId) => {
  const wf = await findWorkflow(clientId);
  const current = wf.steps.map((s) => String(s._id)).sort();
  const incoming = (orderedIds || []).map(String);
  if (incoming.length !== current.length || [...incoming].sort().some((id, i) => id !== current[i])) {
    throw new WorkflowError("Step list is out of date. Refresh and try again.");
  }
  incoming.forEach((id, i) => (wf.steps.id(id).order = i));
  await wf.save();
  await logActivity(clientId, userId, "Workflow steps reordered");
  return getJobWorkflow(clientId);
};

// Pull template changes into one job: adds new template steps and refreshes text on
// untouched, still-pending steps. Steps removed from the template are left alone.
export const syncFromTemplate = async (clientId, userId) => {
  const wf = await findWorkflow(clientId);
  if (!wf.templateId) throw new WorkflowError("This workflow wasn't created from a template");
  const template = await WorkflowTemplate.findById(wf.templateId).lean();
  if (!template) throw new WorkflowError("The original template no longer exists", 404);
  if (template.version === wf.templateVersion) {
    return { workflow: await getJobWorkflow(clientId), added: 0, updated: 0, upToDate: true };
  }

  const client = await Client().findById(wf.clientId).select("job.jobHolder job.leadUser").lean();
  const cache = new Map();
  const byTemplateId = new Map(wf.steps.filter((s) => s.templateStepId).map((s) => [String(s.templateStepId), s]));
  let added = 0;
  let updated = 0;
  let anchor = -1;

  for (const ts of [...template.steps].sort((a, b) => a.order - b.order)) {
    const existing = byTemplateId.get(String(ts._id));
    if (existing) {
      if (existing.status === "pending" && !existing.customized) {
        if (existing.title !== ts.title || existing.description !== (ts.description || "")) {
          existing.title = ts.title;
          existing.description = ts.description || "";
          updated += 1;
        }
      }
      anchor = existing.order;
    } else {
      anchor += 0.01;
      wf.steps.push({
        templateStepId: ts._id,
        order: anchor,
        title: ts.title,
        description: ts.description || "",
        assignee: await resolveStepAssignee(ts, client || {}, cache),
      });
      added += 1;
    }
  }

  renumber(wf);
  wf.templateVersion = template.version;
  wf.templateName = template.name;
  await wf.save();
  await logActivity(clientId, userId, `Workflow updated from template (${added} added, ${updated} refreshed)`);
  return { workflow: await getJobWorkflow(clientId), added, updated, upToDate: false };
};

/* ------------------------------ bulk + lists ------------------------------ */

// Moves every OPEN step (not done/skipped) from one user to another.
export const bulkReassign = async ({ fromUser, toUser, jobIds, dryRun = false }, userId) => {
  const from = await resolveUserId(fromUser);
  const to = await resolveUserId(toUser);
  if (!from || !to) throw new WorkflowError("Choose both users");
  if (String(from) === String(to)) throw new WorkflowError("Choose two different users");

  const match = { steps: { $elemMatch: { assignee: from, status: { $in: OPEN_STATUSES } } } };
  if (Array.isArray(jobIds) && jobIds.length) match.clientId = { $in: jobIds.map((id) => toObjectId(id, "job id")) };

  const affected = await JobWorkflow.find(match).select("clientId").lean();
  const [{ n: steps = 0 } = {}] = await JobWorkflow.aggregate([
    { $match: match },
    { $unwind: "$steps" },
    { $match: { "steps.assignee": from, "steps.status": { $in: OPEN_STATUSES } } },
    { $count: "n" },
  ]);
  if (dryRun || !affected.length) return { jobs: affected.length, steps };

  await JobWorkflow.updateMany(
    { _id: { $in: affected.map((a) => a._id) } },
    { $set: { "steps.$[s].assignee": to } },
    { arrayFilters: [{ "s.assignee": from, "s.status": { $in: OPEN_STATUSES } }] }
  );
  await logActivity(
    affected.map((a) => a.clientId),
    userId,
    `Open workflow steps reassigned from ${await userName(from)} to ${await userName(to)}`
  );
  return { jobs: affected.length, steps };
};

export const getMySteps = (userId, { status } = {}) => {
  const uid = toObjectId(userId, "user id");
  const statuses = status && STEP_STATUSES.includes(status) ? [status] : OPEN_STATUSES;
  return JobWorkflow.aggregate([
    { $match: { "steps.assignee": uid } },
    { $unwind: "$steps" },
    { $match: { "steps.assignee": uid, "steps.status": { $in: statuses } } },
    {
      $lookup: {
        from: Client().collection.name,
        let: { cid: "$clientId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$cid"] } } },
          { $project: { clientName: 1, companyName: 1, "job.jobName": 1, "job.jobStatus": 1 } },
        ],
        as: "client",
      },
    },
    { $unwind: "$client" },
    {
      $project: {
        _id: 0,
        clientId: 1,
        stepId: "$steps._id",
        title: "$steps.title",
        status: "$steps.status",
        dueDate: "$steps.dueDate",
        clientName: "$client.clientName",
        companyName: "$client.companyName",
        jobName: "$client.job.jobName",
        jobStatus: "$client.job.jobStatus",
      },
    },
    { $sort: { dueDate: 1, clientName: 1 } },
  ]);
};