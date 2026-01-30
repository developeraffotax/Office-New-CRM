import mongoose from "mongoose";

const GmailHistorySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true, // 👈 ONE doc per company
      index: true,
    },

    last_history_id: {
      type: String,
      required: true,
    },

    //  lockedAt: {
    //   type: Date,
    //   default: null,
    // },
  },
  { timestamps: true }
);

export default mongoose.model("GmailHistory", GmailHistorySchema);
