import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  allHrTask,
  createHrTask,
  deleteHrTask,
  hrTaskDetail,
  updateHrTask,
} from "../controllers/hrController.js";

const router = express.Router();

// Create task
router.post("/create/task", requiredSignIn, createHrTask);

// Update
router.put("/edit/task/:id", requiredSignIn, updateHrTask);

// Fetch All
router.get("/all/tasks", allHrTask);

// Task Detail
router.get("/task/detail/:id", hrTaskDetail);

// Delete
router.delete("/remove/task/:id", requiredSignIn, deleteHrTask);

export default router;
