import express from "express";
import { createJob } from "../controllers/jobController.js";
import { isAdmin, requiredSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create Client
router.post("/create/client/job", requiredSignIn, createJob);

// Get All Client

//Get Single CLient

// Update Client

// Delete Client

export default router;
