import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";

import { takeScreenshot } from "../controllers/agentController.js";
import { upload } from "../utils/s3/s3Upload.js";
import { addTimestamp } from "../middlewares/addTimeStamp.js";

const router = express.Router();

// Add Comment
router.post("/screenshot", requiredSignIn, addTimestamp, upload.single("screenshot"), takeScreenshot);
//router.post("/screenshot", requiredSignIn, addTimestamp, upload.single("screenshot"), takeScreenshot);
 

export default router;
