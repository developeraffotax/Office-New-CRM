import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    redirectLink: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    taskId: {
      type: String,
      required: true,
    },

    type: {
      type: String,
    },

    status: {
      type: String,
      enum: ["unread", "read", "dismissed"],
      default: "unread",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },

    companyName: {
      type: String,
    },
    clientName: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("notification", notificationSchema);
