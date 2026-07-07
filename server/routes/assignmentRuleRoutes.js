import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import { deleteAssignmentRule, getAssignmentRules, saveAssignmentRule } from "../controllers/assignmentRuleController.js";

 
 


const router = express.Router();

 
 
 
 
router.get("/", requiredSignIn,  getAssignmentRules);

router.put("/", requiredSignIn, saveAssignmentRule);

router.delete("/:type", requiredSignIn, deleteAssignmentRule);


export default router;
