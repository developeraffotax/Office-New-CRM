import clientModel from "../../models/jobsModel.js";
import subscriptionModel from "../../models/subscriptionModel.js";
import proposalModel from "../../models/proposalModel.js";
import leadModel from "../../models/leadModel.js";
import EmailMessage from "../../emailModule/models/EmailMessage.js";

export const TEAM_TOTAL = "Team Total";

// Same filter mapping the chart registry uses for lead queries
const LEAD_FILTERS = [
  ["jobHolder", "jobHolder"],
  ["source", "lead_Source"],
  ["department", "department"],
];

// Same behaviour as the "leads.conversion" chart: 0 when there is nothing to divide by
const pct = (a, b) => (b > 0 ? Number(((a / b) * 100).toFixed(2)) : 0);

/**
 * Metrics the table can read. These are the SAME definitions the charts use
 * (copied from chartRegistry), so table numbers match chart numbers.
 *
 * Shape: Model, dateField, valueConfig, baseMatch, allowedFilters
 * (+ dateEndField / rangeOverlap if a metric is date-range based).
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
    allowedFilters: [
      ["source", "source"],
      ["jobHolder", "job.jobHolder"],
    ],
  },

  // --- LEADS ---
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
};

const totalSales = (v) => (v["sales.new"] || 0) + (v["sales.subscription"] || 0);

/**
 * THE TABLE. One object = one row.
 *
 *  key        unique id (also used by ?rows=a,b,c for selecting / exporting)
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
 *        cells = the users' cell values, users = user names,
 *        read(metricKey, userOrTeam?) = raw metric value (defaults to the team's)
 *
 * To add a KPI later: add its metric to `kpiMetrics` (if it isn't there yet),
 * then add one object here.
 */
export const kpiTableRows = [
  {
    key: "sales",
    label: "Sales (£)",
    format: "currency",
    deps: ["sales.new", "sales.subscription"],
    calculate: totalSales,
  },
  { key: "leadsWon", label: "Leads Won (Clients)", format: "number", metric: "leads.won" },
  {
    key: "conversion",
    label: "Conversion Rate (%)",
    format: "percent",
    deps: ["leads.total", "leads.won"],
    calculate: (v) => pct(v["leads.won"], v["leads.total"]),
  },
  { key: "leadsReceived", label: "Leads Received", format: "number", metric: "leads.total" },
  { key: "emailsSent", label: "Emails Sent", format: "number", metric: "emails.initial" },
  { key: "repliesSent", label: "Replies Sent", format: "number", metric: "emails.replies" },
  { key: "proposalsSent", label: "Proposal Sent", format: "number", metric: "proposals.count" },
  { key: "jobsPrepared", label: "Jobs Prepared", format: "number", metric: "jobs.prepared" },
  { key: "jobsReviewed", label: "Jobs Reviewed", format: "number", metric: "jobs.review" },
  { key: "jobsFiled", label: "Jobs Filed", format: "number", metric: "jobs.filed" },
];