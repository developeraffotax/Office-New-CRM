import express from "express";
import {
  deleteUser,
  getAllUsers,
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
router.get("/get_all/users", getAllUsers);

// Get Single User
router.get("/get_user/:id", requiredSignIn, singleUser);

// Update Profile
router.put("/update/Profile/:id", requiredSignIn, updateUserProfile);

// Update Role
router.put("/update_role/:id", requiredSignIn, updateRole);

// Delete User
router.delete("/delete_user/:id", requiredSignIn, deleteUser);

// Reset Password

// Update Password

export default router;
