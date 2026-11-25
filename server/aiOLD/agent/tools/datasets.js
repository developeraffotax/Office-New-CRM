// ai/agent/tools/datasets.js — spreadsheet tools. The model only ever sees schemas and small results.
import { listDatasets, getDataset, describe, queryRows, aggregateRows, OPS, METRICS } from "../../datasets/datasetQuery.js";

const filters = {
  type: "array",
  maxItems: 10,
  description: "Conditions that rows must match (all of them).",
  items: {
    type: "object",
    properties: {
      column: { type: "string", description: "Column key or label." },
      op: { type: "string", enum: OPS },
      value: { type: "string", description: "Value to compare, as text. Dates as YYYY-MM-DD. Omit for is_empty / not_empty / in." },
      values: { type: "array", items: { type: "string" }, description: "Only for op=in." },
    },
    required: ["column", "op"],
  },
};
const datasetId = { type: "string", description: "Dataset id from list_datasets." };

export const datasetTools = [
  {
    name: "list_datasets",
    description: "List the spreadsheets (datasets) you can query, with their row counts and column names.",
    parameters: { type: "object", properties: {} },
    async execute(_in, ctx) {
      const list = await listDatasets(ctx.user, ctx.scope);
      return list.map((d) => ({
        id: String(d._id),
        name: d.name,
        rows: d.rowCount,
        product: d.source?.product,
        columns: d.columns.map((c) => c.label),
      }));
    },
  },
  {
    name: "describe_dataset",
    description: "Get a dataset's columns (key, label, type) and its first rows. Call this before querying a dataset you haven't seen.",
    parameters: { type: "object", properties: { datasetId }, required: ["datasetId"] },
    async execute(input, ctx) {
      return describe(await getDataset(ctx.user, input.datasetId));
    },
  },
  {
    name: "query_dataset",
    description: "Find rows in a dataset. Returns up to 50 matching rows plus the total number of matches. Use it to look up specific records.",
    parameters: {
      type: "object",
      properties: {
        datasetId,
        filters,
        select: { type: "array", items: { type: "string" }, description: "Columns to return (default: all)." },
        sort: {
          type: "object",
          properties: { column: { type: "string" }, direction: { type: "string", enum: ["asc", "desc"] } },
          required: ["column"],
        },
        limit: { type: "integer", minimum: 1, maximum: 50, description: "Default 20." },
      },
      required: ["datasetId"],
    },
    async execute(input, ctx) {
      return queryRows(await getDataset(ctx.user, input.datasetId), input);
    },
  },
  {
    name: "aggregate_dataset",
    description: "Count, sum, average, min or max over a dataset, optionally grouped by columns. Use it for any totals or counts. Never add numbers up yourself.",
    parameters: {
      type: "object",
      properties: {
        datasetId,
        filters,
        groupBy: { type: "array", items: { type: "string" }, maxItems: 3, description: "Columns to group by." },
        metrics: {
          type: "array",
          maxItems: 5,
          description: "What to compute. count needs no column.",
          items: {
            type: "object",
            properties: { op: { type: "string", enum: METRICS }, column: { type: "string" } },
            required: ["op"],
          },
        },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max groups to return (default 50)." },
      },
      required: ["datasetId", "metrics"],
    },
    async execute(input, ctx) {
      return aggregateRows(await getDataset(ctx.user, input.datasetId), input);
    },
  },
];