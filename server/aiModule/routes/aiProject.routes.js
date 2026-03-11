import express from "express";
import { createAiProject, deleteAiProject, getAiProjectById, getAllAiProjects, updateAiProject } from "../controllers/aiProject.controller.js";
 

const router = express.Router();

router.post("/create", createAiProject);

router.get("/all", getAllAiProjects);

router.get("/:id", getAiProjectById);

router.put("/:id", updateAiProject);

router.delete("/:id", deleteAiProject);

export default router;