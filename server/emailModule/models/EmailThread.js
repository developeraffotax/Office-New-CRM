// models/EmailThread.js
import mongoose from "mongoose";

const EmailThreadSchema = new mongoose.Schema({

  companyName: { type: String, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, index: true },
  category: {
    type: String,
    enum: ["support", "lead", "client", "other"],
    default: "other",
    index: true
  },


  threadId: { type: String, index: true }, 
  subject: String,
  participants: [{ name: String, email: String }],


  lastMessageAt: Date,
  lastMessageSnippet: String,
  unreadCount: { type: Number, default: 0 },
  messageCount: { type: Number, default: 0 },
  attachments: [{ filename: String, mimeType: String, size: Number }],
  hasInboxMessage: Boolean,

  
}, { timestamps: true });

// Compound index to ensure threadId is unique per company
EmailThreadSchema.index({ companyName: 1, threadId: 1 }, { unique: true });

export default mongoose.model("EmailThread", EmailThreadSchema);
