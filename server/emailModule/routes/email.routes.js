

import express from "express";
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
import { getInbox, updateThreadMetadata } from "../controllers/email.controller.js";
 
 

const router = express.Router();

// POST /api/v1/ai/generate-email-reply
router.get("/get-inbox", requiredSignIn,   getInbox);


// POST /api/v1/ai/generate-email-reply
router.put("/update-thread/:id", requiredSignIn,  updateThreadMetadata);

export default router;
