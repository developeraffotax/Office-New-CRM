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

// Saved chats. Each person only ever sees their own. Deleted automatically after AI_HISTORY_DAYS (TTL index).
const conversationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, default: "New chat", maxlength: 120 },
    lastMessageAt: { type: Date, default: Date.now },
    expiresAt: Date,
  },
  { timestamps: true }
);
conversationSchema.index({ userId: 1, lastMessageAt: -1 });
conversationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const AiConversation = mongoose.model("AiConversation", conversationSchema);

const messageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, default: "" },
    sources: { type: [Schema.Types.Mixed], default: [] }, // only the sources the answer actually cited
    files: { type: [Schema.Types.Mixed], default: [] }, // files the agent produced (download expires with the file)
    attachments: { type: [Schema.Types.Mixed], default: [] }, // [{ filename }] shown on the user's message
    toolsUsed: { type: Number, default: 0 },
    partial: { type: Boolean, default: false }, // stopped or failed part-way
    expiresAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const AiMessage = mongoose.model("AiMessage", messageSchema);

export { AiAudit, AiAction, AiAttachment, AiConversation, AiMessage };