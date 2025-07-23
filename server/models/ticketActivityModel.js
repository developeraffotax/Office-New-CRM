// models/TicketActivityModel.js
import mongoose from "mongoose";

const ticketActivitySchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tickets", // reference to the ticket
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users", // who performed the action
    },
   action: {
        type: String,
        required: true,
        enum: ["created", "replied", "updated", "deleted", "completed", "assigned", "commented"],
        },
    details: {
      type: String, // Optional additional info
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export default mongoose.model("TicketActivity", ticketActivitySchema);
