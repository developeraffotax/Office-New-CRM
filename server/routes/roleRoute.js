import express from "express";
import { isAdmin, requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  deleteRole,
  getAllRole,
  getSingleRole,
  postRole,
  updateRole,
} from "../controllers/roleController.js";

const router = express.Router();

// Create Role
router.post("/create/role", requiredSignIn, isAdmin, postRole);

// Get All Routes
router.get("/fetch/all/roles", getAllRole);

// Update Role
router.put("/update/role/:id", requiredSignIn, isAdmin, updateRole);

// Get Single Role
router.get("/fetch/single/role/:id", getSingleRole);

// Delete Role
router.put("/delete/role/:id", requiredSignIn, isAdmin, deleteRole);

export default router;
