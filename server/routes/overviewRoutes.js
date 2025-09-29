import express from "express";
 
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import { getOverview } from "../controllers/overviewController.js";



const router = express.Router();

// Get Notification
router.get("/", requiredSignIn, getOverview);

 

// Get Ticket Notifications
// router.get("/ticket/notification/:id", ticketNotification);

export default router;
