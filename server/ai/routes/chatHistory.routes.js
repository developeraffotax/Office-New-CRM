// ai/routes/chatHistory.routes.js — who am I, and my saved chats.
//   GET    /me                          { id, name, role, isAdmin }   (for the "Welcome <name>" message)
//   GET    /conversations               my chats, newest first
//   GET    /conversations/:id/messages  one chat
//   DELETE /conversations/:id
import { Router } from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/aiAuth.js";
import { isAdminRole } from "../config.js";
import { listConversations, getMessages, deleteConversation } from "../services/history.service.js";

const ah = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    if (!e.status) console.error("[chat history]", e);
    res.status(e.status || 500).json({ message: e.status ? e.message : "Server error" });
  });
const validId = (req, res, next) => (mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ message: "Invalid id" }));

const router = Router();

router.get("/me", protect, (req, res) =>
  res.json({ id: req.user.id, name: req.user.name, role: req.user.role, isAdmin: isAdminRole(req.user.role) })
);
router.get("/conversations", protect, ah(async (req, res) => res.json(await listConversations(req.user))));
router.get("/conversations/:id/messages", protect, validId, ah(async (req, res) => res.json(await getMessages(req.user, req.params.id))));
router.delete("/conversations/:id", protect, validId, ah(async (req, res) => (await deleteConversation(req.user, req.params.id), res.json({ ok: true }))));

export default router;