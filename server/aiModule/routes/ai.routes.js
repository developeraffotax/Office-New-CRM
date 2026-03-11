

import express from "express";
import AiProjectRoutes from "./aiProject.routes.js"
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
import { generateEmailReplies,  } from "../controllers/ai.controller.js";
 

const router = express.Router();

// POST /api/v1/ai/generate-email-reply
router.post("/generate-email-replies", requiredSignIn, generateEmailReplies);












router.use("/project", requiredSignIn, AiProjectRoutes);

export default router;
