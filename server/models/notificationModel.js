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

    entityType: {
      type: String,
      enum: ["task", "job", "ticket", "goal", "mailbox",  "whatsapp", "general",],
      default: "general",
    },


    entityId: {
  type: String, 
}, //  


  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
//notificationSchema.index({ entityType: 1, entityId: 1 });




export default mongoose.model("notification", notificationSchema);
