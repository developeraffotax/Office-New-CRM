import clientModel from "../../models/jobsModel.js";
import subscriptionModel from "../../models/subscriptionModel.js";
import proposalModel from "../../models/proposalModel.js";
import leadModel from "../../models/leadModel.js";
import EmailMessage from "../../emailModule/models/EmailMessage.js";
import { fetchGoalTargetsByUser } from "./goalTargets.js";

export const TEAM_TOTAL = "Team Total";

// Same filter mapping the chart registry uses for lead queries
const LEAD_FILTERS = [
  ["jobHolder", "jobHolder"],
  ["source", "lead_Source"],
  ["department", "department"],
];

const SUBSCRIPTION_FILTERS = [
  ["source", "source"],
  ["jobHolder", "job.jobHolder"],
];

// Same behaviour as the "leads.conversion" chart: 0 when there is nothing to divide by
const pct = (a, b) => (b > 0 ? Number(((a / b) * 100).toFixed(2)) : 0);

// Achievement vs a target: null ("–") when no target is set, so "no target" isn't shown as 0%
const achievement = (actual, target) =>
  target > 0 ? Number(((actual / target) * 100).toFixed(2)) : null;

/**
 * Metrics the table can read. Copied from chartRegistry so table numbers match the charts
 * (plus leads.progress / leads.lost, which have no chart of their own).
 *
 * Shape: Model, dateField, valueConfig, baseMatch, allowedFilters
 * Every metric needs a ["jobHolder", <field>] entry in allowedFilters:
 * that is the field the table groups its user columns by.
 */
export const kpiMetrics = {
  // --- SALES ---
  "sales.new": {
    label: "New Sales",
    Model: leadModel,
    dateField: "wonAt",
    valueConfig: { type: "sum", field: "value" },
    baseMatch: { status: { $eq: "won" } },
    allowedFilters: LEAD_FILTERS,
  },
  "sales.subscription": {
    label: "Subscription Sales",
    Model: subscriptionModel,
    dateField: "completedAt",
    valueConfig: { type: "sum", field: "job.fee" },
    baseMatch: { progressStatus: "completed" },
    allowedFilters: SUBSCRIPTION_FILTERS,
  },

  // --- SUBSCRIPTIONS ---
  // NOTE: the chart's getTimeSeriesData currently ignores dateEndField / rangeOverlap,
  // so the chart only matches on job.billingStart inside the range. Mirrored here so the
  // numbers agree. To count subscriptions "active during the period" instead, add
  //   dateEndField: "job.billingEnd", rangeOverlap: true
  // to both entries (the table service already supports it).
  "subscriptions.count": {
    label: "Subscription Count",
    Model: subscriptionModel,
    dateField: "job.billingStart",
    valueConfig: { type: "count" },
    baseMatch: {},
    allowedFilters: SUBSCRIPTION_FILTERS,
  },
  "subscriptions.value": {
    label: "Subscription Value",
    Model: subscriptionModel,
    dateField: "job.billingStart",
    valueConfig: { type: "sum", field: "job.fee" },
    baseMatch: {},
    allowedFilters: SUBSCRIPTION_FILTERS,
  },

  // --- LEADS (all by lead created date, so progress + won + lost = total) ---
  "leads.total": {
    label: "Total Leads",
    Model: leadModel,
    dateField: "leadCreatedAt",
    valueConfig: { type: "count" },
    baseMatch: {},
    allowedFilters: [...LEAD_FILTERS, ["status", "status"]],
  },
  "leads.won": {
    label: "Won Leads",
    Model: leadModel,
    dateField: "leadCreatedAt",
    valueConfig: { type: "count" },
    baseMatch: { status: "won" },
    allowedFilters: LEAD_FILTERS,
  },
  "leads.lost": {
    label: "Lost Leads",
    Model: leadModel,
    dateField: "leadCreatedAt",
    valueConfig: { type: "count" },
    baseMatch: { status: "lost" }, // <- adjust if your lost status is spelled differently
    allowedFilters: LEAD_FILTERS,
  },
  "leads.progress": {
    label: "Progress Leads",
    Model: leadModel,
    dateField: "leadCreatedAt",
    valueConfig: { type: "count" },
    baseMatch: { status: { $nin: ["won", "lost"] } }, // everything still open
    allowedFilters: LEAD_FILTERS,
  },

  // --- EMAIL / OUTREACH ---
  "emails.initial": {
    label: "Initial Emails Sent",
    Model: EmailMessage,
    dateField: "createdAt",
    valueConfig: { type: "count" },
    baseMatch: { interactionType: "initial" },
    allowedFilters: [["jobHolder", "senderName"]],
  },
  "emails.replies": {
    label: "Replies Sent",
    Model: EmailMessage,
    dateField: "createdAt",
    valueConfig: { type: "count" },
    baseMatch: { interactionType: "reply" },
    allowedFilters: [["jobHolder", "senderName"]],
  },

  // --- PROPOSALS ---
  "proposals.count": {
    label: "Proposal Count",
    Model: proposalModel,
    dateField: "createdAt",
    valueConfig: { type: "count" },
    baseMatch: {},
    allowedFilters: [
      ["source", "source"],
      ["jobHolder", "jobHolder"],
    ],
  },

  // --- TARGETS (from goalModel, same as getWonLeadData) ---
  // These use `fetch` instead of Model/dateField: goals are keyed by user _id, not name.
  // A metric with `fetch` gets ({ start, end, users, query }) and returns { [userName]: number }.
  "targets.leadValue": {
    label: "Target Lead Value",
    fetch: (ctx) => fetchGoalTargetsByUser({ ...ctx, goalType: "Target Lead Value" }),
  },
  "targets.leadCount": {
    label: "Target Lead Count",
    fetch: (ctx) => fetchGoalTargetsByUser({ ...ctx, goalType: "Target Lead Count" }),
  },

  // --- JOBS ---
  "jobs.prepared": {
    label: "Jobs Prepared",
    Model: clientModel,
    dateField: "currentDate",
    valueConfig: { type: "count" },
    baseMatch: { status: { $eq: "completed" }, prepared: { $exists: true } },
    allowedFilters: [
      ["source", "source"],
      ["jobHolder", "prepared"],
    ],
  },
  "jobs.review": {
    label: "Jobs Review",
    Model: clientModel,
    dateField: "currentDate",
    valueConfig: { type: "count" },
    baseMatch: { status: { $eq: "completed" }, review: { $exists: true } },
    allowedFilters: [
      ["source", "source"],
      ["jobHolder", "review"],
    ],
  },
  "jobs.filed": {
    label: "Jobs Filed",
    Model: clientModel,
    dateField: "currentDate",
    valueConfig: { type: "count" },
    baseMatch: { status: { $eq: "completed" }, filed: { $exists: true } },
    allowedFilters: [
      ["source", "source"],
      ["jobHolder", "filed"],
    ],
  },
};

const totalSales = (v) => (v["sales.new"] || 0) + (v["sales.subscription"] || 0);

/**
 * THE TABLE, split into GROUPS. Each group becomes a divider row (with its own
 * select-all checkbox) in the UI and a banded header row in the Excel export.
 *
 * Group:  { key, label, rows: [ ...row objects ] }
 *
 * Row:
 *  key        unique across ALL groups (also used by ?rows=a,b,c for selecting / exporting)
 *  label      text in the first column
 *  format     "number" | "currency" | "percent"   (UI + Excel number format)
 *  metric     one metric key                 -> cell = that metric's value
 *  deps +     several metric keys + formula  -> cell = calculate({ [dep]: value })
 *  calculate
 *
 *  teamTotal  (optional) how the Team Total cell is built:
 *     omitted / "sum" -> metric rows: sum of the users.
 *                        deps rows: same formula run on the SUMMED deps
 *                        (so Conversion % = team won / team received, not an average of %)
 *     "avg" | "max" | "min" -> aggregates the users' displayed cells (nulls skipped)
 *     function({ cells, users, read }) -> anything you like
 *
 * To add a KPI later: add its metric to `kpiMetrics` (if it isn't there yet),
 * then add one row object to the group it belongs to.
 * To add a group: add one { key, label, rows } object; to reorder, move it.
 */
export const kpiTableGroups = [
  {
    key: "targets",
    label: "Targets & Achievement",
    // Value achievement = New Sales (won lead value) / Target Lead Value,
    // count achievement = Leads Won / Target Lead Count.
    rows: [
      { key: "salesTarget", label: "Sales Target (£)", format: "currency", metric: "targets.leadValue" },
      {
        key: "targetAchievement",
        label: "Target Achievement (%)",
        format: "percent",
        deps: ["sales.new", "targets.leadValue"],
        calculate: (v) => achievement(v["sales.new"], v["targets.leadValue"]),
      },
      // { key: "leadCountTarget", label: "Lead Count Target", format: "number", metric: "targets.leadCount" },
      // {
      //   key: "leadCountAchievement",
      //   label: "Lead Count Achievement (%)",
      //   format: "percent",
      //   deps: ["leads.won", "targets.leadCount"],
      //   calculate: (v) => achievement(v["leads.won"], v["targets.leadCount"]),
      // },
    ],
  },

  {
    key: "sales",
    label: "Sales",
    rows: [
      
      { key: "newSales", label: "New Sales (£)", format: "currency", metric: "sales.new" },
      {
        key: "subscriptionSales",
        label: "Subscription Sales (£)",
        format: "currency",
        metric: "sales.subscription",
      },

      {
        key: "totalSales",
        label: "Total Sales (£)",
        format: "currency",
        deps: ["sales.new", "sales.subscription"],
        calculate: totalSales,
      },


      // { key: "subscriptionCount", label: "Subscription Count", format: "number", metric: "subscriptions.count" },
      // {
      //   key: "subscriptionValue",
      //   label: "Subscription Value (£)",
      //   format: "currency",
      //   metric: "subscriptions.value",
      // },
    ],
  },

  {
    key: "leads",
    label: "Leads",
    rows: [
      
      { key: "leadsReceived", label: "Leads Received", format: "number", metric: "leads.total" },
      { key: "progressLeads", label: "Progress Leads", format: "number", metric: "leads.progress" },
      { key: "lostLeads", label: "Lost Leads", format: "number", metric: "leads.lost" },

      { key: "leadsWon", label: "Leads Won (Clients)", format: "number", metric: "leads.won" },
      {
        key: "conversion",
        label: "Conversion Rate (%)",
        format: "percent",
        deps: ["leads.total", "leads.won"],
        calculate: (v) => pct(v["leads.won"], v["leads.total"]),
      },
    ],
  },

  {
    key: "outreach",
    label: "Outreach",
    rows: [
      { key: "emailsSent", label: "Initial Emails Sent", format: "number", metric: "emails.initial" },
      { key: "repliesSent", label: "Replies Sent", format: "number", metric: "emails.replies" },
      { key: "proposalsSent", label: "Proposal Sent", format: "number", metric: "proposals.count" },
    ],
  },

  {
    key: "jobs",
    label: "Jobs",
    rows: [
      { key: "jobsPrepared", label: "Jobs Prepared", format: "number", metric: "jobs.prepared" },
      { key: "jobsReviewed", label: "Jobs Reviewed", format: "number", metric: "jobs.review" },
      { key: "jobsFiled", label: "Jobs Filed", format: "number", metric: "jobs.filed" },
    ],
  },
];

// Flat, ordered list the service works with. Each row remembers which group it is in.
export const kpiTableRows = kpiTableGroups.flatMap((g) =>
  g.rows.map((r) => ({ ...r, group: g.key, groupLabel: g.label })),
);