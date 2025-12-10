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

    sidebarCollapsed: {
      type: Boolean,
      default: false,
    },

    showNotifications: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("UserSettings", userSettingsSchema);
