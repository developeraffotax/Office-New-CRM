import mongoose from "mongoose";


 

const { Schema, Types } = mongoose;

const attachmentSchema = new Schema(
  {
    filename: String,
    mimeType: String,
    size: Number,
    url: String,
  },
  { _id: false }
);

const commentSchema = new Schema(
  {
    /**
     * 🔗 Parent entity (EmailThread, Ticket, Task, etc.)
     */
    entity: {
      type: String, // "EmailThread", "Ticket", "Task"
      required: true,
      index: true,
    },
   
     entityId: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },
    /**
     * 👤 Author
     */
    author: {
      type: Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    /**
     * 💬 Content
     */
    content: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * 🔐 Visibility
     */
    isInternal: {
      type: Boolean,
      default: false,
      index: true,
    },

    /**
     * 👥 Mentions
     */
    mentions: [
      {
        type: Types.ObjectId,
        ref: "Users",
        index: true,
      },
    ],

    /**
     * 📎 Attachments
     */
    // attachments: [attachmentSchema],

    /**
     * 👀 Read tracking (enterprise-level)
     * Only store readers — unread = not in array
     */
    readBy: [
      {
        userId: { type: Types.ObjectId, ref: "Users" },
        readAt: { type: Date, default: Date.now },
      },
    ],

    /**
     * 🧵 Replies (optional, flat threading)
     */
    parentComment: {
      type: Types.ObjectId,
      ref: "Comment",
      index: true,
      default: null,
    },

 

    /**
     * 🧾 Metadata / future-proofing
     */
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    versionKey: false,
  }
);





  export default mongoose.model("Comment", commentSchema);








// const CommentSchema = new mongoose.Schema(
//   {
//     threadId: { type: mongoose.Schema.Types.ObjectId, ref: "EmailThread", required: true },
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
//     content: { type: String, required: true },
//     // attachments: [{ filename: String, mimeType: String, size: Number }],
//     // isInternal: { type: Boolean, default: false },


//         // ---------------- Participants -----------------
//     participants: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users",   },
         
//       },
//     ],


//     // ---------------- Mentions -----------------
//     mentions: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users",   },
//         name: String,
//       },
//     ],

//     // ---------------- Read/unread per user -----------------
//     readBy: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
//         readAt: Date,
//       },
//     ],
//   },
//   { timestamps: true }
// );

// // Indexes
// CommentSchema.index({ threadId: 1, createdAt: -1 });
// CommentSchema.index({ "readBy.userId": 1 });

// export default mongoose.model("Comment", CommentSchema);
