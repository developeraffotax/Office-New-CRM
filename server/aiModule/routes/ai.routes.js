

import express from "express";
import AiProjectRoutes from "./aiProject.routes.js"
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
import { generateEmailReplies,  } from "../controllers/ai.controller.js";
import { aiPerMinuteLimiter } from "../../utils/rateLimiter.js";
 

const router = express.Router();

// POST /api/v1/ai/generate-email-reply
router.post("/generate-email-replies", aiPerMinuteLimiter, requiredSignIn,  generateEmailReplies);





router.use("/project", requiredSignIn, AiProjectRoutes);

export default router;
