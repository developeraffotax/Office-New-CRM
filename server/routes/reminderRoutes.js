import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  completeReminder,
  createReminder,
  deleteReminder,
  getDueReminders,
 
  getDueRemindersCount,
 
  markAsReadReminder,
 
  snoozeReminder,
} from "../controllers/reminderController.js";
 

const router = express.Router();

// Create Reminder
router.post("/create/reminder", requiredSignIn, createReminder);

// Get Reminder
router.get("/fetch/reminder", requiredSignIn, getDueReminders);

router.get("/fetch/remindersCount", requiredSignIn, getDueRemindersCount);

// Delete Reminder
router.delete("/delete/reminder/:id", requiredSignIn, deleteReminder);

// PUT - Snooze reminder (update scheduledAt)
router.put("/:id", snoozeReminder);

// PUT - Complete reminder  
router.put("/:id/complete", completeReminder);

router.put("/:id/markAsRead", markAsReadReminder);

export default router;
