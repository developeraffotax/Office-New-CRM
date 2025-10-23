import express from "express";
 
import { createSubtaskList, deleteSubtaskList, getAllSubtaskLists } from "../controllers/subtaskListController.js";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
const router = express.Router();

// ✅ Create new list
router.post("/",  requiredSignIn,  createSubtaskList);

// ✅ Get all lists
router.get("/",  requiredSignIn,  getAllSubtaskLists);

// ✅ Delete list
router.delete("/:id",  requiredSignIn,  deleteSubtaskList);

export default router;
