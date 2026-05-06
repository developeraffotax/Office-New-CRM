import express from "express";
import {
  addDatalabel,
  deleteUser,
  getAllActiveUsers,
  getAllTeamMembers,
  getAllUsers,
  getDashboardUsers,
  loginCrmUser,
  loginUser,
  registerUser,
  reordering,
  singleUser,
  updateRole,
  updateUserProfile,
  verifyOtp,
} from "../controllers/userController.js";
import { isAdmin, requiredSignIn } from "../middlewares/authMiddleware.js";
import { aiPerMinuteLimiter } from "../utils/rateLimiter.js";

const router = express.Router();

// Register User
router.post("/register/user",requiredSignIn, registerUser);

// Login User
router.post("/login/user",  loginUser);

router.post("/login/crm-user", aiPerMinuteLimiter, loginCrmUser);
router.post("/verify-otp", aiPerMinuteLimiter, verifyOtp);

// Get All Users
router.get("/get_all", requiredSignIn, getAllUsers);

// Get All
router.get("/get_all/users", requiredSignIn, getAllActiveUsers);

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

// Reordering
router.put("/reordering", requiredSignIn, reordering);









// Get All Team Members
router.get("/get/active/team",requiredSignIn, getAllTeamMembers);

export default router;
