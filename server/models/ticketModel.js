import mongoose from "mongoose";

// Comment Schema
const commentsSchema = new mongoose.Schema(
  {
    user: Object,
    comment: String,
    commentReplies: [Object],
    senderId: { type: String },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      default: "unread",
    },
  },

  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
    },
    clientName: {
      type: String,
    },
    company: {
      type: String,
    },
    jobHolder: {
      type: String,
    },
    subject: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Read", "Unread", "Send"],
      default: "Unread",
    },
    jobDate: {
      type: String,
    },
    comments: [commentsSchema],
    mailThreadId: {
      type: String,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
    lastMessageSentBy: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("tickets", ticketSchema);
