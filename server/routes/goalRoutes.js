import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create Goal
router.post("/create/goal", requiredSignIn);

// Update Goal
router.put("/update/goal/:id", requiredSignIn);

// Get Goal
router.get("/fetch/all/goals");

// Get Single Goal
router.get("/fetch/single/goals/:id");

// Delete Goal
router.delete("/delete/goals/:id", requiredSignIn);

// Update Goal Status
router.put("/upadate/goals/status/:id", requiredSignIn);

export default router;
