import mongoose from "mongoose";
const { Schema } = mongoose;

const userSettingsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true, // one settings doc per user
      required: true,
    },

    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "light",
    },

    showSidebar: { type: Boolean, default: true },

     // 🔔 Notification settings
    showCrmNotifications: {
      type: Boolean,
      default: true,
    },

    showEmailNotifications: {
      type: Boolean,
      default: true,
    },

    inboxConfig: {
      inboxUnreadCount: Boolean,
      sidebarUnreadCount: Boolean,
      showUnreadCountFor: {
        type: String,
        enum: ["all", "unassigned",  ],
        default: "all",
      },
    }
  },
  { timestamps: true }
);

export default mongoose.model("UserSettings", userSettingsSchema);
