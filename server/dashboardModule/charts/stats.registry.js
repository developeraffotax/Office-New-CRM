import leadModel from "../../models/leadModel.js";
import subscriptionModel from "../../models/subscriptionModel.js";

const LEAD_FILTERS = [
  ["jobHolder", "jobHolder"],
  ["source", "source"],
  ["lead_Source", "lead_Source"],
  ["department", "department"],
];

const SUBSCRIPTION_FILTERS = [
  ["source", "source"],
  ["jobHolder", "job.jobHolder"],
];

export const statsRegistry = {
  // ---------------- SALES ----------------

  "sales.new": {
    label: "New Sales",
    Model: leadModel,
    dateField: "wonAt",
    valueConfig: {
      type: "sum",
      field: "value",
    },
    baseMatch: {
      status: "won",
    },
    allowedFilters: LEAD_FILTERS,
  },

  "sales.subscription": {
    label: "Subscription Sales",
    Model: subscriptionModel,
    dateField: "completedAt",
    valueConfig: {
      type: "sum",
      field: "job.fee",
    },
    baseMatch: {
      progressStatus: "completed",
    },
    allowedFilters: SUBSCRIPTION_FILTERS,
  },

  // computed from the above two
  "sales.total": {
    label: "Total Sales",
    type: "computed",
    calculate: (stats) => ({
      value:
        (stats["sales.new"]?.value || 0) +
        (stats["sales.subscription"]?.value || 0),

      previous:
        (stats["sales.new"]?.previous || 0) +
        (stats["sales.subscription"]?.previous || 0),
    }),
  },

  // ---------------- LEADS ----------------

  "leads.total": {
    label: "Total Leads",
    Model: leadModel,
    dateField: "leadCreatedAt",
    valueConfig: {
      type: "count",
    },
    baseMatch: {},
    allowedFilters: [...LEAD_FILTERS, ["status", "status"]],
  },

  "leads.won": {
    label: "Won Leads",
    Model: leadModel,
    dateField: "leadCreatedAt",
    valueConfig: {
      type: "count",
    },
    baseMatch: {
      status: "won",
    },
    allowedFilters: LEAD_FILTERS,
  },

  "leads.conversion": {
    label: "Conversion Rate",
    type: "computed",
    calculate: (stats) => {
      const total = stats["leads.total"]?.value || 0;
      const won = stats["leads.won"]?.value || 0;

      const previousTotal = stats["leads.total"]?.previous || 0;
      const previousWon = stats["leads.won"]?.previous || 0;

      return {
        value: total ? Number(((won / total) * 100).toFixed(2)) : 0,

        previous: previousTotal
          ? Number(((previousWon / previousTotal) * 100).toFixed(2))
          : 0,
      };
    },
  },

  // ---------------- SUBSCRIPTIONS ----------------

  "subscriptions.count": {
    label: "Subscription Count",
    Model: subscriptionModel,
    dateField: "job.billingStart",
    dateEndField: "job.billingEnd",
    rangeOverlap: true,
    valueConfig: {
      type: "count",
    },
    baseMatch: {},
    allowedFilters: SUBSCRIPTION_FILTERS,
  },

  "subscriptions.value": {
    label: "Subscription Value",
    Model: subscriptionModel,
    dateField: "job.billingStart",
    dateEndField: "job.billingEnd",
    rangeOverlap: true,
    valueConfig: {
      type: "sum",
      field: "job.fee",
    },
    baseMatch: {},
    allowedFilters: SUBSCRIPTION_FILTERS,
  },
};