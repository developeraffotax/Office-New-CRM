import express from "express";
import { getChartData, getMultiChartData } from "../controllers/dashboard.controller.js";
import { getStats, getUniqueClientJobsStats } from "../controllers/stats.controller.js";

const router = express.Router();

// ==========================================
// 1. Universal Parameterized Routes (Recommended)
// ==========================================
// Usage: GET /api/v1/chart/single/leads.total
// Usage: GET /api/v1/chart/multi/leads.conversion
router.get("/single/:chartKey", getChartData);
router.get("/multi/:chartKey", getMultiChartData);


router.get("/stats", getStats);
router.get("/stats/unique-clients", getUniqueClientJobsStats);





// ==========================================
// 2. Legacy Route Aliases (Backward Compatibility)
// ==========================================
// Middleware to inject chartKey parameters into legacy routes
const setChartKey = (key, isMulti = false) => (req, res, next) => {
  req.params.chartKey = key;
  return isMulti ? getMultiChartData(req, res, next) : getChartData(req, res, next);
};

// Lead Routes
router.get("/leads/chart/total", setChartKey("leads.total"));
router.get("/leads/chart/won", setChartKey("leads.won"));
router.get("/leads/chart/conversion", setChartKey("leads.conversion", true));

// Sales Routes
router.get("/sales/chart/new_sales", setChartKey("sales.new"));
router.get("/sales/chart/subscriptions", setChartKey("sales.subscription"));
router.get("/sales/chart/total", setChartKey("sales.total", true));



// Subscriptions Routes
router.get("/subscriptions/chart/count", setChartKey("subscriptions.count"));
router.get("/subscriptions/chart/value", setChartKey("subscriptions.value"));










export default router;