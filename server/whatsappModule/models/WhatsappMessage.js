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

    // Media information (image, video, audio, document, sticker)
media: {
  id:       String,   // WhatsApp media_id (for reference)
  s3Key:      String,   // Wasabi object key  e.g. "whatsapp-media/923001234567/2024-01-15/abc123.jpg"
 
  mimeType: String,   // e.g. "image/jpeg"
  filename: String,   // documents only
  caption:  String,   // image/video/document
  size:     Number,   // bytes
  voice:    Boolean,  // audio only — true if recorded voice note
  animated: Boolean,  // sticker only
},

// Location (type === "location")
location: {
  latitude:  Number,
  longitude: Number,
  name:      String,  // e.g. "Eiffel Tower"     — optional
  address:   String,  // e.g. "Champ de Mars..."  — optional
  url:       String,  // Google Maps link          — optional
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

 

     // Agent who sent the message
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },


    sentFrom: {
      type: String, 
      enum: [ "crm", "external", ],
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