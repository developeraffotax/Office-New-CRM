import mongoose from "mongoose";

// Job Schema
const jobSchema = new mongoose.Schema(
  {
    jobName: {
      type: String,
    },
    yearEnd: {
      type: Date,
    },
    jobDeadline: {
      type: Date,
    },
    workDeadline: {
      type: Date,
    },
    hours: {
      type: String,
    },
    fee: {
      type: String,
    },
    jobStatus: {
      type: String,
    },
    notes: {
      type: String,
    },
    subscription: {
      type: String,
    },
    lead: {
      type: String,
    },
    jobHolder: {
      type: String,
    },
  },
  { timestamps: true }
);

// Comment Schema
const commentsSchema = new mongoose.Schema(
  {
    user: Object,
    comment: String,
    commentReplies: [Object],
    senderId: { type: String },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      default: "unread",
    },
  },
  { timestamps: true }
);

// Client Schema
const clientSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    regNumber: {
      type: String,
    },
    companyName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    totalHours: {
      type: String,
    },
    currentDate: {
      type: String,
    },
    source: {
      type: String,
    },
    status: {
      type: String,
    },
    clientType: {
      type: String,
    },
    country: {
      type: String,
    },
    fee: {
      type: String,
    },
    ctLogin: {
      type: String,
    },
    ctPassword: {
      type: String,
    },
    pyeLogin: {
      type: String,
    },
    pyePassword: {
      type: String,
    },
    trLogin: {
      type: String,
    },
    trPassword: {
      type: String,
    },
    vatLogin: {
      type: String,
    },
    vatPassword: {
      type: String,
    },
    authCode: {
      type: String,
    },
    utr: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    job: jobSchema,
    totalTime: {
      type: String,
      default: "O m",
    },
    comments: [commentsSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
