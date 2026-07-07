import mongoose from "mongoose";

const assignmentRuleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["quote", "whatsapp_lead"],
    index: true,
    unique: true,
  },

  strategy: {
    type: String,
    enum: ["fixed", "round_robin", "random"],
    default: "fixed",
  },

  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  }],

  currentIndex: {
    type: Number,
    default: 0,
  },
});


export default mongoose.model("AssignmentRule", assignmentRuleSchema);