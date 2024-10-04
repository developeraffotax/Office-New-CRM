import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  createSubscription,
  deleteSubscription,
  fetchAllSubscription,
  fetchSingleSubscription,
  updateSubscription,
} from "../controllers/subscriptionController.js";

const router = express.Router();

// Create Subscription
router.post("/create/subscription", requiredSignIn, createSubscription);

// Update Subscription
router.put("/update/subscription/:id", requiredSignIn, updateSubscription);

// Get All Scubscription
router.get("/fetch/all", fetchAllSubscription);

// Get Single Scubscription
router.get("/fetch/single/:id", fetchSingleSubscription);

// Delete Scubscription
router.delete("/delete/all", requiredSignIn, deleteSubscription);

export default router;
