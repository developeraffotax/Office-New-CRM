import mongoose from "mongoose";

const EmailThreadSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },
    category: { type: String, default: "" },
    threadId: { type: String, required: true },
    subject: String,
    participants: [{ name: String, email: String }],

    // ---------------- Per-folder timestamps ----------------
    lastMessageAtInbox: Date,     // latest message from others in Inbox
    lastMessageAtSent: Date,      // latest message from self in Sent
    
    lastMessageAt: Date,
    lastMessageSnippet: String,
   

    unreadCount: { type: Number, default: 0 }, // only counts INBOX messages
    messageCount: { type: Number, default: 0 },
    attachments: [{ filename: String, mimeType: String, size: Number }],

    // store all Gmail labels on the thread
    labels: [{ type: String }],

    // Convenience booleans for filtering/indexing
    hasInboxMessage: { type: Boolean, default: false },
    hasSentMessage: { type: Boolean, default: false },
    
  },
  { timestamps: true }
);

// Unique index per company + thread
EmailThreadSchema.index({ companyName: 1, threadId: 1 }, { unique: true });

EmailThreadSchema.index(
  { companyName: 1, userId: 1, lastMessageAtInbox: -1 },
  { partialFilterExpression: { hasInboxMessage: true } }
);

EmailThreadSchema.index(
  { companyName: 1, userId: 1, lastMessageAtSent: -1 },
  { partialFilterExpression: { hasSentMessage: true } }
);


export default mongoose.model("EmailThread", EmailThreadSchema);

 

// // models/EmailThread.js
// import mongoose from "mongoose";

// const EmailThreadSchema = new mongoose.Schema(
//   {
//     companyName: { type: String, required: true },
//     userId: { type: mongoose.Schema.Types.ObjectId, default: null },
//     category: { type: String, default: "" },
//     threadId: { type: String, required: true },
//     subject: String,
//     participants: [{ name: String, email: String }],
//     lastMessageAt: Date,
//     lastMessageSnippet: String,
//     unreadCount: { type: Number, default: 0 },
//     messageCount: { type: Number, default: 0 },
//     attachments: [{ filename: String, mimeType: String, size: Number }],
//     hasInboxMessage: { type: Boolean, default: false },
//     hasSentMessage: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// // Unique per company
// EmailThreadSchema.index({ companyName: 1, threadId: 1 }, { unique: true });

// //for inbox & sent
// EmailThreadSchema.index(
//   { companyName: 1, userId: 1, category: 1, lastMessageAt: -1 },
//   {
//     partialFilterExpression: {
//       $or: [{ hasInboxMessage: true }, { hasSentMessage: true }]
//     }
//   }
// );

 

// export default mongoose.model("EmailThread", EmailThreadSchema);






 