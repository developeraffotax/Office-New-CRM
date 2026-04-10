import mongoose from "mongoose";
import { TRACKED_FIELDS } from "../utils/constants.js";
import ThreadActivity from "./ThreadActivity.js";
import userModel from "../../models/userModel.js";

const EmailThreadSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },
    category: { type: String, default: "" },
    threadId: { type: String, required: true },
    subject: String,
    participants: [{ name: String, email: String }],

    // ---------------- Per-folder timestamps ----------------
    lastMessageAtInbox: Date, // latest message from others in Inbox
    lastMessageAtSent: Date, // latest message from self in Sent

    lastMessageAt: Date,
    lastMessageSnippet: String,

    lastMessageBy: {
      type: String,
      enum: ["me", "client"],
      default: "client",
    },

    unreadCount: { type: Number, default: 0 }, // only counts INBOX messages
    messageCount: { type: Number, default: 0 },
    attachments: [{ filename: String, mimeType: String, size: Number }],

    // store all Gmail labels on the thread
    labels: [{ type: String }],

    // Convenience booleans for filtering/indexing
    hasInboxMessage: { type: Boolean, default: false },
    hasSentMessage: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["progress", "completed"],
      default: "progress",
    },

    readBy: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
          lastReadAt: Date,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

// Unique index per company + thread
EmailThreadSchema.index({ companyName: 1, threadId: 1 }, { unique: true });

EmailThreadSchema.index(
  { companyName: 1, userId: 1, lastMessageAtInbox: -1 },
  { partialFilterExpression: { hasInboxMessage: true } },
);

EmailThreadSchema.index(
  { companyName: 1, userId: 1, lastMessageAtSent: -1 },
  { partialFilterExpression: { hasSentMessage: true } },
);



EmailThreadSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const query = this.getQuery();
    const update = this.getUpdate();

    const options = this.getOptions();

   
    const updatedBy = options?.updatedBy || null;

    const metadata = options?.activityMetadata || {};

    // If no user passed → skip logging
    if (!updatedBy) return next();

    // Get existing document
    const existingDoc = await this.model.findOne(query).lean();

    if (!existingDoc) return next();

    const activities = [];

    // Handle $set updates safely
    const updateData = update.$set || update;

    // Loop tracked fields
    for (const field in TRACKED_FIELDS) {
      if (updateData[field] === undefined) continue;
      
      let oldValue = existingDoc[field];

      


      if(field === "userId" ) {
        console.log("INSIDE THE IF BLOCK")
          const user = await userModel.findById(existingDoc[field]).select("name").lean();
          oldValue = user?.name || "";
      }

      let newValue = updateData[field];
      if(field === "userId" ) {
          const user = await userModel.findById(updateData[field]).select("name").lean();
          newValue = user?.name || "";
      }

      


      // Deep comparison
      const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);

      if (!hasChanged) continue;

      activities.push({
        threadId: existingDoc._id,

        action: TRACKED_FIELDS[field],

        field,

        oldValue,

        newValue,

        performedBy: updatedBy,

        metadata,
      });
    }

    if (activities.length > 0) {
      await ThreadActivity.insertMany(activities);
    }
    
    next();
  } catch (err) {
    console.error("Thread activity logging error:", err);

    next();
  }
});



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
