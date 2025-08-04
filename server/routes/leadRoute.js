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
import { updateSendReceivedLeads } from "../utils/updateSendReceivedLeads.js";

const router = express.Router();

// Create Lead
router.post("/create/lead", createLead);

// Update Lead
router.put("/update/lead/:id", requiredSignIn, updateLead);

// Get Progress Lead
router.get("/fetch/progress/lead", requiredSignIn, getAllProgressLead);

// Get Won Lead
router.get("/fetch/won/lead", requiredSignIn, getAllWonLead);

// Get Lost Lead
router.get("/fetch/lost/lead", requiredSignIn, getAlllostLead);

// Get Single Lead
router.get("/fetch/single/lead/:id", getSingleLead);

// Delete Lead
router.delete("/delete/lead/:id", deleteLead);

// Dashboard
router.get("/dashboard/lead", getdashboardLead);








// Update Bulk Leads
router.put("/update/bulk/leads", requiredSignIn, isAdmin, updateBulkLeads);




// Protected GET route to trigger the update manually
router.get("/update-leads", async (req, res) => {
  try {
    await updateSendReceivedLeads();
    res.status(200).json({ message: "Leads updated successfully." });
  } catch (error) {
    console.error("Manual update error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});





export default router;
