// routes/threadCategory.routes.js
import express from "express";
import {
  createThreadCategory,
  getThreadCategories,
  updateThreadCategory,
  deleteThreadCategory,
} from "../controllers/threadCategory.controller.js";




const router = express.Router();

 

router.get("/", getThreadCategories);
router.post("/", createThreadCategory);
router.put("/:id", updateThreadCategory);
router.delete("/:id", deleteThreadCategory);

export default router;
