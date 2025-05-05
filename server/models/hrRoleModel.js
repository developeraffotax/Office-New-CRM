import mongoose from "mongoose";

const hrRoleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
    },
    
   
    
  },
  { timestamps: true }
);

export default mongoose.model("hrRole", hrRoleSchema);
