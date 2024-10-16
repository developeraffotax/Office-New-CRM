import express from "express";
import { requiredSignIn } from "../../middlewares/authMiddleware.js";
import {
  createFAQ,
  deleteFAQ,
  getAllFAQ,
  getSingleFaq,
  updateFAQ,
} from "../../controllers/templates/faqController.js";

const router = express.Router();

// Create FAQ
router.post("/create/faq", requiredSignIn, createFAQ);

// Get All FAQ
router.get("/get/all/faq", getAllFAQ);

// Update FAQ
router.put("/update/faq/:id", requiredSignIn, updateFAQ);

// Delete FAQ's
router.delete("/delete/faq/:id", requiredSignIn, deleteFAQ);

// Single FAQ
router.get("/single/faq/:id", getSingleFaq);

export default router;
