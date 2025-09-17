import mongoose from "mongoose";
const { Schema } = mongoose;

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    avatar: {
      type: String,
    },
    access: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    data: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lable",
    },
    order: {
      type: Number,
      default: 0,
    },

    juniors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Users'  // Refers to the same User model
      }
    ]
  },
  { timestamps: false }
);

export default mongoose.model("Users", userSchema);
