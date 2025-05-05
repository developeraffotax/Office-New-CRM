import express from "express";

import {
  createHrRole,
  deleteHrRole,
  fetchHrRoles,
  updateHrRole,
} from "../controllers/hrRoleController.js";

const router = express.Router();

// Create Department
router.post("/create", createHrRole);
router.put("/edit/:id", updateHrRole);
router.get("/all", fetchHrRoles);
router.delete("/delete/:id", deleteHrRole);

export default router;
