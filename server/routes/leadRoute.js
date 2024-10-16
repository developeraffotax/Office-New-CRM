import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  createLead,
  deleteLead,
  getAlllostLead,
  getAllProgressLead,
  getAllWonLead,
  getSingleLead,
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

export default router;
