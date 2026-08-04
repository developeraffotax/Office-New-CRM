import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  addDatalabel,
  copySubscription,
  createSubscription,
  deleteSubscription,
  fetchAllSubscription,
  fetchSingleSubscription,
  markSubscriptionCompleted,
  markSubscriptionInProgress,
  updateBulkSubscription,
  updateSingleField,
  updateSubscription,
} from "../controllers/subscriptionController.js";

const router = express.Router();

// Create Subscription
router.post("/create/subscription", requiredSignIn, createSubscription);

// Update Subscription
router.put("/update/subscription/:id", requiredSignIn, updateSubscription);

// Update Single Subscription
router.put("/update/single/:id", requiredSignIn, updateSingleField);

// Get All Scubscription
router.get("/fetch/all", requiredSignIn, fetchAllSubscription);

// Get Single Scubscription
router.get("/fetch/single/:id", fetchSingleSubscription);

// Delete Scubscription
router.delete("/delete/:id", requiredSignIn, deleteSubscription);
// Subscription
router.put("/lable/:id", requiredSignIn, addDatalabel);
//
router.put("/multiple/updates", requiredSignIn, updateBulkSubscription);




router.patch("/:id/in-progress", requiredSignIn, markSubscriptionInProgress);
router.patch("/:id/completed", requiredSignIn,  markSubscriptionCompleted);
router.post("/:id/copy", requiredSignIn,  copySubscription);

export default router;
