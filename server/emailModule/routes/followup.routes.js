

import express from "express";
import { getFollowUp, setFollowUpStatus, upsertFollowUp } from "../controllers/followUp.controller.js";
 

const router = express.Router();

 


router.get("/", getFollowUp);
router.post("/", upsertFollowUp);
router.post("/status", setFollowUpStatus);

 

export default router;
