import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tickets",
    },
    messageId: {
      type: String,
    },
    messageSendBy: {
      type: String,
    },
    mailThreadId: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("email", messageSchema);
