import mongoose from "mongoose";

// Define a schema for role-based access control
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    access: [
      {
        permission: {
          type: String,
        },
        subRoles: [
          {
            type: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Role", roleSchema);
