import express from "express";
import {
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

// Mark All Notification
router.put("/marks/all/:id", requiredSignIn, updateAllNotification);

// Get Ticket Notifications
router.get("/ticket/notification/:id", ticketNotification);

export default router;
