// routes/templates.js

import express from "express";
import QuickReplyTemplate from "../models/templates/quickReplyTemplateModel.js";

const router = express.Router();

// Get all templates for a user, optionally filtered by type
router.get("/", async (req, res) => {

const userId = req.user.id;

 
  try { 
 
    const { type } = req.query;

    const filter = { userId };
    if (type) {
      filter.type = type;
    }

    const templates = await QuickReplyTemplate.find(filter);

    
    res.json({ templates });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add or update a template
router.post("/", async (req, res) => {
  const { type, text, templateId } = req.body;

  const userId = req.user.id;

  try {
    if (templateId) {
      const updated = await QuickReplyTemplate.findByIdAndUpdate(templateId, { text }, { new: true });
      res.json({ template: updated });
    } else {
      const newTemplate = new QuickReplyTemplate({ userId, type, text });
      await newTemplate.save();
      res.status(201).json({ template: newTemplate });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a template
router.delete("/:id", async (req, res) => {
  try {
    await QuickReplyTemplate.findByIdAndDelete(req.params.id);
    res.json({ message: "Template deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
