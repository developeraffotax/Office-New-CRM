import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  copyComplaint,
  createComplain,
  dashboardComplains,
  deleteComplains,
  fetchAllComplains,
  fetchSingleComplains,
  updateComplain,
} from "../controllers/complaintController.js";

const router = express.Router();

// Post Complaint
router.post("/create/complaint", requiredSignIn, createComplain);
// Update Complaint
router.put("/update/complaint/:id", requiredSignIn, updateComplain);
// Get All Complaints
router.get("/fetch/complaint", fetchAllComplains);
// Get Single Complaint
router.get("/fetch/single/complaint/:id", fetchSingleComplains);
// Delete Complaint
router.delete("/delete/complaint/:id", requiredSignIn, deleteComplains);
// Get All Complaints
router.get("/dashboard/complaint", dashboardComplains);

// Copy Complaint
router.post("/copy/:id", requiredSignIn, copyComplaint);

export default router;
