import mongoose from "mongoose";

const taskDepartmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: true,
    },
    users: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
        },
      },
    ],
     
    type: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("taskDepartment", taskDepartmentSchema);
