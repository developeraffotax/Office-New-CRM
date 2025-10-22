import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import {
  copyProposal,
  createProposal,
  deleteProposal,
  fetchProposals,
  fetchSingleProposal,
  getWonProposalData,
  getWonProposaStats,
  updateProposal,
} from "../controllers/proposalController.js";

const router = express.Router();

// Add Proposal
router.post("/add/proposal", requiredSignIn, createProposal);

// Update Proposal
router.put("/update/proposal/:id", requiredSignIn, updateProposal);

// Get All Proposal
router.get("/fetch/proposal", fetchProposals);

// Delete Proposal
router.delete("/delete/proposal/:id", requiredSignIn, deleteProposal);

// Copy Proposal
router.post("/copy/proposal/:id", requiredSignIn, copyProposal);

// Fetch Single Proposal
router.get("/fetch/proposal/:id", fetchSingleProposal);









router.get("/userchart/won",    getWonProposalData);
router.get("/userchart/won/stats",    getWonProposaStats);

export default router;
