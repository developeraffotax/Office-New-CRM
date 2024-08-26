import {
  createProject,
  deleteProject,
  getAllProjects,
  getCompleteProjects,
  getSingleProjects,
  updateProject,
  updateProjectStatus,
} from "../controllers/projectController.js";
import { isAdmin, requiredSignIn } from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

// Create Project
router.post("/create/project", requiredSignIn, createProject);

// Update Project
router.put("/update/project/:id", requiredSignIn, updateProject);

// Get All Projects
router.get("/get_all/project", getAllProjects);

// Get Single Project
router.get("/get_single/project/:id", requiredSignIn, getSingleProjects);

// Delete Project
router.delete("/delete/project/:id", requiredSignIn, deleteProject);

// Update Project Status
router.put("/update/status/:id", requiredSignIn, isAdmin, updateProjectStatus);

// Completed Project
router.get("/get/completed/project", getCompleteProjects);

export default router;
