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

    wa_id: { type: String,  trim: true },
    wa_user_id: { type: String,  trim: true },

    lastMessage: { type: String, default: "", trim: true },
    lastMessageType: { type: String, enum: [ "text", "image", "document", "audio", "video", "sticker", "location", ], default: "text", },
    lastMessageId: { type: mongoose.Schema.Types.ObjectId, ref: "WhatsappMessage", default: null, },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessageBy: {
      type: String,
      enum: ["me", "client"],
      default: "client",
    },

    isStarred: { type: Boolean, default: false },

    totalInboundMessages: {
    type: Number,
    default: 0
  },

    readBy: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
          lastReadAt: Date,
          readInboundCount: { type: Number, default: 0 },
        },
      ],
      default: [],
    },

 
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
conversationSchema.index({ companyName: 1, phone: 1 }, { unique: true });

// Fast inbox sorting
conversationSchema.index({ lastMessageAt: -1 });

// Fast assigned chats lookup
conversationSchema.index({ userId: 1, status: 1 });

// One conversation per phone

const WhatsappConversation = mongoose.model("WhatsappConversation", conversationSchema);

export default WhatsappConversation;
