import clientModel from "../models/clientModel.js"; // adjust path to your actual Client model
import subscriptionModel from "../models/subscriptionModel.js"; // adjust path to your actual Subscription model
import { getTimeSeriesData, getMultiSeriesData } from "../services/chartService.js";
import { parseDateRange, applyFilters } from "../utils/chartHelpers.js";

/**
 * GET /api/v1/chart/sales/total
 * Sums Client.job... fee over time (jobs/clients booked in the range).
 * Query: start, end, groupBy(day|week|month|auto), source, clientType, partner, department
 */
export const getTotalSalesStats = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query);
    const { groupBy } = req.query;

    const matchQuery = applyFilters({}, req.query, [
      ["source", "source"],
      ["clientType", "clientType"],
      ["partner", "partner"],
      ["department", "job.jobHolder"],
    ]);

    const { labels, data, groupUnit } = await getTimeSeriesData({
      Model: clientModel,
      dateField: "currentDate",
      matchQuery,
      start,
      end,
      groupBy,
      valueConfig: { type: "sum", field: "fee" },
    });

    res.status(200).json({
      success: true,
      filters: { start, end, groupBy: groupUnit },
      labels,
      series: [{ name: "Total Sales", data }],
    });
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error fetching total sales stats",
    });
  }
};

/**
 * GET /api/v1/chart/sales/subscription
 * Sums Subscription.fee over time.
 * Query: start, end, groupBy(day|week|month|auto), source, clientType, partner, progressStatus
 */
export const getSubscriptionSalesStats = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query);
    const { groupBy } = req.query;

    const matchQuery = applyFilters({}, req.query, [
      ["source", "source"],
      ["clientType", "clientType"],
      ["partner", "partner"],
      ["progressStatus", "progressStatus"],
    ]);

    const { labels, data, groupUnit } = await getTimeSeriesData({
      Model: subscriptionModel,
      dateField: "currentDate",
      matchQuery,
      start,
      end,
      groupBy,
      valueConfig: { type: "sum", field: "fee" },
    });

    res.status(200).json({
      success: true,
      filters: { start, end, groupBy: groupUnit },
      labels,
      series: [{ name: "Subscription Sales", data }],
    });
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error fetching subscription sales stats",
    });
  }
};

/**
 * GET /api/v1/chart/sales/overview
 * Total Sales + Subscription Sales as two aligned series on one label set —
 * for a single combined chart instead of two separate API calls on the frontend.
 * Query: start, end, groupBy(day|week|month|auto)
 */
export const getSalesOverviewStats = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query);
    const { groupBy } = req.query;

    const { labels, groupUnit, series } = await getMultiSeriesData([
      {
        name: "Total Sales",
        params: {
          Model: clientModel,
          dateField: "currentDate",
          start,
          end,
          groupBy,
          valueConfig: { type: "sum", field: "fee" },
        },
      },
      {
        name: "Subscription Sales",
        params: {
          Model: subscriptionModel,
          dateField: "currentDate",
          start,
          end,
          groupBy,
          valueConfig: { type: "sum", field: "fee" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      filters: { start, end, groupBy: groupUnit },
      labels,
      series,
    });
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error fetching sales overview stats",
    });
  }
};

/**
 * GET /api/v1/chart/orders/count
 * Counts Client records (jobs/orders) over time — backend replacement
 * for the old frontend-side CountChart filtering.
 * Query: start, end, groupBy(day|week|month|auto), source, clientType, partner, department
 */
export const getOrdersCountStats = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query);
    const { groupBy } = req.query;

    const matchQuery = applyFilters({ status: { $ne: "completed" } }, req.query, [
      ["source", "source"],
      ["clientType", "clientType"],
      ["partner", "partner"],
      ["department", "job.jobHolder"],
    ]);

    const { labels, data, groupUnit } = await getTimeSeriesData({
      Model: clientModel,
      dateField: "currentDate",
      matchQuery,
      start,
      end,
      groupBy,
      valueConfig: { type: "count" },
    });

    res.status(200).json({
      success: true,
      filters: { start, end, groupBy: groupUnit },
      labels,
      series: [{ name: "Orders", data }],
    });
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error fetching orders count stats",
    });
  }
};