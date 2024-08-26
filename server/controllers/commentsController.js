import jobsModel from "../models/jobsModel.js";
import notificationModel from "../models/notificationModel.js";
import taskModel from "../models/taskModel.js";
import userModel from "../models/userModel.js";

// Create Comment
export const createComment = async (req, res) => {
  try {
    const { comment, jobId, type } = req.body;

    if (type === "Jobs") {
      const job = await jobsModel.findById(jobId);
      if (!job) {
        return res.status(400).send({
          success: false,
          message: "Job not found!",
        });
      }

      const newComment = {
        user: req.user.user,
        comment: comment,
        commentReplies: [],
        likes: [],
      };

      job.comments.push(newComment);

      await job.save();

      // Create Notification
      const user = await userModel.findOne({ name: job.job.jobHolder });

      const notification = await notificationModel.create({
        title: "New comment received!",
        redirectLink: "/job-planning",
        description: `${req.user.user.name} add a new comment of "${job.job.jobName}". ${comment}`,
        taskId: jobId,
        userId: user._id,
      });

      res.status(200).send({
        success: true,
        message: "Comment Posted!",
        job: job,
        notification: notification,
      });
    } else {
      const task = await taskModel.findById(jobId);
      if (!task) {
        return res.status(400).send({
          success: false,
          message: "Task not found!",
        });
      }

      const newComment = {
        user: req.user.user,
        comment: comment,
        commentReplies: [],
        likes: [],
      };

      task.comments.push(newComment);

      await task.save();

      // Create Notification
      const user = await userModel.findOne({ name: task.jobHolder });

      const notification = await notificationModel.create({
        title: "New comment received!",
        redirectLink: "/tasks",
        description: `${req.user.user.name} add a new comment of task "${task.task}". ${comment}`,
        taskId: jobId,
        userId: user._id,
      });

      res.status(200).send({
        success: true,
        message: "Comment Posted!",
        job: task,
        notification: notification,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in add comments!",
      error: error,
    });
  }
};

// Add Comment Reply
export const commentReply = async (req, res) => {
  try {
    const { commentReply, jobId, commentId, type } = req.body;

    if (type === "Jobs") {
      const job = await jobsModel.findById(jobId);
      if (!job) {
        return res.status(400).send({
          success: false,
          message: "Job not found!",
        });
      }
      const comment = job.comments.find((item) => item._id.equals(commentId));
      if (!comment) {
        return res.status(400).send({
          success: false,
          message: "Invalid comment id!",
        });
      }

      // Replay
      const newReply = {
        user: req.user.user,
        reply: commentReply,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      comment.commentReplies.push(newReply);

      await job.save();

      // Create Notification
      const user = await userModel.findOne({ name: job.job.jobHolder });

      const notification = await notificationModel.create({
        title: "New comment reply received!",
        redirectLink: "/job-planning",
        description: `${req.user.user.name} add a new comment reply of "${job.job.jobName}". ${commentReply}`,
        taskId: jobId,
        userId: user._id,
      });

      res.status(200).send({
        success: true,
        message: "Reply Posted!",
        job: job,
        notification: notification,
      });
    } else {
      const task = await taskModel.findById(jobId);
      if (!task) {
        return res.status(400).send({
          success: false,
          message: "Task not found!",
        });
      }
      const comment = task.comments.find((item) => item._id.equals(commentId));
      if (!comment) {
        return res.status(400).send({
          success: false,
          message: "Invalid comment id!",
        });
      }

      // Replay
      const newReply = {
        user: req.user.user,
        reply: commentReply,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      comment.commentReplies.push(newReply);

      await task.save();

      // Create Notification
      const user = await userModel.findOne({ name: task.jobHolder });

      const notification = await notificationModel.create({
        title: "New comment reply received!",
        redirectLink: "/tasks",
        description: `${req.user.user.name} add a new comment reply of task "${task.task}". ${commentReply}`,
        taskId: jobId,
        userId: user._id,
      });

      res.status(200).send({
        success: true,
        message: "Reply Posted!",
        job: task,
        notification: notification,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in job comment reply!",
      error: error,
    });
  }
};

// Like Comment
export const likeComment = async (req, res) => {
  try {
    const { jobId, commentId, type } = req.body;

    if (type === "Jobs") {
      const job = await jobsModel.findById(jobId);
      if (!job) {
        return res.status(400).send({
          success: false,
          message: "Job not found!",
        });
      }
      const comment = job.comments.find((item) => item._id.equals(commentId));
      if (!comment) {
        return res.status(400).send({
          success: false,
          message: "Invalid comment id!",
        });
      }

      if (comment.likes.includes(req.user.id)) {
        return res.status(400).send({
          success: false,
          message: "Comment already liked!",
        });
      }

      comment.likes.push(req.user.id);
      await job.save();

      res.status(200).send({
        success: true,
        message: "Comment liked successfully!",
      });
    } else {
      const task = await taskModel.findById(jobId);
      if (!task) {
        return res.status(400).send({
          success: false,
          message: "Task not found!",
        });
      }
      const comment = task.comments.find((item) => item._id.equals(commentId));
      if (!comment) {
        return res.status(400).send({
          success: false,
          message: "Invalid comment id!",
        });
      }

      if (comment.likes.includes(req.user.id)) {
        return res.status(400).send({
          success: false,
          message: "Comment already liked!",
        });
      }

      comment.likes.push(req.user.id);
      await task.save();

      res.status(200).send({
        success: true,
        message: "Comment liked successfully!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in like comment!",
      error: error,
    });
  }
};

// Unlike Comment
export const unLikeComment = async (req, res) => {
  try {
    const { jobId, commentId, type } = req.body;

    if (type === "Jobs") {
      const job = await jobsModel.findById(jobId);
      if (!job) {
        return res.status(400).send({
          success: false,
          message: "Job not found!",
        });
      }
      const comment = job.comments.find((item) => item._id.equals(commentId));
      if (!comment) {
        return res.status(400).send({
          success: false,
          message: "Invalid comment id!",
        });
      }

      if (!comment.likes.includes(req.user.id)) {
        return res.status(400).send({
          success: false,
          message: "Post not liked yet!",
        });
      }

      comment.likes = comment.likes.filter(
        (id) => id.toString() !== req.user.id
      );
      await job.save();

      res.status(200).send({
        success: true,
        message: "Comment unliked successfully!",
      });
    } else {
      const task = await taskModel.findById(jobId);
      if (!task) {
        return res.status(400).send({
          success: false,
          message: "Task not found!",
        });
      }
      const comment = task.comments.find((item) => item._id.equals(commentId));
      if (!comment) {
        return res.status(400).send({
          success: false,
          message: "Invalid comment id!",
        });
      }

      if (!comment.likes.includes(req.user.id)) {
        return res.status(400).send({
          success: false,
          message: "Post not liked yet!",
        });
      }

      comment.likes = comment.likes.filter(
        (id) => id.toString() !== req.user.id
      );
      await task.save();

      res.status(200).send({
        success: true,
        message: "Comment unliked successfully!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in unlike comment!",
      error: error,
    });
  }
};
