import express from "express";
import {
  createQuality,
  deleteQualityCheck,
  getAllQualityChecks,
} from "../controllers/qualityCheckController.js";
import { requiredSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create Quality Check
router.post("/create/quality", requiredSignIn, createQuality);

// Get All Quality Check
router.get("/get/all", getAllQualityChecks);

// Delete Quality Check
router.delete("/delete/:id", requiredSignIn, deleteQualityCheck);

export default router;
