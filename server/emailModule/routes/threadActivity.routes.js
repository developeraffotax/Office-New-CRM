import express from "express";
import { getThreadActivities } from "../controllers/threadActivity.controller.js";
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
 

const router = express.Router();

/**
 * GET activities for a thread
 *
 * Query:
 * ?page=1
 * ?limit=20
 */
router.get(
  "/:threadId",
  requiredSignIn,
  getThreadActivities
);

export default router;