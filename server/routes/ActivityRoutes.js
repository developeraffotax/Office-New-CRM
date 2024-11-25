import express from "express";
import { fetchActivities } from "../controllers/ActivityController.js";

const router = express.Router();

// Fetch All Activities
router.get("/all/activies/:date", fetchActivities);

export default router;
