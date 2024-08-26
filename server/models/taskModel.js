import mongoose from "mongoose";

// Comment Schema
const commentsSchema = new mongoose.Schema(
  {
    user: Object,
    comment: String,
    commentReplies: [Object],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const activitySchema = new mongoose.Schema(
  {
    userName: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    activity: { type: String },
  },
  { timestamps: true }
);

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

const taskSchema = new mongoose.Schema(
  {
    project: {
      _id: {
        type: String,
      },
      projectName: {
        type: String,
      },
      users_list: [Object],
      status: { type: String },
    },
    jobHolder: {
      type: String,
    },
    task: {
      type: String,
      trim: true,
    },
    hours: {
      type: String,
    },
    startDate: {
      type: Date,
      default: new Date(),
    },
    deadline: {
      type: Date,
      default: new Date(),
    },
    status: {
      type: String,
      default: "Progress",
    },
    lead: {
      type: String,
    },
    estimate_Time: {
      type: String,
      default: "Om",
    },
    comments: [commentsSchema],
    label: {
      type: String,
    },
    activities: [activitySchema],
    subtasks: [subtask],
  },

  { timestamps: true }
);

export default mongoose.model("Tasks", taskSchema);
