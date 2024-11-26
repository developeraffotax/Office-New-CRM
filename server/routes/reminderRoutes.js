import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  createReminder,
  deleteReminder,
  getReminderByUsers,
} from "../controllers/reminderController.js";

const router = express.Router();

// Create Reminder
router.post("/create/reminder", requiredSignIn, createReminder);

// Get Reminder
router.get("/fetch/reminder", requiredSignIn, getReminderByUsers);

// Delete Reminder
router.delete("/delete/reminder/:id", requiredSignIn, deleteReminder);

export default router;
