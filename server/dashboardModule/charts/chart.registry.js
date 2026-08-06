import clientModel from "../../models/jobsModel.js";
import subscriptionModel from "../../models/subscriptionModel.js";
import leadModel from "../../models/leadModel.js";

// Common filter mappings for Lead queries
const LEAD_FILTERS = [
  ["jobHolder", "jobHolder"],
  ["source", "source"],
  ["lead_Source", "lead_Source"],
  ["department", "department"],
];

/**
 * Single-series charts registry.
 * Key = the ?chartKey or route param used to request data.
 */
export const chartRegistry = {
  // --- LEAD CHARTS ---
  "leads.total": {
    label: "Total Leads",
    Model: leadModel,
    dateField: "leadCreatedAt",
    valueConfig: { type: "count" },
    baseMatch: {},
    allowedFilters: [...LEAD_FILTERS, ["status", "status"]],
  },

  // "leads.won": {
  //   label: "Won Leads",
  //   Model: leadModel,
  //   dateField: "wonAt",
  //   valueConfig: { type: "count" },
  //   baseMatch: { status: "won" },
  //   allowedFilters: LEAD_FILTERS,
  // },

  "leads.won": {
    label: "Won Leads",
    Model: leadModel,
    dateField: "leadCreatedAt",
    valueConfig: { type: "count" },
    baseMatch: { status: "won" },
    allowedFilters: LEAD_FILTERS,
  },





  // --- SALES CHARTS ---
  "sales.new": {
    label: "New Sales",
    Model: clientModel,
    dateField: "currentDate",
    valueConfig: { type: "sum", field: "fee" },
    baseMatch: {
      status: { $eq: "process" },
      "job.jobStatus": { $ne: "Inactive" },
    },
    allowedFilters: [
      ["department", "job.jobName"],
      ["jobHolder", "job.jobHolder"],
    ],
  },

  "sales.subscription": {
    label: "Subscription Sales",
    Model: subscriptionModel,
    dateField: "job.billingStart",
    dateEndField: "job.billingEnd",
    rangeOverlap: true,
    valueConfig: { type: "sum", field: "job.fee" },
    baseMatch: { progressStatus: "completed" },
    allowedFilters: [
      ["source", "source"],
      ["jobHolder", "job.jobHolder"],
    ],
  },

  // "orders.count": {
  //   label: "Orders",
  //   Model: clientModel,
  //   dateField: "currentDate",
  //   valueConfig: { type: "count" },
  //   baseMatch: { status: { $ne: "completed" } },
  //   allowedFilters: [
  //     ["source", "source"],
  //     ["clientType", "clientType"],
  //     ["partner", "partner"],
  //     ["department", "job.jobHolder"],
  //   ],
  // },
};









/**
 * Composite charts — overlaying or computing several registry entries.
 */
export const multiChartRegistry = {
  "sales.overview": {
    label: "Sales Overview",
    series: [
      { name: "Total Sales", chartKey: "sales.new" },
      {
        name: "Subscription Sales",
        chartKey: "sales.subscription",
        overrides: { dateField: "currentDate", rangeOverlap: false, dateEndField: undefined },
      },
    ],
  },

  "leads.conversion": {
    label: "Lead Conversion Rate",
    series: [
      { name: "Total Leads", chartKey: "leads.total" },
      { name: "Won Leads", chartKey: "leads.won" },
    ],
    // Optional post-processing transformation for computed/derived series
    transform: ({ labels, groupUnit, series }) => {
      const totalSeries = series.find((s) => s.name === "Total Leads")?.data || [];
      const wonSeries = series.find((s) => s.name === "Won Leads")?.data || [];

      const conversionData = totalSeries.map((total, i) => {
        const won = wonSeries[i] || 0;
        return total > 0 ? Number(((won / total) * 100).toFixed(2)) : 0;
      });

      return {
        labels,
        groupUnit,
        series: [
          { name: "Conversion %", data: conversionData },
          // { name: "Total Leads", data: totalSeries },
          // { name: "Won Leads", data: wonSeries },
        ],
      };
    },
  },
};