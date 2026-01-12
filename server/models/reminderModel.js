import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    taskId: { type: String, required: true },

    // ✅ Single datetime field
    scheduledAt: {
      type: Date,
      required: true,
      index: true, // for efficient cron job queries
    },

    redirectLink: { type: String },

    isRead: {
      type: Boolean,
      default: false,
    
    },
    isCompleted: {
      type: Boolean,
      default: false,
    
    },


    // 🔥 NEW
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },


  
  },
  { timestamps: true }
);

export default mongoose.model("Reminder", reminderSchema);
