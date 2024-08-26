import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  addTimerStatus,
  getTimerStatus,
  removeTimerStatus,
  startTimer,
  stopTimer,
  timerStatus,
  totalTime,
} from "../controllers/timerController.js";

const router = express.Router();

// Start Timer
router.post("/start/timer", requiredSignIn, startTimer);

// Stop Timer
router.put("/stop/timer/:id", requiredSignIn, stopTimer);

// Get timer Status
router.get("/status", requiredSignIn, timerStatus);

// Total time
router.get("/total_time/:id", requiredSignIn, totalTime);

// Add Timer Status
router.post("/timer_task/status", requiredSignIn, addTimerStatus);

// Remove timer Status
router.delete("/remove/timer_task/Status/:id", removeTimerStatus);

// Get Task Timer Status
router.get("/get/timer_task/Status/:id", getTimerStatus);

export default router;
