import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    results: {
      type: String,
      default: "",
    },

    // ✅ Single datetime field
    scheduledAt: {
      type: Date,
      required: true,
       
    },
    
    color: {
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

export default mongoose.model("meetings", meetingSchema);
