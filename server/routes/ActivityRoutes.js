import express from "express";
import { createActivity, fetchActivities } from "../controllers/ActivityController.js";
import {   requiredSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Fetch All Activities
router.get("/all/activies/:date", fetchActivities);

// /api/v1/activies/create
router.post("/create", requiredSignIn , createActivity);

export default router;
