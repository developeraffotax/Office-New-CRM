import mongoose from "mongoose";





const AiProjectSchema = new mongoose.Schema({
  name: String,
  companyName: String,

  aiConfig: {
    tone: String, // professional / friendly / sales
    instructions: String, // high level rules
    signature: String,
    language: { type: String, default: "English" }
  },

  knowledge: {
    services: [String],
    pricingNotes: String,
    faq: String
  },

  isDefault: {
    type: Boolean,
    default: false,
  }

  
}, { timestamps: true });




 

export default mongoose.model("AiProject", AiProjectSchema);
