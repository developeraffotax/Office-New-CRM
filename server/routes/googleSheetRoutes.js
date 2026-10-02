import express from "express";
import { requiredSignIn, isAdmin } from "../middlewares/authMiddleware.js";

import {
  createSheet,
  updateSheet,
  deleteSheet,
  getAllSheets,
  getAssignableUsers,
  getMySheets,
  getSheet,
} from "../controllers/googleSheetController.js";

const router = express.Router();

// Any signed-in user (admins get everything, users only their assigned sheets)
router.get("/mine", requiredSignIn, getMySheets);

// Admin only — keep these above "/:id" so they aren't captured as an id
router.get("/assignable-users", requiredSignIn, isAdmin, getAssignableUsers);
router.get("/", requiredSignIn, isAdmin, getAllSheets);
router.post("/", requiredSignIn, isAdmin, createSheet);

// Access is checked inside the service (assigned user or admin)
router.get("/:id", requiredSignIn, getSheet);

router.put("/:id", requiredSignIn, isAdmin, updateSheet);
router.delete("/:id", requiredSignIn, isAdmin, deleteSheet);

export default router;
 