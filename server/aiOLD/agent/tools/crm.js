// ai/agent/tools/crm.js — admin tools that wrap your CRM data.
//
// ⚠ ADAPT THIS FILE. I don't have your schemas, so the model names and fields below are guesses:
//   User   { name, email, role }
//   Task   { assignedTo: ObjectId, status: "completed"|..., completedAt, dueDate, createdAt }
//   Client { jobHolder: ObjectId, status, createdAt, ... }   // your "jobs"
// Change the three CONFIG blocks and nothing else needs to move.
import mongoose from "mongoose";
import { aiConfig } from "../../config.js";
import { ToolError } from "../toolkit.js";

const CONFIG = {
  user: { model: "User", nameField: "name" },
  task: { model: "Task", assignee: "assignedTo", statusField: "status", doneValue: "completed", completedAt: "completedAt", dueDate: "dueDate" },
  job: { model: "Client", holder: "jobHolder", statusField: "status", fields: "name status jobHolder createdAt" },
};
const M = (name) => mongoose.model(name);
const requireAdmin = (ctx) => {
  if (!aiConfig.adminRoles.includes(ctx.user.role)) throw new ToolError("Not allowed.");
};

// "this_month", "last_week", ... → [from, to) computed on the server, in the configured UTC offset.
export function resolvePeriod({ period = "this_month", from, to } = {}, offsetMin = aiConfig.utcOffsetMinutes, now = new Date()) {
  const local = new Date(now.getTime() + offsetMin * 60000);
  const y = local.getUTCFullYear(), m = local.getUTCMonth(), d = local.getUTCDate();
  const dow = (local.getUTCDay() + 6) % 7; // Monday = 0
  const at = (yy, mm, dd) => new Date(Date.UTC(yy, mm, dd) - offsetMin * 60000);
  switch (period) {
    case "today": return [at(y, m, d), at(y, m, d + 1)];
    case "yesterday": return [at(y, m, d - 1), at(y, m, d)];
    case "this_week": return [at(y, m, d - dow), at(y, m, d - dow + 7)];
    case "last_week": return [at(y, m, d - dow - 7), at(y, m, d - dow)];
    case "this_month": return [at(y, m, 1), at(y, m + 1, 1)];
    case "last_month": return [at(y, m - 1, 1), at(y, m, 1)];
    case "custom": {
      const a = new Date(from), b = new Date(to);
      if (isNaN(a) || isNaN(b)) throw new ToolError("custom period needs valid from and to dates (YYYY-MM-DD).");
      const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(to));
      return [a, dateOnly ? new Date(b.getTime() + 86400000) : b]; // a date-only "to" includes that whole day
    }
    default: throw new ToolError(`Unknown period "${period}".`);
  }
}

const PERIODS = ["today", "yesterday", "this_week", "last_week", "this_month", "last_month", "custom"];

export const crmTools = [
  {
    name: "find_user",
    description: "Find people by (part of) their name. Returns ids you can use with the other tools. If several match, ask which one.",
    parameters: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
    async execute({ name }, ctx) {
      requireAdmin(ctx);
      const safe = name.trim().slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const users = await M(CONFIG.user.model)
        .find({ [CONFIG.user.nameField]: { $regex: safe, $options: "i" } })
        .select(`${CONFIG.user.nameField} email role`)
        .limit(5)
        .lean();
      return users.map((u) => ({ id: String(u._id), name: u[CONFIG.user.nameField], email: u.email, role: u.role }));
    },
  },
  {
    name: "get_task_stats",
    description: "Task numbers for one person: completed in a period, created in a period, and currently open / overdue.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "string", description: "From find_user." },
        period: { type: "string", enum: PERIODS, description: "Default this_month." },
        from: { type: "string", description: "YYYY-MM-DD, only for period=custom." },
        to: { type: "string", description: "YYYY-MM-DD (inclusive), only for period=custom." },
      },
      required: ["userId"],
    },
    async execute(input, ctx) {
      requireAdmin(ctx);
      if (!mongoose.isValidObjectId(input.userId)) throw new ToolError("Invalid userId. Use find_user first.");
      const [from, to] = resolvePeriod(input);
      const T = CONFIG.task;
      const Task = M(T.model);
      const who = { [T.assignee]: new mongoose.Types.ObjectId(input.userId) };
      const open = { ...who, [T.statusField]: { $ne: T.doneValue } };
      const [completed, created, openNow, overdueNow] = await Promise.all([
        Task.countDocuments({ ...who, [T.statusField]: T.doneValue, [T.completedAt]: { $gte: from, $lt: to } }),
        Task.countDocuments({ ...who, createdAt: { $gte: from, $lt: to } }),
        Task.countDocuments(open),
        Task.countDocuments({ ...open, [T.dueDate]: { $lt: new Date() } }),
      ]);
      return { period: { from, to }, completed, created, openNow, overdueNow };
    },
  },
  {
    name: "list_jobs",
    description: "List jobs, optionally for one person or status. Returns at most 25.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "string", description: "Job holder, from find_user." },
        status: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 25 },
      },
    },
    async execute({ userId, status, limit = 15 }, ctx) {
      requireAdmin(ctx);
      const J = CONFIG.job;
      const q = {};
      if (userId) {
        if (!mongoose.isValidObjectId(userId)) throw new ToolError("Invalid userId.");
        q[J.holder] = new mongoose.Types.ObjectId(userId);
      }
      if (status) q[J.statusField] = String(status).slice(0, 60);
      const [jobs, total] = await Promise.all([
        M(J.model).find(q).sort({ createdAt: -1 }).limit(Math.min(limit, 25)).select(J.fields).lean(),
        M(J.model).countDocuments(q),
      ]);
      return { total, jobs };
    },
  },
];