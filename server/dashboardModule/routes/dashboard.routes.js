import express from "express";
 
import { getLeadConversionStats, getTotalLeadsStats, getWonLeadsStats } from "../controllers/leadsChart.controller.js";
 
const router = express.Router();

 

router.get("/leads/chart/total", getTotalLeadsStats);
router.get("/leads/chart/won", getWonLeadsStats);
router.get("/leads/chart/conversion", getLeadConversionStats);



export default router;

 