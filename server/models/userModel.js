import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
    },
    emergency_contact: {
      type: String,
    },
    address: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: "user",
    },
    avatar: {
      type: String,
    },
    access: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roles",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Users", userSchema);
