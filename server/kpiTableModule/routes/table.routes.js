import express from "express";
import { exportKpiTable, getKpiTable, getKpiTableRows } from "../controllers/table.controller.js";
 

const router = express.Router();

// Mounted at /api/v1/kpi-table (see server.js), so:
router.get("/", getKpiTable);          // GET /api/v1/kpi-table
router.get("/rows", getKpiTableRows);  // GET /api/v1/kpi-table/rows
router.get("/export", exportKpiTable); // GET /api/v1/kpi-table/export

export default router;