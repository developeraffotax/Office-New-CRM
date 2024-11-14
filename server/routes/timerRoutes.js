import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  addTimerMannually,
  addTimerStatus,
  deleteTimer,
  getAllHolidays,
  getAllTimers,
  getTimerStatus,
  removeTimerStatus,
  runningTimers,
  singleTimer,
  startTimer,
  stopTimer,
  timerStatus,
  totalTime,
  updateHoliday,
  updateJobHolderName,
  updateTimer,
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

// Get All Timers data
router.get("/get/all/timers", getAllTimers);

// Add Timer Manually
router.post("/add/timer/manually", requiredSignIn, addTimerMannually);

// Update Timer
router.put("/update/timer/:id", requiredSignIn, updateTimer);

// Delete Timer
router.delete("/delete/timer/:id", requiredSignIn, deleteTimer);

// Single timer
router.get("/single/timer/:id", requiredSignIn, singleTimer);

// Update Name
router.put("/update/jobholder", updateJobHolderName);
// Running Timers
router.get("/running/timers", runningTimers);
// Update Holiday
router.put("/update/holiday/:id", updateHoliday);
// Fetch Holidays
router.get("/fetch/holidays", getAllHolidays);

export default router;
