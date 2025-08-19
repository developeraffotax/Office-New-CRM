import express from "express";
import { isAdmin, requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  addlabel,
  autoCreateRecurringTasks,
  createSubTask,
  createTask,
  deleteDailyRecurringTasks,
  deleteDuplicateTasks,
  deleteSubTask,
  deleteTask,
  getAllCompletedTasks,
  getAllTasks,
  getCompletedTasks,
 
  getDashboardTasks,
  getSingleTask,
  importData,
  reordering,
  singleTaskComments,
  updateAlocateTask,
  updateJobHolderLS,
  updateMultipleTasks,
  updateSubTaskStaus,
  updateTask,
  updateTaskHours,
  updatetaskProject,
} from "../controllers/TaskController.js";
import multer from "multer";
import { createDepartment, deleteDepartment, getDepartmentById, getDepartments, updateDepartment } from "../controllers/taskDepartment.controller.js";
// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Create task
router.post("/create/task", requiredSignIn, createTask);

// Get All Tasks
router.get("/get/all", getAllTasks);

// Completed Tasks
router.get("/get/all/completed", getCompletedTasks);

// Single task
router.get("/get/single/:id", getSingleTask);

// Update task/Project
router.put("/update/project/:id", requiredSignIn, updatetaskProject);

// Update JobHolder -/- Lead | Status
router.put("/update/task/JLS/:id", requiredSignIn, updateJobHolderLS);

// Update Allocate Task
router.put("/update/allocate/task/:id", requiredSignIn, updateAlocateTask);

// Get Single Task Comments
router.get("/task/comments/:id", singleTaskComments);

// Delete Task
router.delete("/delete/task/:id", requiredSignIn, deleteTask);

// Update Full Task
router.put("/update/task/:id", requiredSignIn, updateTask);

// Create subTask
router.post("/create/subTask/:id", requiredSignIn, createSubTask);

// Update Task
router.put("/update/subtask/status/:id", requiredSignIn, updateSubTaskStaus);

// Delete Task
router.delete(
  "/delete/subtask/:taskId/:subTaskId",
  requiredSignIn,
  deleteSubTask
);

// Completed Tasks
router.get("/get/completed", getAllCompletedTasks);

// Add Label
router.put("/add/label/:id", requiredSignIn, addlabel);
// Update Hours
router.put("/update/hours/:id", requiredSignIn, updateTaskHours);

// Delet Many Task
router.delete("/delete/many", deleteDailyRecurringTasks);

// Duplicate Task
router.delete("/delete/diplicate", deleteDuplicateTasks);

router.get("/dashboard/tasks", getDashboardTasks);

// Reordering Subtask
router.put("/reorder/subtasks/:id", reordering);

// Call Recurring Function
router.get("/call/recurring", autoCreateRecurringTasks);

// Import CSV File
router.post("/import", requiredSignIn, upload.single("file"), importData);

// Update Multiple Tasks
router.put("/update/multiple", requiredSignIn, updateMultipleTasks);






















// Create department
router.post("/department", createDepartment);

// Get all departments
router.get("/department", getDepartments);

// Get single department by ID
router.get("/department/:id", getDepartmentById);

// Update department
router.put("/department/:id", updateDepartment);

// Delete department
router.delete("/department/:id", deleteDepartment);

export default router;
