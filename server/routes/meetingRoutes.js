import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  createMeeting,
  deleteMeeting,
  fetchMeeting,
  getAllMeetings,
  updateMeeting,
} from "../controllers/meetingController.js";

const router = express.Router();

// Create Meeting
router.post("/create/meeting", requiredSignIn, createMeeting);
// Update Meeting
router.put("/update/meeting/:id", requiredSignIn, updateMeeting);
// Fetch All
router.post("/fetch/meetings", getAllMeetings);
// Meeting Detail
router.post("/meeting/detail/:id", fetchMeeting);
// Delete Meeting
router.post("/create/meeting", requiredSignIn, deleteMeeting);
export default router();
