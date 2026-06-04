// routes/threadCategory.routes.js
import express from "express";
import {
  createWhatsappCategory,
  getWhatsappCategories,
  updateWhatsappCategory,
  deleteWhatsappCategory,
} from "../controllers/whatsappCategory.controller.js";




const router = express.Router();

 

router.get("/", getWhatsappCategories);
router.post("/", createWhatsappCategory);
router.put("/:id", updateWhatsappCategory);
router.delete("/:id", deleteWhatsappCategory);

export default router;
