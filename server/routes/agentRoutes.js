import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";

import { getPresignedUrl, getUserDailyActivity, getUserScreenshots, getUserTimers, takeScreenshot } from "../controllers/agentController.js";
import { exportActivityReport } from "../controllers/report/report.controller.js";
 


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


// Single-user reports: day / week / month
// e.g. GET /export-activity/64f...?reportType=day&date=2026-07-06
//      GET /export-activity/64f...?reportType=week&startDate=2026-07-06&endDate=2026-07-12
//      GET /export-activity/64f...?reportType=month&startDate=2026-07-01&endDate=2026-07-31
router.get("/export-activity/:userId", requiredSignIn, exportActivityReport);
 
// All-users weekly report — no userId, spans every employee
// e.g. GET /export-activity/team/weekly?reportType=team-week&startDate=2026-07-06&endDate=2026-07-12
router.get("/export-activity/team/weekly", requiredSignIn, exportActivityReport);



export default router;
