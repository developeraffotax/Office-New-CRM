import express from "express";
import { getThreadDetails } from "../controllers/thread.controller.js";
 

const router = express.Router();

router.get("/:threadId/:company", getThreadDetails);

export default router;