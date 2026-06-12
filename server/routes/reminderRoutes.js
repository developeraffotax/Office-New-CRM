import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  completeReminder,
  createReminder,
  deleteReminder,
  getDueReminders,
 
  getDueRemindersCount,
 
  getRemindersByTaskId,
 
  markAllAsRead,
 
  markAsReadReminder,
 
  snoozeReminder,
  updateReminder,
} from "../controllers/reminderController.js";
 

const router = express.Router();

// Create Reminder
router.post("/create/reminder", requiredSignIn, createReminder);

// Update Reminder
router.put("/update/reminder/:reminderId", requiredSignIn, updateReminder);

// Get Reminder
router.get("/fetch/reminder", requiredSignIn, getDueReminders);

// get reminders by taskid
router.get("/fetch/reminders/:taskId", requiredSignIn, getRemindersByTaskId);

router.get("/fetch/remindersCount", requiredSignIn, getDueRemindersCount);

// Delete Reminder
router.delete("/delete/reminder/:reminderId", requiredSignIn, deleteReminder);


// PUT - Complete reminder  
router.put("/:id/complete", completeReminder);

router.put("/:id/markAsRead", markAsReadReminder);
router.put("/markAllAsRead", requiredSignIn , markAllAsRead );

// PUT - Snooze reminder (update scheduledAt)
router.put("/:id", snoozeReminder);


export default router;
