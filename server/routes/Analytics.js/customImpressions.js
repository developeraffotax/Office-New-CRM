import express from "express";
import {
  getAllEvents,
  storeEvent,
} from "../../controllers/Analytics/analyticsApi.js";

const router = express.Router();

// Post https://backend.affotax.com/api/v1/analytics/events (pageUrl, eventType)
router.post("/events", storeEvent);

// Get All Events
router.get("/fetch/events", getAllEvents);

export default router;
