import express from "express";
import { isAdmin, requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  createLead,
  deleteLead,
  getAlllostLead,
  getAllProgressLead,
  getAllWonLead,
  getdashboardLead,
  getSingleLead,
  updateBulkLeads,
  updateLead,
} from "../controllers/leadController.js";

const router = express.Router();

// Create Lead
router.post("/create/lead", createLead);

// Update Lead
router.put("/update/lead/:id", requiredSignIn, updateLead);

// Get Progress Lead
router.get("/fetch/progress/lead", getAllProgressLead);

// Get Won Lead
router.get("/fetch/won/lead", getAllWonLead);

// Get Lost Lead
router.get("/fetch/lost/lead", getAlllostLead);

// Get Single Lead
router.get("/fetch/single/lead/:id", getSingleLead);

// Delete Lead
router.delete("/delete/lead/:id", deleteLead);

// Dashboard
router.get("/dashboard/lead", getdashboardLead);








// Update Bulk Leads
router.put("/update/bulk/leads", requiredSignIn, isAdmin, updateBulkLeads);

export default router;
