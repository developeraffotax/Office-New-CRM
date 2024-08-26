import express from "express";
import { isAdmin, requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getAllCompletedTasks,
  getAllTasks,
  getSingleTask,
  singleTaskComments,
  updateAlocateTask,
  updateJobHolderLS,
  updateSubTaskStaus,
  updateTask,
  updatetaskProject,
} from "../controllers/TaskController.js";

const router = express.Router();

// Create task
router.post("/create/task", requiredSignIn, createTask);

// Get All Tasks
router.get("/get/all", getAllTasks);

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

export default router;
