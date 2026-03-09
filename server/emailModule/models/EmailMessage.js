import mongoose from "mongoose";

const EmailMessageSchema = new mongoose.Schema(
  {
     companyName: { type: String, required: true },
    gmailThreadId: {
      type: String,
      required: true,
    },
    gmailMessageId: String,
    senderName: String,
   
  },
  { timestamps: true },
);


EmailMessageSchema.index({ companyName: 1, threadgmailThreadIdId: 1 }, { unique: true });

export default mongoose.model("EmailMessage", EmailMessageSchema);
