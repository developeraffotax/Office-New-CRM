 
import express from "express";
import { isAdmin, requiredSignIn } from "../middlewares/authMiddleware.js";
import { createSavedFilter, deleteSavedFilter, getSavedFilters } from "../controllers/savedFilterController.js";
 

const router = express.Router();



router.get("/", requiredSignIn, getSavedFilters);
router.post("/", requiredSignIn, createSavedFilter);
router.delete("/:id", requiredSignIn, deleteSavedFilter);



export default router;