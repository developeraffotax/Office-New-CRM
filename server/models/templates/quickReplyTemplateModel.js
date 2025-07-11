// models/QuickReplyTemplate.js

import mongoose from "mongoose";

const quickReplyTemplateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["Task", "Jobs", "Goals", "ticket"], required: true },
  text: { type: String, required: true },
});

export default mongoose.model("QuickReplyTemplate", quickReplyTemplateSchema);