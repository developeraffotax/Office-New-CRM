import express from "express";
import {
  createQuickList,
  deleteQuickList,
  getAllQuickLists,
  getSingleQuickList,
  updateQuickList,
} from "../controllers/QuicklistController.js";
import { requiredSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create Quick List
router.post("/create/quicklist", requiredSignIn, createQuickList);

// Get All Quick Lists
router.get("/get/quicklist", requiredSignIn, getAllQuickLists);

// Get Single Quick List
router.get("/get/single/quicklist/:id", getSingleQuickList);

// Update Quick List
router.put("/update/quicklist/:id", requiredSignIn, updateQuickList);

// Delete Quick List
router.delete("/delete/quicklist/:id", requiredSignIn, deleteQuickList);

export default router;
