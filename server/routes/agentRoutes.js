import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";

import { getPresignedUrl, takeScreenshot } from "../controllers/agentController.js";


const router = express.Router();

// Add Comment
router.post("/screenshot", requiredSignIn, takeScreenshot);
// router.post("/screenshot", requiredSignIn, addTimestamp, upload.single("screenshot"), takeScreenshot);
//router.post("/screenshot", requiredSignIn, addTimestamp, upload.single("screenshot"), takeScreenshot);
 
router.get("/presigned-url", requiredSignIn, getPresignedUrl);



export default router;
