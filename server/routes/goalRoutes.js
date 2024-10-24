import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  createGoal,
  deleteGoal,
  fetchAchievedDataByGoalComplete,
  fetchAchievedDataByGoalType,
  fetchAllGoal,
  fetchSingleGoal,
  updateGoal,
  updateGoalStatus,
} from "../controllers/goalsController.js";

const router = express.Router();

// Create Goal
router.post("/post/goal", requiredSignIn, createGoal);

// Update Goal
router.put("/update/goal/:id", requiredSignIn, updateGoal);

// Get Goal
router.get("/fetch/all/goals", fetchAchievedDataByGoalType);

// Fetch Complete
router.get("/fetch/complete/goals", fetchAchievedDataByGoalComplete);

// Get Single Goal
router.get("/fetch/single/goals/:id", fetchSingleGoal);

// Delete Goal
router.delete("/delete/goals/:id", requiredSignIn, deleteGoal);

// Update Goal Status
router.put("/upadate/goals/status/:id", requiredSignIn, updateGoalStatus);

export default router;
