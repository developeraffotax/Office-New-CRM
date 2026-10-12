import leadModel from "../../models/leadModel.js";
// import targetModel from "../../models/targetModel.js";   // <- wherever your targets live

export const TEAM_TOTAL = "Team Total";

/**
 * A custom metric fetcher can return this key to OVERRIDE the team value
 * (otherwise the team value is the sum of the users' values).
 * e.g. return { Ali: 5000, Sara: 4000, [TEAM_KEY]: 12000 }  // team target isn't 5000 + 4000
 */
export const TEAM_KEY = "__team__";

const LEAD_FILTERS = [
  ["jobHolder", "jobHolder"],
  ["source", "lead_Source"],
  ["department", "department"],
];

// percent helper -> null (shown as "–") when there is nothing to divide by
const pct = (a, b) => (b ? Number(((a / b) * 100).toFixed(2)) : null);

/**
 * Metrics only the table needs. Same shape as chartRegistry entries, so they go
 * through the same aggregation. Anything not found here or in `customMetrics`
 * is looked up in chartRegistry.
 */
export const kpiOnlyMetrics = {
  "leads.progress": {
    label: "Progress Leads",
    Model: leadModel,
    dateField: "leadCreatedAt",
    valueConfig: { type: "count" },
    baseMatch: { status: { $nin: ["won", "lost"] } }, // adjust to your status enum
    allowedFilters: LEAD_FILTERS,
  },
  "leads.lost": {
    label: "Lost Leads",
    Model: leadModel,
    dateField: "leadCreatedAt",
    valueConfig: { type: "count" },
    baseMatch: { status: "lost" }, // adjust if your status value differs
    allowedFilters: LEAD_FILTERS,
  },

  /**
   * TARGETS.
   * Assumes ONE target document per user per month, e.g.
   *   { userName: "Ali", month: ISODate("2026-10-01"), salesTarget: 10000 }
   * Targets for every month that starts inside the selected range are summed,
   * so "This Year" = 12 months of target, "This Month" = 1.
   * Change Model / field names to match how your Targets toggle stores them.
   * If targets reference users by _id, either store the name too or swap this
   * entry for a customMetrics fetcher that resolves ids -> names.
   */
  // "sales.target": {
  //   label: "Sales Target",
  //   Model: targetModel,
  //   dateField: "month",
  //   valueConfig: { type: "sum", field: "salesTarget" },
  //   baseMatch: {},
  //   allowedFilters: [["jobHolder", "userName"]],
  // },
};

/**
 * Metrics that don't fit "one model, one aggregation".
 * Fetcher gets ({ start, end, users, query }) and returns { [userName]: number }
 * (optionally with [TEAM_KEY] to override the team value).
 */
export const customMetrics = {
  // Remove this stub once the real "sales.target" entry above is enabled.
  "sales.target": async () => ({}),

  // Example: a team-level target that isn't the sum of the users' targets
  // "sales.target": async ({ start, end }) => ({
  //   ...(await perUserTargets(start, end)),
  //   [TEAM_KEY]: await teamTarget(start, end),
  // }),
};

const totalSales = (v) => (v["sales.new"] || 0) + (v["sales.subscription"] || 0);

/**
 * THE TABLE. One object = one row.
 *
 *  key        unique id (also used by ?rows=a,b,c for selecting / exporting)
 *  label      text in the first column
 *  format     "number" | "currency" | "percent"   (UI + Excel number format)
 *  heat       optional: "achievement" colours the cell green at >= 100
 *  metric     one metric key              -> cell = that metric's value
 *  deps +     several metric keys + formula -> cell = calculate({ [dep]: value })
 *  calculate
 *
 *  teamTotal  how the Team Total cell is built:
 *     omitted / "sum" -> metric rows: sum of users.
 *                        deps rows: same formula run on the SUMMED deps
 *                        (so Conversion % = team won / team received, not an average of %)
 *     "avg" | "max" | "min" -> aggregates the users' displayed cells (nulls skipped)
 *     function({ cells, users, read }) -> anything you like.
 *        cells = the users' cell values, users = user names,
 *        read(metricKey, userOrTeam?) = raw metric value (defaults to the team's)
 *
 * To add a KPI later: add one object here. Nothing else changes.
 */
export const kpiTableRows = [
  {
    key: "salesTarget",
    label: "Sales Target (£)",
    format: "currency",
    metric: "sales.target",
  },
  {
    key: "targetAchievement",
    label: "Target Achievement (%)",
    format: "percent",
    heat: "achievement",
    deps: ["sales.new", "sales.subscription", "sales.target"],
    calculate: (v) => pct(totalSales(v), v["sales.target"]),
  },
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
  { key: "progressLeads", label: "Progress Leads", format: "number", metric: "leads.progress" },
  { key: "lostLeads", label: "Lost Leads", format: "number", metric: "leads.lost" },
  { key: "emailsSent", label: "Emails Sent", format: "number", metric: "emails.initial" },
  { key: "repliesSent", label: "Replies Sent", format: "number", metric: "emails.replies" },
  { key: "proposalsSent", label: "Proposal Sent", format: "number", metric: "proposals.count" },
  { key: "jobsPrepared", label: "Jobs Prepared", format: "number", metric: "jobs.prepared" },
  { key: "jobsReviewed", label: "Jobs Reviewed", format: "number", metric: "jobs.review" },
  { key: "jobsFiled", label: "Jobs Filed", format: "number", metric: "jobs.filed" },

  // --- examples of other team-total behaviours ---
  // { key: "avgDeal", label: "Avg Deal (£)", format: "currency", metric: "sales.new", teamTotal: "avg" },
  // {
  //   key: "topSeller", label: "Best Seller (£)", format: "currency", metric: "sales.new",
  //   teamTotal: ({ cells }) => Math.max(0, ...cells.filter((c) => typeof c === "number")),
  // },
];