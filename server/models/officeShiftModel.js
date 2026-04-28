import mongoose from "mongoose";

const officeShiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Default Shift",
    },

    startTime: {
      type: String, // "09:00"
      required: true,
    },

    endTime: {
      type: String, // "18:00"
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // timezone: {
    //   type: String,
    //   default: "Asia/Karachi",
    // },
  },
  { timestamps: true }
);

export default mongoose.model("OfficeShift", officeShiftSchema);