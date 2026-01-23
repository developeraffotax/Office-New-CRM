// models/EmailThread.js
import mongoose from "mongoose";

const EmailThreadSchema = new mongoose.Schema(
  {
    // companyId: { type: mongoose.Schema.Types.ObjectId, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, index: true },

    threadId: { type: String, unique: true, index: true },

    subject: String,

    category: {
      type: String,
      enum: ["support", "lead", "client", "other"],
      default: "other",
      index: true
    },

    participants: [{ name: String, email: String }],

    lastMessageAt: Date,
    lastMessageSnippet: String,

    unreadCount: { type: Number, default: 0 },
    messageCount: { type: Number, default: 0 },

       attachments: [
      { filename: String, mimeType: String, size: Number }
    ],


    hasAttachments: Boolean
  },
  { timestamps: true }
);

export default mongoose.model("EmailThread", EmailThreadSchema);
