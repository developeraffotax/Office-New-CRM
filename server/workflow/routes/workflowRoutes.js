import express from "express";
import * as c from "../controllers/workflowController.js";


import { isAdmin, requiredSignIn } from "../../middlewares/authMiddleware.js";

 
const router = express.Router();
router.use(requiredSignIn);

// Templates (admin)
router.get("/templates", c.listTemplates);
router.get("/templates/:id", c.getTemplate);
router.post("/templates", isAdmin, c.createTemplate);
router.put("/templates/:id", isAdmin, c.updateTemplate);
router.delete("/templates/:id", isAdmin, c.deleteTemplate);

// Bulk (admin)
router.post("/apply", isAdmin, c.applyTemplate);
router.post("/reassign", isAdmin, c.bulkReassign);

// Everyone
router.get("/my-steps", c.getMySteps);

// One job's workflow
router.get("/job/:clientId", c.getJobWorkflow);
router.delete("/job/:clientId", isAdmin, c.removeJobWorkflow);
router.post("/job/:clientId/steps", c.addStep);
router.patch("/job/:clientId/steps/:stepId", c.updateStep);
router.delete("/job/:clientId/steps/:stepId", c.deleteStep);
router.put("/job/:clientId/reorder", c.reorderSteps);
router.post("/job/:clientId/sync", c.syncFromTemplate);

export default router;
 




