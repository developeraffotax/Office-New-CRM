import mongoose from "mongoose";

// Comment Schema
const commentsSchema = new mongoose.Schema(
  {
    user: Object,
    comment: String,
    commentReplies: [Object],
    senderId: { type: String },
    mentionUser: {
      type: String,
    },
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

const goalSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      trim: true,
    },
    achievement: {
      type: Number,
    },
    achievedCount: {
      type: Number,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    goalType: {
      type: String,
    },
    jobHolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    status: {
      type: String,
      default: "Progress",
    },
    comments: [commentsSchema],
    note: {
      type: String,
    },
    usersList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Goals", goalSchema);
