import express from "express";
import { isAdmin, requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  getSettings,
  updateSettings,
} from "../controllers/userSettingsController.js";

const router = express.Router();


// GET /api/v1/settings/
router.get("/", requiredSignIn, getSettings);

// PUT /api/v1/settings/
router.put("/", requiredSignIn, updateSettings);




export default router;
