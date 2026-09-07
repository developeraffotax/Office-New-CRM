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

    sentFrom: {
      type: String,
      enum: ["CRM-Tickets", "CRM-Inbox"]
    },


    interactionType: {
      type: String,
      enum: ["initial", "reply"],

    },
   
  },
  { timestamps: true },
);


EmailMessageSchema.index({ companyName: 1, gmailThreadId: 1 });
EmailMessageSchema.index({ companyName: 1, sentFrom: 1 });
EmailMessageSchema.index({ companyName: 1, interactionType: 1, senderName: 1 });

export default mongoose.model("EmailMessage", EmailMessageSchema);
