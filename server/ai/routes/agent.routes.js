// ai/routes/agent.routes.js
import { Router } from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/aiAuth.js";
import { rateLimit } from "../core/rateLimit.js";
import { initSSE } from "../core/stream.js";
import { runAgent } from "../agent/runtime.js";
import { getForm, canUseForm, validateValues } from "../agent/forms/registry.js";
import { resolveAction } from "../agent/tools/actions.js";
import { ToolError } from "../agent/toolkit.js";
import { getOwnAttachment, publicAttachment, loadImageParts } from "../attachments/attachments.service.js";

const router = Router();

// Last 6 turns, valid roles only, must start with a user turn.
function cleanHistory(h) {
  if (!Array.isArray(h)) return [];
  const out = h
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}
const validId = (v) => (v && mongoose.isValidObjectId(v) ? String(v) : undefined);

// Chat + actions in one endpoint. Streams SSE: sources | token | tool | draft | proposal | done | error
router.post("/agent", protect, rateLimit({ name: "agent", limit: 20, windowSec: 60 }), async (req, res) => {
  const question = String(req.body?.question || "").trim();
  if (!question || question.length > 2000) return res.status(400).json({ message: "Question must be 1–2000 characters" });

  const scope = { projectId: validId(req.body.projectId), productId: validId(req.body.productId) };
  // Files the person attached (uploaded earlier via POST /attachments). Owner-checked.
  const ids = (Array.isArray(req.body.attachmentIds) ? req.body.attachmentIds : []).filter((i) => mongoose.isValidObjectId(i)).slice(0, 5);
  const docs = (await Promise.all(ids.map((i) => getOwnAttachment(i, req.user)))).filter(Boolean);
  const attachments = docs.map(publicAttachment);
  const images = await loadImageParts(docs);

  const sse = initSSE(res);
  try {
    const { ms } = await runAgent({ user: req.user, question, history: cleanHistory(req.body.history), scope, attachments, images, sse });
    sse.send("done", { ms });
  } catch (err) {
    if (!sse.signal.aborted) {
      console.error("[agent]", err);
      sse.send("error", { message: "Something went wrong. Please try again." });
    }
  } finally {
    sse.end();
  }
});

// A person reviewed the AI's draft and submits it. Validated again here: never trust the draft.
router.post("/forms/:formId/submit", protect, async (req, res) => {
  const form = getForm(req.params.formId);
  if (!form || !canUseForm(form, req.user)) return res.status(404).json({ message: "Unknown form" });
  const { values, errors, missing } = validateValues(form, req.body?.values);
  if (Object.keys(errors).length || missing.length) return res.status(400).json({ message: "Please fix the highlighted fields", errors, missing });
  try {
    res.json({ ok: true, result: await form.submit(values, req.user) });
  } catch (err) {
    console.error("[form submit]", err);
    res.status(500).json({ message: err.message || "Could not submit" });
  }
});

// Confirm / cancel a change the AI proposed.
for (const decision of ["confirm", "cancel"]) {
  router.post(`/actions/:id/${decision}`, protect, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid id" });
    try {
      const doc = await resolveAction(req.params.id, req.user, decision);
      res.json({ status: doc.status, error: doc.error, result: doc.result });
    } catch (err) {
      res.status(err instanceof ToolError ? 409 : 500).json({ message: err.message });
    }
  });
}

export default router;
