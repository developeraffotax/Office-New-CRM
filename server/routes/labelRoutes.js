import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  createLabel,
  deleteLabel,
  getAllLabels,
} from "../controllers/labelController.js";

const router = express.Router();

// Create
router.post("/create/label", requiredSignIn, createLabel);

// Get
router.get("/get/labels", getAllLabels);

// Delete
router.delete("/delete/label/:id", requiredSignIn, deleteLabel);

export default router;
