import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  createLabel,
  deleteLabel,
  getAllLabelsByJob,
  getAllLabelsByTask,
  getDataLabels,
  updateLabel,
} from "../controllers/labelController.js";

const router = express.Router();

// Create
router.post("/create/label", requiredSignIn, createLabel);

// Get Job
router.get("/get/labels", getAllLabelsByJob);

// Task Lable
router.get("/get/labels/task", getAllLabelsByTask);

// Data Lable
router.get("/data/labels", getDataLabels);

// Delete
router.delete("/delete/label/:id", requiredSignIn, deleteLabel);

// Update Label
router.put("/update/label/:id", requiredSignIn, updateLabel);

export default router;
