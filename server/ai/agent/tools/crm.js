// ai/agent/tools/crm.js — admin tools over your CRM data: people, tasks, jobs, leads, tickets.
// Read-only. Every tool is admin-only and returns small, allow-listed results (never raw documents).
//
// Your models, as I read them:
//   Users   { name, email, role → Role, isActive }
//   Tasks   { task, jobHolder:String, leadUser:String, status:String, deadline, startDate, taskRef, ... }
//   Client  = a "job": { clientName, companyName, status, isActive, job:{ jobName, jobStatus, jobHolder, ... }, jobRef, ... }
//   leads   { companyName, clientName, jobHolder, leadUser, stage, status, followUpDate, wonAt, lostAt, leadRef, ... }
//   tickets { subject, jobHolder, leadUser, status, state, isOpen, unreadCount, ticketRef, ... }
//
// Two things to know:
//  1. jobHolder / leadUser are STRINGS. jobHolder = the ASSIGNEE (the person doing / owning it); leadUser = the team
//     lead (the person leading it). By default every tool means the assignee; pass as="lead" or as="either" for the
//     other readings. A person is matched by NAME (case-insensitive) OR by id string, so it works whichever your app
//     stores. The fields behind each reading are in `holders` below.
//  2. Tasks have no "completed at" date. "Completed in a period" uses `updatedAt` (CONFIG.task.completedAt) as an
//     approximation: any later edit to a completed task moves it. For exact numbers add a completedAt field to Tasks
//     and set it when the status becomes completed, then change CONFIG.task.completedAt to "completedAt".
//
// NEVER add these Client fields to a select list: ctLogin, ctPassword, pyeLogin, pyePassword, trLogin, trPassword,
// vatLogin, vatPassword, authCode, utr, personalCode. Every query below uses an allow-list, so they can't leak.
import mongoose from "mongoose";
import { aiConfig, isAdminRole } from "../../config.js";
import { ToolError } from "../toolkit.js";

const CONFIG = {
  user: { model: ["Users"], nameField: "name" },
  task: {
    model: ["Tasks"],
    holders: { assignee: ["jobHolder"], lead: ["leadUser"] },
    completedAt: "updatedAt", // approximation, see note 2
    select: "taskRef task status jobHolder leadUser startDate deadline hours estimate_Time createdAt updatedAt",
  },
  job: {
    model: ["Client"], // a Client document carries one job in `job`
    holders: { assignee: ["job.jobHolder"], lead: ["job.leadUser"] },
    select:
      "jobRef clientName companyName status activeClient isActive clientType country fee clientPaidFee totalHours createdAt " +
      "job.jobName job.jobStatus job.jobHolder job.leadUser job.yearEnd job.jobDeadline job.workDeadline job.hours job.fee job.subscription",
  },
  lead: {
    model: ["leads", "lead"], // the lead model's export wasn't in what you sent, so several names are tried
    holders: { assignee: ["jobHolder"], lead: ["leadUser"] },
    select:
      "leadRef companyName clientName jobHolder leadUser department source lead_Source brand stage status value " +
      "followUpDate leadCreatedAt JobDate yearEnd jobDeadline wonAt lostAt createdAt",
  },
  ticket: {
    model: ["tickets", "ticket"],
    holders: { assignee: ["jobHolder"], lead: ["leadUser"] },
    select:
      "ticketRef subject companyName clientName jobHolder leadUser status state isOpen jobStatus jobDate unreadCount sent received " +
      "lastMessageSentBy lastMessageSentTime createdAt",
  },
};

// ---------- helpers ----------
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ci = (s) => new RegExp(`^\\s*${esc(String(s).trim())}\\s*$`, "i"); // case-insensitive exact match
const DONE_RE = /^\s*(completed?|done|closed|finished)\s*$/i;
const MAX_ROWS = 25;

const requireAdmin = (ctx) => {
  if (!isAdminRole(ctx.user.role)) throw new ToolError("Not allowed.");
};

/** Find a registered model by any of several names, ignoring case. */
function model(key) {
  const names = mongoose.modelNames();
  const wanted = CONFIG[key].model;
  const hit = wanted.map((w) => names.find((n) => n.toLowerCase() === w.toLowerCase())).find(Boolean);
  if (!hit) throw new ToolError(`The ${key} model isn't registered (looked for: ${wanted.join(", ")}). It needs setting in CONFIG.`);
  return mongoose.model(hit);
}

const and = (...parts) => {
  const list = parts.filter((p) => p && Object.keys(p).length);
  return list.length ? { $and: list } : {};
};

/**
 * Filter for "belongs to this person" on string fields that may hold their name or their id.
 * as: "assignee" (default, the job holder), "lead" (the team lead) or "either".
 */
async function holder(userId, holders, as = "assignee") {
  if (!userId) return { name: null, filter: null };
  if (!["assignee", "lead", "either"].includes(as)) throw new ToolError(`Unknown "as" value "${as}". Use assignee, lead or either.`);
  const paths = as === "either" ? [...holders.assignee, ...holders.lead] : holders[as];
  if (!mongoose.isValidObjectId(userId)) throw new ToolError("Invalid userId. Use find_user first.");
  const user = await model("user").findById(userId).select(CONFIG.user.nameField).lean();
  if (!user) throw new ToolError("User not found.");
  const name = user[CONFIG.user.nameField];
  const values = [ci(name), String(user._id)];
  return { name, filter: { $or: paths.map((p) => ({ [p]: { $in: values } })) } };
}

const range = (field, input) => {
  if (!input.period) return null;
  const [from, to] = resolvePeriod(input);
  return { [field]: { $gte: from, $lt: to } };
};

const text = (field, value) => (value ? { [field]: { $regex: esc(String(value).trim().slice(0, 80)), $options: "i" } } : null);
const clip = (v, n = 160) => (typeof v === "string" && v.length > n ? `${v.slice(0, n)}…` : v);
const tidy = (doc) => JSON.parse(JSON.stringify(doc, (k, v) => (typeof v === "string" ? clip(v) : v))); // plain JSON, long text clipped
const groupCounts = async (Model, match, field) =>
  (await Model.aggregate([{ $match: match }, { $group: { _id: `$${field}`, n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 15 }])).map((g) => ({
    value: g._id ?? "(none)",
    count: g.n,
  }));

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

// ---------- shared schema pieces ----------
const PERIODS = ["today", "yesterday", "this_week", "last_week", "this_month", "last_month", "custom"];
const P = {
  userId: { type: "string", description: "Person, from find_user. Omit for everyone." },
  period: { type: "string", enum: PERIODS, description: "Optional time window." },
  from: { type: "string", description: "YYYY-MM-DD, only for period=custom." },
  to: { type: "string", description: "YYYY-MM-DD (inclusive), only for period=custom." },
  search: { type: "string", description: "Words to look for in the title / name." },
  limit: { type: "integer", minimum: 1, maximum: MAX_ROWS, description: `Default 15, max ${MAX_ROWS}.` },
};
P.as = {
  type: "string",
  enum: ["assignee", "lead", "either"],
  description: "How the person relates to the items: assignee (the job holder, default), lead (the team lead / person leading it) or either. Only use lead when asked about things someone leads.",
};
const obj = (properties, required) => ({ type: "object", properties, ...(required ? { required } : {}) });

export const crmTools = [
  // ---------------------------------------------------------------- people
  {
    name: "find_user",
    description: "Find people by (part of) their name. Returns ids you can use with the other tools. If several match, ask which one.",
    parameters: obj({ name: { type: "string" } }, ["name"]),
    async execute({ name }, ctx) {
      requireAdmin(ctx);
      const users = await model("user")
        .find({ [CONFIG.user.nameField]: { $regex: esc(name.trim().slice(0, 80)), $options: "i" }, isActive: { $ne: false } })
        .select(`${CONFIG.user.nameField} email role`)
        .populate({ path: "role", select: "name" })
        .limit(5)
        .lean();
      return users.map((u) => ({ id: String(u._id), name: u[CONFIG.user.nameField], email: u.email, role: u.role?.name ?? null }));
    },
  },

  // ---------------------------------------------------------------- tasks
  {
    name: "get_task_stats",
    description:
      "Task numbers for one person: completed in a period, created in a period, and currently open / overdue, plus a breakdown by status. Use this for 'how many tasks has X completed this month'.",
    parameters: obj({ userId: { ...P.userId, description: "Person, from find_user." }, period: P.period, from: P.from, to: P.to }, ["userId"]),
    async execute(input, ctx) {
      requireAdmin(ctx);
      const T = CONFIG.task;
      const Task = model("task");
      const who = await holder(input.userId, T.holders, input.as);
      const [from, to] = resolvePeriod(input);
      const mine = who.filter;
      const open = and(mine, { status: { $not: DONE_RE } });
      const [completed, created, openNow, overdueNow, byStatus] = await Promise.all([
        Task.countDocuments(and(mine, { status: DONE_RE }, { [T.completedAt]: { $gte: from, $lt: to } })),
        Task.countDocuments(and(mine, { createdAt: { $gte: from, $lt: to } })),
        Task.countDocuments(open),
        Task.countDocuments(and(open, { deadline: { $lt: new Date() } })),
        groupCounts(Task, mine, "status"),
      ]);
      return {
        person: who.name, period: { from, to }, completed, created, openNow, overdueNow, byStatus,
        ...(T.completedAt === "updatedAt" ? { note: "'completed' counts tasks now marked completed whose last update was in the period (approximate)." } : {}),
      };
    },
  },
  {
    name: "list_tasks",
    description: "List tasks (most relevant first), optionally for one person. state: open, completed, overdue or any. periodField says which date the period applies to.",
    parameters: obj({
      userId: P.userId,
      state: { type: "string", enum: ["any", "open", "completed", "overdue"], description: "Default any." },
      status: { type: "string", description: "Exact status text, if you need one specific status." },
      periodField: { type: "string", enum: ["deadline", "created", "updated"], description: "Which date the period filters on. Default deadline." },
      period: P.period, from: P.from, to: P.to, search: P.search, limit: P.limit,
    }),
    async execute(input, ctx) {
      requireAdmin(ctx);
      const T = CONFIG.task;
      const Task = model("task");
      const who = await holder(input.userId, T.holders, input.as);
      const stateFilter = { open: { status: { $not: DONE_RE } }, completed: { status: DONE_RE }, overdue: and({ status: { $not: DONE_RE } }, { deadline: { $lt: new Date() } }) }[input.state];
      const dateField = { deadline: "deadline", created: "createdAt", updated: "updatedAt" }[input.periodField || "deadline"];
      const q = and(who.filter, stateFilter, input.status && { status: ci(input.status) }, range(dateField, input), text("task", input.search));
      const asc = input.state === "open" || input.state === "overdue";
      const [rows, total] = await Promise.all([
        Task.find(q).sort(asc ? { deadline: 1 } : { updatedAt: -1 }).limit(Math.min(input.limit || 15, MAX_ROWS)).select(T.select).lean(),
        Task.countDocuments(q),
      ]);
      return { person: who.name, total, tasks: rows.map(tidy) };
    },
  },

  // ---------------------------------------------------------------- jobs (Client documents)
  {
    name: "get_job_stats",
    description: "Job numbers: how many jobs, grouped by job status and by client status, and how many are past their job deadline. Optionally for one person (the job holder).",
    parameters: obj({ userId: P.userId, period: { ...P.period, description: "Optional: only jobs created in this window." }, from: P.from, to: P.to }),
    async execute(input, ctx) {
      requireAdmin(ctx);
      const J = CONFIG.job;
      const Job = model("job");
      const who = await holder(input.userId, J.holders, input.as);
      const q = and(who.filter, range("createdAt", input));
      const notDone = { "job.jobStatus": { $not: DONE_RE } };
      const [total, byJobStatus, byClientStatus, pastDeadline] = await Promise.all([
        Job.countDocuments(q),
        groupCounts(Job, q, "job.jobStatus"),
        groupCounts(Job, q, "status"),
        Job.countDocuments(and(q, notDone, { "job.jobDeadline": { $lt: new Date() } })),
      ]);
      return { person: who.name, total, byJobStatus, byClientStatus, pastJobDeadline: pastDeadline };
    },
  },
  {
    name: "list_jobs",
    description: "List jobs (client records with their job details). Filter by job holder, job status, client status or words in the client / company name. Never returns logins, passwords or tax codes.",
    parameters: obj({
      userId: { ...P.userId, description: "Job holder, from find_user. Omit for everyone." },
      jobStatus: { type: "string", description: "Exact job status text." },
      clientStatus: { type: "string", description: "Exact client status text." },
      activeOnly: { type: "boolean", description: "Only active clients." },
      dateField: { type: "string", enum: ["created", "jobDeadline", "workDeadline", "yearEnd"], description: "Which date the period filters on. Default jobDeadline." },
      period: P.period, from: P.from, to: P.to, search: P.search, limit: P.limit,
    }),
    async execute(input, ctx) {
      requireAdmin(ctx);
      const J = CONFIG.job;
      const Job = model("job");
      const who = await holder(input.userId, J.holders, input.as);
      const dateField = { created: "createdAt", jobDeadline: "job.jobDeadline", workDeadline: "job.workDeadline", yearEnd: "job.yearEnd" }[input.dateField || "jobDeadline"];
      const names = input.search && { $or: [text("clientName", input.search), text("companyName", input.search)] };
      const q = and(
        who.filter, names, range(dateField, input),
        input.jobStatus && { "job.jobStatus": ci(input.jobStatus) },
        input.clientStatus && { status: ci(input.clientStatus) },
        input.activeOnly && { isActive: { $ne: false } }
      );
      const [rows, total] = await Promise.all([
        Job.find(q).sort({ "job.jobDeadline": 1 }).limit(Math.min(input.limit || 15, MAX_ROWS)).select(J.select).lean(),
        Job.countDocuments(q),
      ]);
      return { person: who.name, total, jobs: rows.map(tidy) };
    },
  },

  // ---------------------------------------------------------------- leads
  {
    name: "get_lead_stats",
    description: "Lead numbers: totals by status and stage, leads created / won / lost in a period, and follow-ups that are overdue. Optionally for one person.",
    parameters: obj({ userId: P.userId, period: P.period, from: P.from, to: P.to }),
    async execute(input, ctx) {
      requireAdmin(ctx);
      const L = CONFIG.lead;
      const Lead = model("lead");
      const who = await holder(input.userId, L.holders, input.as);
      const [from, to] = resolvePeriod(input);
      const mine = who.filter;
      const [total, byStatus, byStage, created, won, lost, overdueFollowUps] = await Promise.all([
        Lead.countDocuments(and(mine)),
        groupCounts(Lead, and(mine), "status"),
        groupCounts(Lead, and(mine), "stage"),
        Lead.countDocuments(and(mine, { leadCreatedAt: { $gte: from, $lt: to } })),
        Lead.countDocuments(and(mine, { wonAt: { $gte: from, $lt: to } })),
        Lead.countDocuments(and(mine, { lostAt: { $gte: from, $lt: to } })),
        Lead.countDocuments(and(mine, { followUpDate: { $lt: new Date() } }, { wonAt: null }, { lostAt: null })),
      ]);
      return { person: who.name, period: { from, to }, total, byStatus, byStage, createdInPeriod: created, wonInPeriod: won, lostInPeriod: lost, overdueFollowUps };
    },
  },
  {
    name: "list_leads",
    description: "List leads, optionally for one person. Filter by status, stage, department, source, or words in the company / client name.",
    parameters: obj({
      userId: P.userId,
      status: { type: "string", description: "Exact status text (for example the value shown in get_lead_stats)." },
      stage: { type: "string" }, department: { type: "string" }, source: { type: "string" },
      dateField: { type: "string", enum: ["created", "followUp", "won", "lost"], description: "Which date the period filters on. Default created." },
      period: P.period, from: P.from, to: P.to, search: P.search, limit: P.limit,
    }),
    async execute(input, ctx) {
      requireAdmin(ctx);
      const L = CONFIG.lead;
      const Lead = model("lead");
      const who = await holder(input.userId, L.holders, input.as);
      const dateField = { created: "leadCreatedAt", followUp: "followUpDate", won: "wonAt", lost: "lostAt" }[input.dateField || "created"];
      const names = input.search && { $or: [text("clientName", input.search), text("companyName", input.search)] };
      const q = and(
        who.filter, names, range(dateField, input),
        input.status && { status: ci(input.status) }, input.stage && { stage: ci(input.stage) },
        input.department && { department: ci(input.department) }, input.source && { $or: [{ source: ci(input.source) }, { lead_Source: ci(input.source) }] }
      );
      const [rows, total] = await Promise.all([
        Lead.find(q).sort({ leadCreatedAt: -1 }).limit(Math.min(input.limit || 15, MAX_ROWS)).select(L.select).lean(),
        Lead.countDocuments(q),
      ]);
      return { person: who.name, total, leads: rows.map(tidy) };
    },
  },

  // ---------------------------------------------------------------- tickets
  {
    name: "get_ticket_stats",
    description: "Ticket numbers: totals by state and by read status, how many are open or have unread messages, and how many were created in a period. Optionally for one person.",
    parameters: obj({ userId: P.userId, period: P.period, from: P.from, to: P.to }),
    async execute(input, ctx) {
      requireAdmin(ctx);
      const K = CONFIG.ticket;
      const Ticket = model("ticket");
      const who = await holder(input.userId, K.holders, input.as);
      const [from, to] = resolvePeriod(input);
      const mine = who.filter;
      const [total, byState, byStatus, open, withUnread, created] = await Promise.all([
        Ticket.countDocuments(and(mine)),
        groupCounts(Ticket, and(mine), "state"),
        groupCounts(Ticket, and(mine), "status"),
        Ticket.countDocuments(and(mine, { isOpen: true })),
        Ticket.countDocuments(and(mine, { unreadCount: { $gt: 0 } })),
        Ticket.countDocuments(and(mine, { createdAt: { $gte: from, $lt: to } })),
      ]);
      return { person: who.name, period: { from, to }, total, byState, byStatus, open, withUnread, createdInPeriod: created };
    },
  },
  {
    name: "list_tickets",
    description: "List tickets, optionally for one person. Filter by state, read status (Read / Unread / Sent), open, unread messages, or words in the subject / company / client.",
    parameters: obj({
      userId: P.userId,
      state: { type: "string", description: "Exact state text, for example progress." },
      status: { type: "string", enum: ["Read", "Unread", "Sent"] },
      isOpen: { type: "boolean" },
      unreadOnly: { type: "boolean", description: "Only tickets with unread messages." },
      dateField: { type: "string", enum: ["created", "lastMessage"], description: "Which date the period filters on. Default created." },
      period: P.period, from: P.from, to: P.to, search: P.search, limit: P.limit,
    }),
    async execute(input, ctx) {
      requireAdmin(ctx);
      const K = CONFIG.ticket;
      const Ticket = model("ticket");
      const who = await holder(input.userId, K.holders, input.as);
      const dateField = { created: "createdAt", lastMessage: "lastMessageSentTime" }[input.dateField || "created"];
      const words = input.search && { $or: [text("subject", input.search), text("companyName", input.search), text("clientName", input.search)] };
      const q = and(
        who.filter, words, range(dateField, input),
        input.state && { state: ci(input.state) }, input.status && { status: input.status },
        typeof input.isOpen === "boolean" && { isOpen: input.isOpen }, input.unreadOnly && { unreadCount: { $gt: 0 } }
      );
      const [rows, total] = await Promise.all([
        Ticket.find(q).sort({ lastMessageSentTime: -1 }).limit(Math.min(input.limit || 15, MAX_ROWS)).select(K.select).lean(),
        Ticket.countDocuments(q),
      ]);
      return { person: who.name, total, tickets: rows.map(tidy) };
    },
  },
];

// Every tool that takes a person also accepts `as`, and echoes which reading it used.
for (const t of crmTools) {
  if (t.name === "find_user" || !t.parameters.properties.userId) continue;
  t.parameters.properties.as = P.as;
  const run = t.execute;
  t.execute = async (input, ctx) => {
    const out = await run(input, ctx);
    return input.userId ? { ...out, viewedAs: input.as || "assignee" } : out;
  };
}