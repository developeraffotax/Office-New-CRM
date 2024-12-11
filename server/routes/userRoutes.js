import express from "express";
import {
  addDatalabel,
  deleteUser,
  getAllActiveUsers,
  getAllUsers,
  getDashboardUsers,
  loginUser,
  registerUser,
  singleUser,
  updateRole,
  updateUserProfile,
} from "../controllers/userController.js";
import { isAdmin, requiredSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register User
router.post("/register/user", registerUser);

// Login User
router.post("/login/user", loginUser);

// Get All Users
router.get("/get_all", getAllUsers);

// Get All
router.get("/get_all/users", getAllActiveUsers);

// Get Single User
router.get("/get_user/:id", requiredSignIn, singleUser);

// Update Profile
router.put("/update/Profile/:id", requiredSignIn, updateUserProfile);

// Update Role
router.put("/update_role/:id", requiredSignIn, updateRole);

// Delete User
router.delete("/delete_user/:id", requiredSignIn, deleteUser);

// Dashboard Users
router.get("/dashboard/users", getDashboardUsers);

// User Label
router.put("/label/:id", requiredSignIn, addDatalabel);

export default router;
