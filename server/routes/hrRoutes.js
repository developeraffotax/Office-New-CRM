import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  allHrTask,
  copyHrTask,
  createHrTask,
  deleteHrTask,
  hrTaskDetail,
  importData,
  updateBulkHRs,
  updateHrTask,
  updateUserStatus,
} from "../controllers/hrController.js";

import multer from "multer";
// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Create task
router.post("/create/task", requiredSignIn, createHrTask);

// Update
router.put("/edit/task/:id", requiredSignIn, updateHrTask);

// Fetch All
router.get("/all/tasks", allHrTask);

// Task Detail
router.get("/task/detail/:id", hrTaskDetail);

// Delete
router.delete("/remove/task/:id", requiredSignIn, deleteHrTask);

// Copy HR Task
router.post("/copy/task/:id", requiredSignIn, copyHrTask);

// Update Status
router.put("/update/status/:id", requiredSignIn, updateUserStatus);





// Update Bulk        /api/v1/hr/update/bulk
router.put("/update/bulk", requiredSignIn, updateBulkHRs);


// Import CSV File       /api/v1/hr/import
router.post("/import", requiredSignIn, upload.single("file"), importData);



export default router;
