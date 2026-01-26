// // models/Email.js
// import mongoose from "mongoose";

// const EmailSchema = new mongoose.Schema(
//   {
//     companyId: { type: mongoose.Schema.Types.ObjectId, index: true },

//     gmailId: { type: String, unique: true, index: true },
//     threadId: { type: String, index: true },

//     from: { name: String, email: String },
//     to: [{ name: String, email: String }],

//     subject: String,
//     snippet: String,

//     attachments: [
//       { filename: String, mimeType: String, size: Number }
//     ],

//     labels: [String],
//     isRead: Boolean,

//     date: Date,
//     syncedAt: Date,

//     // derived from thread
//     category: String
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Email", EmailSchema);
