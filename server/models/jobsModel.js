import mongoose from "mongoose";

// Job Schema
const jobSchema = new mongoose.Schema(
  {
    jobName: {
      type: String,
    },
    yearEnd: {
      type: Date,
      default: () => new Date(),
    },
    jobDeadline: {
      type: Date,
      default: () => new Date(),
    },
    workDeadline: {
      type: Date,
      default: () => new Date(),
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

const labelSchema = new mongoose.Schema({
  name: { type: String },
  color: { type: String },
});

const subtask = new mongoose.Schema(
  {
    subTask: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: "process",
    },
  },
  { timestamps: true }
);

const qualityCheck = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    subTask: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: "process",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    activity: { type: String },
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

    phone: {
      type: String,
    },


    totalHours: {
      type: String,
    },
    currentDate: {
      type: Date,
      default: () => new Date(),
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
    partner: {
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
      default: "Om",
    },
    workPlan: {
      type: String,
      default: "",
    },

    label: labelSchema,
    data: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lable",
    },
    comments: [commentsSchema],
    subtasks: [subtask],
    quality_Check: [qualityCheck],
    activeClient: {
      type: String,
      default: "active",
    },
    prepared: {
      type: String,
    },
    review: {
      type: String,
    },
    filed: {
      type: String,
    },
    activities: [activitySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
