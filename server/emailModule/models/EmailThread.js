
// models/EmailThread.js
import mongoose from "mongoose";

const EmailThreadSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    category: {
      type: String,
      default: "",
    },

    threadId: {
      type: String,
      required: true,
    },

    subject: String,

    participants: [
      {
        name: String,
        email: String,
      },
    ],

    lastMessageAt: Date,
    lastMessageSnippet: String,

    unreadCount: {
      type: Number,
      default: 0,
    },

    messageCount: {
      type: Number,
      default: 0,
    },

    attachments: [
      {
        filename: String,
        mimeType: String,
        size: Number,
      },
    ],

    hasInboxMessage: Boolean,
    hasSentMessage: Boolean,
  },
  { timestamps: true }
);

// Unique per company
EmailThreadSchema.index(
  { companyName: 1, threadId: 1 },
  { unique: true }
);

// Inbox
EmailThreadSchema.index(
  {
    companyName: 1,
    userId: 1,
    category: 1,
    lastMessageAt: -1
  },
  {
    partialFilterExpression: { hasInboxMessage: true }
  }
);

// Sent
EmailThreadSchema.index(
  {
    companyName: 1,
    userId: 1,
    category: 1,
    lastMessageAt: -1
  },
  {
    partialFilterExpression: { hasSentMessage: true }
  }
);

// Optional: unread inbox
// EmailThreadSchema.index(
//   {
//     companyName: 1,
//     userId: 1,
//     lastMessageAt: -1
//   },
//   {
//     partialFilterExpression: {
//       hasInboxMessage: true,
//       unreadCount: { $gt: 0 }
//     }
//   }
// );

 

export default mongoose.model("EmailThread", EmailThreadSchema);



























// // models/EmailThread.js
// import mongoose from "mongoose";

// const EmailThreadSchema = new mongoose.Schema({

//   companyName: { type: String, index: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, index: true },
//   category: {
//     type: String,
//     // enum: ["support", "lead", "client", "other"],
//     default: "",
//     index: true
//   },


//   threadId: { type: String, index: true }, 
//   subject: String,
//   participants: [{ name: String, email: String }],


//   lastMessageAt: Date,
//   lastMessageSnippet: String,
//   unreadCount: { type: Number, default: 0 },
//   messageCount: { type: Number, default: 0 },
//   attachments: [{ filename: String, mimeType: String, size: Number }],

//   hasInboxMessage: Boolean,
//   hasSentMessage: Boolean,

  
// }, { timestamps: true });

// // Compound index to ensure threadId is unique per company
// EmailThreadSchema.index({ companyName: 1, threadId: 1 }, { unique: true });

// export default mongoose.model("EmailThread", EmailThreadSchema);
