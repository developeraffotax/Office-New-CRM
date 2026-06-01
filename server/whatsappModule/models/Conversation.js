// models/Conversation.js

import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    category: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", default: null, },
    status: { type: String, enum: ["progress", "completed"], default: "progress", },

    // Customer whatsapp number
    phone: { type: String, required: true, trim: true },
    profileName: { type: String, default: "" },
    profilePicture: { type: String, default: "" },

    lastMessage: { type: String, default: "", trim: true },
    lastMessageType: { type: String, enum: [ "text", "image", "document", "audio", "video", "sticker", "location", ], default: "text", },
    lastMessageId: { type: mongoose.Schema.Types.ObjectId, ref: "WhatsappMessage", default: null, },
    lastMessageAt: { type: Date, default: Date.now },

    // unreadCount: { type: Number, default: 0, min: 0 },

    readBy: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
          lastReadAt: Date,
        },
      ],
      default: [],
    },

    // Labels / tags
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

/*
==========================================
INDEXES
==========================================
*/

// Fast inbox sorting
conversationSchema.index({ lastMessageAt: -1 });

// Fast assigned chats lookup
conversationSchema.index({ userId: 1, status: 1 });

// One conversation per phone
conversationSchema.index({ phone: 1 }, { unique: true });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
