import express from "express";
import {
  createHrProduct,
  updateHrProduct,
  fetchHrProducts,
  deleteHrProduct,
} from "../controllers/hrProductController.js";  

const router = express.Router();

// Create
router.post("/create", createHrProduct);

// Update
router.put("/update/:id", updateHrProduct);

// Get All
router.get("/all", fetchHrProducts);

// Delete
router.delete("/delete/:id", deleteHrProduct);

export default router;