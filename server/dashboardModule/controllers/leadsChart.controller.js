import leadModel from "../../models/leadModel.js"; // adjust path to your actual Lead model
import { getTimeSeriesData } from "../services/chart.service.js";
import { parseDateRange, applyFilters } from "../utils/chartHelpers.js";

// query param -> schema field. "user" maps to leadUser; omit/pass "all" for every user.
const LEAD_FILTER_MAP = [
  ["jobHolder", "jobHolder"],
  ["source", "source"],
  ["lead_Source", "lead_Source"], // "Upwork" | "Fiverr" | "PPH" | "Google" | "CRM" | ...
  ["department", "department"],
];

/**
 * GET /api/v1/chart/leads/total
 * Counts leads created over time — every status, unless `status` is passed.
 * Query: start, end, groupBy(day|week|month|auto), user, source, lead_Source, department, status
 */
export const getTotalLeadsStats = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query);
    const { groupBy } = req.query;

    const matchQuery = applyFilters({}, req.query, [...LEAD_FILTER_MAP, ["status", "status"]]);

    const { labels, data, groupUnit } = await getTimeSeriesData({
      Model: leadModel,
      dateField: "leadCreatedAt",
      matchQuery,
      start,
      end,
      groupBy,
      valueConfig: { type: "count" },
    });

    res.status(200).json({
      success: true,
      filters: { start, end, user: req.query.jobHolder || "all", groupBy: groupUnit },
      labels,
      series: [{ name: "Total Leads", data }],
    });
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error fetching total leads stats",
    });
  }
};

/**
 * GET /api/v1/chart/leads/won
 * Counts leads with status = "won" over time. Bucketed by wonAt (when the
 * deal actually closed) by default — pass dateField=leadCreatedAt to bucket
 * by when the lead first came in instead.
 * Query: start, end, groupBy(day|week|month|auto), user, source, lead_Source, department, dateField
 */
export const getWonLeadsStats = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query);
    const { groupBy, dateField } = req.query;

    const matchQuery = applyFilters({ status: "won" }, req.query, LEAD_FILTER_MAP);

    const { labels, data, groupUnit } = await getTimeSeriesData({
      Model: leadModel,
      dateField: dateField === "leadCreatedAt" ? "leadCreatedAt" : "wonAt",
      matchQuery,
      start,
      end,
      groupBy,
      valueConfig: { type: "count" },
    });

    res.status(200).json({
      success: true,
      filters: { start, end, user: req.query.user || "all", groupBy: groupUnit },
      labels,
      series: [{ name: "Won Leads", data }],
    });
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error fetching won leads stats",
    });
  }
};

/**
 * GET /api/v1/chart/leads/conversion
 * % of leads created in each bucket that are (currently) status = "won".
 * Cohort-based: both the "total" and "won" counts bucket by leadCreatedAt,
 * so a period's percentage answers "of the leads that came in during this
 * window, what share converted" — not "how many deals closed this window"
 * (that's the /won endpoint, bucketed by wonAt).
 * Query: start, end, groupBy(day|week|month|auto), user, source, lead_Source, department
 */
export const getLeadConversionStats = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query);
    const { groupBy } = req.query;

    const baseMatch = applyFilters({}, req.query, LEAD_FILTER_MAP);

    const [totalResult, wonResult] = await Promise.all([
      getTimeSeriesData({
        Model: leadModel,
        dateField: "leadCreatedAt",
        matchQuery: baseMatch,
        start,
        end,
        groupBy,
        valueConfig: { type: "count" },
      }),
      getTimeSeriesData({
        Model: leadModel,
        dateField: "leadCreatedAt",
        matchQuery: { ...baseMatch, status: "won" },
        start,
        end,
        groupBy,
        valueConfig: { type: "count" },
      }),
    ]);

    const conversionData = totalResult.data.map((total, i) => {
      const won = wonResult.data[i] || 0;
      return total > 0 ? Number(((won / total) * 100).toFixed(2)) : 0;
    });

    res.status(200).json({
      success: true,
      filters: { start, end, user: req.query.user || "all", groupBy: totalResult.groupUnit },
      labels: totalResult.labels,
      series: [
        { name: "Conversion %", data: conversionData },
        { name: "Total Leads", data: totalResult.data },
        { name: "Won Leads", data: wonResult.data },
      ],
    });
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error fetching lead conversion stats",
    });
  }
};