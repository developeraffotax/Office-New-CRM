// models/WhatsappMessage.js

import mongoose from "mongoose";

const whatsappMessageSchema = new mongoose.Schema(
  {
    
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    // WhatsApp Message ID
    // Used for deduplication & status updates
    whatsappMessageId: {
      type: String,
      required: true,
      unique: true,
    },


    // Customer or agent
    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
    },

    
    from: {
      type: String,
      required: true,
    },

    to: {
      type: String,
      required: true,
    },

    // Agent who sent the message
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "text",
        "image",
        "document",
        "audio",
        "video",
        "sticker",
        "location",
        "template",
        "unknown",
      ],
      default: "text",
    },

    // Text content
    body: {
      type: String,
      default: "",
    },

    // Media information
    media: {
      id: String,       // whatsapp media id
      url: String,      // your stored file url
      mimeType: String,
      filename: String,
      caption: String,
      size: Number,
    },

    // Delivery state
    status: {
      type: String,
      enum: [
        "received",
        "sent",
        "delivered",
        "read",
        "failed",
      ],
      default: "received",
    },

    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },

    // If customer replied to a specific message
    context: {
      whatsappMessageId: String,
    },

    // Array tracking emojis reacted to this message
    reactions: [
      {
        from: { 
          type: String, 
          required: true 
        }, // WhatsApp ID of the reactor
        emoji: { 
          type: String, 
          required: true 
        }, // The actual unicode emoji character (e.g. "👍")
        timestamp: { 
          type: Date, 
          default: Date.now 
        }
      }
    ],

    // Raw webhook payload
    // Useful for debugging
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    timestamp: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
==========================================
INDEXES
==========================================
*/

whatsappMessageSchema.index({
  conversationId: 1,
  timestamp: -1,
});

 
 

const WhatsappMessage = mongoose.model(
  "WhatsappMessage",
  whatsappMessageSchema
);

export default WhatsappMessage;