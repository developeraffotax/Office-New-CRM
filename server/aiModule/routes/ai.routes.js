

import express from "express";
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
import { generateEmailReplies,  } from "../controllers/ai.controller.js";
 

const router = express.Router();

// POST /api/v1/ai/generate-email-reply
router.post("/generate-email-replies", requiredSignIn, generateEmailReplies);

export default router;
