import mongoose from "mongoose";

const ThreadActivitySchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailThread",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "thread_created",
        "thread_deleted",

        "category_changed",
        "user_changed",
        "status_changed",
       
      ],
      
    },

    field: {
      type: String,
       
    },

    oldValue: String,

    newValue: String,

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
 
    },

    metadata: mongoose.Schema.Types.Mixed

  },
  {
    timestamps: true,
  }
);


 

export default mongoose.model(
  "ThreadActivity",
  ThreadActivitySchema
);