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
    clientId: {
      type: String,
    },
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
      enum: ["Read", "Unread", "Sent"],
      default: "Read",
    },
    state: {
      type: String,
      default: "progress",
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


    jobStatus: {
      type: String,
       
    },



    sent: {
      type: Number,
      default: 0,
    },


    received: {
      type: Number,
      default: 0,
    },

    lastMessageSentTime: {
      type: Date,
    },


    email: {
      type: String
    },

    isManual: {
      type: Boolean,
      default: false
    },


    lastMessageStatus: {
      type: String,
      enum: ["Read", "Unread", "Sent"],
      default: "Read",
},
  },
  { timestamps: true }
);

export default mongoose.model("tickets", ticketSchema);
