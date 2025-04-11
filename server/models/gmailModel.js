import mongoose from "mongoose";

const gmailSchema = new mongoose.Schema(
  {
    last_history_id: {
      type: String,
    },
    
  },
  { timestamps: true }
);

export default mongoose.model("Gmail", gmailSchema);
