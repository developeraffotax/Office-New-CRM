import express from "express";
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
import {
  createTemplate,
  deleteTemplate,
  getAllTemplate,
  getSingleTemplate,
  updateTemplate,
} from "../../controllers/templates/templateController.js";

const router = express.Router();

// Create Template
router.post("/create/template", requiredSignIn, createTemplate);

// Get All template
router.get("/get/all/template", getAllTemplate);

// Get Single Template
router.get("/get/single/template/:id", getSingleTemplate);

// Update Template
router.put("/update/template/:id", requiredSignIn, updateTemplate);

// Delete Template
router.delete("/delete/template/:id", requiredSignIn, deleteTemplate);

export default router;
