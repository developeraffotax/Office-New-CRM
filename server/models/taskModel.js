import mongoose from "mongoose";
import { generateRef } from "../utils/generateRef.js";

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
    order: {
      type: Number,
    },
    
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    // project: {
    //   _id: {
    //     type: String,
    //   },
    //   projectName: {
    //     type: String,
    //   },
    //   users_list: [Object],
    //   status: { type: String },
    // },

     project: { type: mongoose.Schema.Types.ObjectId, ref: "Projects" },

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
      default: () => new Date(),
    },
    deadline: {
      type: Date,
      default: () => new Date(),
    },


    taskDate: {
      type: Date,
      default: Date.now,
    },



    status: {
      type: String,
    },
    lead: {
      type: String,
    },
    estimate_Time: {
      type: String,
      default: "Om",
    },
    comments: [commentsSchema],
    labal: labelSchema,
    activities: [activitySchema],
    subtasks: [subtask],
    recurring: {
      type: String,
      // enum: ["2_minutes", "daily", "weekly", "monthly", "quarterly"],
      default: "",
    },
    nextRecurringDate: {
      type: Date,
      default: () => new Date(),
    },

    deleteCompletedRecurringSubtasks: {
      type: Boolean,
      default: false,
    },


    taskRef: { type: Number, unique: true },



  },

  { timestamps: true }
);




taskSchema.pre("save", async function (next) {
  if (this.taskRef) return next();
  this.taskRef = await generateRef("task");
  next();
});

export default mongoose.model("Tasks", taskSchema);
