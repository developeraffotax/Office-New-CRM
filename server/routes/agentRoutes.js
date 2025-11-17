import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";

import { getPresignedUrl, getUserDailyActivity, getUserScreenshots, getUserTimers, takeScreenshot } from "../controllers/agentController.js";


const router = express.Router();

// Add Comment
router.post("/screenshot", requiredSignIn, takeScreenshot);
// router.post("/screenshot", requiredSignIn, addTimestamp, upload.single("screenshot"), takeScreenshot);
//router.post("/screenshot", requiredSignIn, addTimestamp, upload.single("screenshot"), takeScreenshot);
 
router.get("/presigned-url", requiredSignIn, getPresignedUrl);

router.get("/activity", requiredSignIn, getUserDailyActivity);



// for admin to get user data
router.get("/screenshot/:userId", requiredSignIn, getUserScreenshots);
router.get("/timers/:userId", requiredSignIn, getUserTimers);







export default router;
