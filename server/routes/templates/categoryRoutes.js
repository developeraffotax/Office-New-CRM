import express from "express";
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
import {
  createCategory,
  deleteCategory,
  getAllCategory,
  getAllFAQCategory,
  getSingleCategory,
  updateCategory,
} from "../../controllers/templates/categoryController.js";

const router = express.Router();

// Create Category
router.post("/create/template/category", requiredSignIn, createCategory);

// Get All Category
router.get("/get/all/category", getAllCategory);

router.get("/get/faq/category", getAllFAQCategory);

// Get Single Category
router.get("/get/single/category/:id", getSingleCategory);

// Update Category
router.put("/update/template/category/:id", requiredSignIn, updateCategory);

// Delete Category
router.delete("/delete/template/category/:id", requiredSignIn, deleteCategory);

export default router;
