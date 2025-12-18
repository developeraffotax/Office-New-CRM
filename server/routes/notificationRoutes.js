import express from "express";
import {
  dismissAllNotification,
  dismissNotification,
  getNotification,
  ticketNotification,
  updateAllNotification,
  updateNotification,
} from "../controllers/notificationController.js";
import { requiredSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get Notification
router.get("/get/notification/:id", getNotification);

// Update Notification
router.put("/update/notification/:id", requiredSignIn, updateNotification);
router.put("/dismiss/notification/:id", requiredSignIn, dismissNotification);

// Mark All Notification
router.put("/marks/all/:id", requiredSignIn, updateAllNotification);
router.put("/dismiss/all/:id", requiredSignIn, dismissAllNotification);

// Get Ticket Notifications
router.get("/ticket/notification/:id", ticketNotification);

export default router;
