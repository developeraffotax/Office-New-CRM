import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  reorderRules,
  testRules,
} from "../controllers/automationRuleController.js";

const router = express.Router();

// static paths first so "/reorder" and "/test" are never read as an :id
router.put("/reorder", requiredSignIn, reorderRules);
router.post("/test", requiredSignIn, testRules);

router.get("/", requiredSignIn, getRules);
router.post("/", requiredSignIn, createRule);
router.put("/:id", requiredSignIn, updateRule);
router.delete("/:id", requiredSignIn, deleteRule);

export default router;

// app.use("/api/v1/automation-rules", automationRuleRoutes);