import mongoose from "mongoose";
import { TRACKED_FIELDS } from "../utils/constants.js";
import ThreadActivity from "./ThreadActivity.js";
import userModel from "../../models/userModel.js";
import { generateRef } from "../../utils/generateRef.js";

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

    ref: { type: Number},




    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null, index: true },
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "tickets", default: null, index: true },











  },
  { timestamps: true },
);

// Unique index per company + thread

EmailThreadSchema.index({ ref: 1 }, { unique: true });


EmailThreadSchema.index({ companyName: 1, threadId: 1 }, { unique: true });

EmailThreadSchema.index(
  { companyName: 1, userId: 1, lastMessageAtInbox: -1 },
  { partialFilterExpression: { hasInboxMessage: true } },
);

EmailThreadSchema.index(
  { companyName: 1, userId: 1, lastMessageAtSent: -1 },
  { partialFilterExpression: { hasSentMessage: true } },
);



EmailThreadSchema.index({ companyName: 1, leadId: 1, lastMessageAt: -1 });
EmailThreadSchema.index({ companyName: 1, ticketId: 1, lastMessageAt: -1 });




// when creating new tickets
EmailThreadSchema.pre("save", async function (next) {
  try {
    if (this.isNew && !this.ref) {
      this.ref = await generateRef("emailThread");
    }
    next();
  } catch (err) {
    next(err);
  }
});

// when persistThread runs
EmailThreadSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const options = this.getOptions();
    if (!options.upsert) return next(); // not an upsert — can't be a fresh insert

    const existingDoc = await this.model
      .findOne(this.getQuery())
      .select("_id")
      .lean();

    if (existingDoc) return next(); // thread already exists — just an update, skip

    const ref = await generateRef("emailThread");
    const update = this.getUpdate();

    this.setUpdate({
      ...update,
      $setOnInsert: {
        ...(update.$setOnInsert || {}),
        ref,
      },
    });

    next();
  } catch (err) {
    next(err);
  }
});



// EmailThreadSchema.pre("findOneAndUpdate", async function (next) {
//   try {
//     const query = this.getQuery();
//     const update = this.getUpdate();

//     const options = this.getOptions();

   
//     const updatedBy = options?.updatedBy || null;

//     const metadata = options?.activityMetadata || {};

//     // If no user passed → skip logging
//     if (!updatedBy) return next();

//     // Get existing document
//     const existingDoc = await this.model.findOne(query).lean();

//     if (!existingDoc) return next();

//     const activities = [];

//     // Handle $set updates safely
//     const updateData = update.$set || update;

//     // Loop tracked fields
//     for (const field in TRACKED_FIELDS) {
//       if (updateData[field] === undefined) continue;
      
//       let oldValue = existingDoc[field];

      


//       if(field === "userId" ) {
//         console.log("INSIDE THE IF BLOCK")
//           const user = await userModel.findById(existingDoc[field]).select("name").lean();
//           oldValue = user?.name || "";
//       }

//       let newValue = updateData[field];
//       if(field === "userId" ) {
//           const user = await userModel.findById(updateData[field]).select("name").lean();
//           newValue = user?.name || "";
//       }

      


//       // Deep comparison
//       const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);

//       if (!hasChanged) continue;

//       activities.push({
//         threadId: existingDoc._id,

//         action: TRACKED_FIELDS[field],

//         field,

//         oldValue,

//         newValue,

//         performedBy: updatedBy,

//         metadata,
//       });
//     }

//     if (activities.length > 0) {
//       await ThreadActivity.insertMany(activities);
//     }
    
//     next();
//   } catch (err) {
//     console.error("Thread activity logging error:", err);

//     next();
//   }
// });



export default mongoose.model("EmailThread", EmailThreadSchema);



 