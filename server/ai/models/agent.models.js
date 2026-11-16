// ai/models/agent.models.js
import mongoose from "mongoose";
const { Schema } = mongoose;

// One row per agent run: who asked, which tools ran, how long, how many tokens.
const AiAudit = mongoose.model(
  "AiAudit",
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, index: true },
      role: String,
      profile: String,
      provider: String,
      model: String,
      question: String,
      steps: Number,
      tools: [{ _id: false, name: String, ms: Number, ok: Boolean, args: String, resultChars: Number }],
      usage: { input: Number, output: Number, cacheRead: Number },
      ms: Number,
      outcome: String, // ok | max_steps | aborted | error
    },
    { timestamps: true }
  )
);

// A change the AI proposed. Nothing runs until the person confirms.
const AiAction = mongoose.model(
  "AiAction",
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, required: true, index: true },
      action: { type: String, required: true },
      input: Schema.Types.Mixed,
      summary: String,
      status: { type: String, enum: ["pending", "running", "done", "failed", "cancelled"], default: "pending" },
      result: Schema.Types.Mixed,
      error: String,
    },
    { timestamps: true }
  )
);

// Any file someone attached in the chat (or that the agent generated for them). Deleted after a week.
const AiAttachment = mongoose.model(
  "AiAttachment",
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, required: true, index: true },
      filename: { type: String, required: true },
      kind: { type: String, enum: ["pdf", "docx", "xlsx", "csv", "pptx", "text", "image"], required: true },
      formKind: { type: String, enum: ["pdf_acro", "pdf_flat", "docx", null], default: null }, // set when fillable fields were found
      size: Number,
      storagePath: { type: String, required: true },
      // form fields: [{ name:"f1", label, type: text|textarea|select|boolean, options?, context?, page?, maxLength?, required? }]
      fields: { type: [Schema.Types.Mixed], default: [] },
      meta: { type: Schema.Types.Mixed, default: {} }, // pages, sheets [{name, rows, preview}], ...
      generated: { type: Boolean, default: false }, // made by the agent (a filled copy)
      parentId: Schema.Types.ObjectId,
      expiresAt: { type: Date, index: true },
    },
    { timestamps: true }
  )
);

export { AiAudit, AiAction, AiAttachment };
