import goalModel from "../models/goalModel.js";
import jobsModel from "../models/jobsModel.js";
import notificationModel from "../models/notificationModel.js";
import taskModel from "../models/taskModel.js";
import ticketModel from "../models/ticketModel.js";
import userModel from "../models/userModel.js";

// Create Comment
export const createComment = async (req, res) => {
  const senderId = req.user.user._id;
  // console.log("senderId:", senderId);
  try {
    const { comment, jobId, type, mentionUser } = req.body;

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
        senderId: req?.user?.user?._id,
        commentReplies: [],
        likes: [],
      };

      job.comments.push(newComment);

      await job.save();
      console.log("mentionUser:", mentionUser);

      // Create Notification
      const user = await userModel.findOne({
        name: mentionUser ? mentionUser.trim() : job?.job?.jobHolder,
      });

      console.log("userData:", user);

      const notification = await notificationModel.create({
        title: "New comment received!",
        redirectLink: `/job-planning?comment_taskId=${jobId}`,
        description: `${req?.user?.user?.name} added a new comment on job "${job?.job?.jobName}".\n\n— Company Name: ${job?.companyName}\n— Client Name: ${job?.clientName}`,
        taskId: jobId,
        userId: user?._id,
        
        // companyName: job?.companyName,
        // clientName: job?.clientName,
      });

      res.status(200).send({
        success: true,
        message: "Comment Posted!",
        job: job,
        notification: notification,
      });
    } else if (type === "Task") {
      const task = await taskModel.findById(jobId);
      if (!task) {
        return res.status(400).send({
          success: false,
          message: "Task not found!",
        });
      }

      console.log("task:", task);

      const newComment = {
        user: req.user.user,
        comment: comment,
        commentReplies: [],
        senderId: senderId,
        likes: [],
      };

      task.comments.push(newComment);

      await task.save();

      const taskHolderName = task.jobHolder;
      console.log("Task User Name:", taskHolderName);

      // Create Notification
      const user = await userModel.findOne({ name: taskHolderName });

      if (!user) {
        console.log("Task User: null");
        return res.status(404).json({ error: "Task holder not found" });
      }

      console.log("Task User:", user);

      const notification = await notificationModel.create({
        title: "New comment received!",
        redirectLink:`/tasks?comment_taskId=${jobId}`,
        description: `${req.user.user.name} add a new comment in task "${task.task}". ${comment}`,
        taskId: jobId,
        userId: user._id,
      });

      res.status(200).send({
        success: true,
        message: "Comment Posted!",
        job: task,
        notification: notification,
      });
    } else if (type === "Goals") {
      const goal = await goalModel.findById({ _id: jobId });
      if (!goal) {
        return res.status(400).send({
          success: false,
          message: "Goal not found!",
        });
      }

      const newComment = {
        user: req.user.user,
        comment: comment,
        commentReplies: [],
        senderId: senderId,
        mentionUser: mentionUser,
        likes: [],
      };

      goal.comments.push(newComment);

      await goal.save();

      const jobHolderId = goal.jobHolder;
      console.log("jobHolderId:", jobHolderId);

      // Create Notification
      const user = await userModel.findOne(
        mentionUser ? { name: mentionUser } : { _id: jobHolderId }
      );

      if (!user) {
        return res.status(404).json({ error: "Jobholder not found!" });
      }

      console.log("Goal User:", user);

      const notification = await notificationModel.create({
        title: "New comment received!",
        redirectLink: `/goals?comment_taskId=${jobId}`,
        description: `${req.user.user.name} add a new comment in goals "${goal.subject}". ${comment}`,
        taskId: jobId,
        userId: user._id,
      });

      res.status(200).send({
        success: true,
        message: "Comment Posted!",
        job: goal,
        notification: notification,
      });
    } else {
      const ticket = await ticketModel.findById(jobId);
      if (!ticket) {
        return res.status(400).send({
          success: false,
          message: "Ticket not found!",
        });
      }

      const newComment = {
        user: req.user.user,
        comment: comment,
        commentReplies: [],
        senderId: senderId,
        likes: [],
      };

      ticket.comments.push(newComment);

      await ticket.save();

      // Create Notification
      const user = await userModel
        .findOne({
          name: mentionUser ? mentionUser : ticket.jobHolder,
        })
        .exec();

      const notification = await notificationModel.create({
        title: "New comment received!",
        redirectLink: `/tickets?comment_taskId=${jobId}`,
        description: `${req.user.user.name} add a new comment in ticket "${ticket.subject}". ${comment}`,
        taskId: jobId,
        userId: user._id,
      });

      res.status(200).send({
        success: true,
        message: "Comment Posted!",
        job: ticket,
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
      comment.status = "read";

      await job.save();

      // Create Notification
      const user = await userModel.findOne({ name: job.job.jobHolder });

      const notification = await notificationModel.create({
        title: "New comment reply received!",
        redirectLink: "/job-planning",
        description: `${req.user.user.name} add a new comment reply in "${job.job.jobName}". ${commentReply}`,
        taskId: jobId,
        userId: comment.senderId,
      });

      res.status(200).send({
        success: true,
        message: "Reply Posted!",
        job: job,
        notification: notification,
      });
    } else if (type === "Task") {
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
      comment.status = "read";

      await task.save();

      // Create Notification
      const user = await userModel.findOne({ name: task.jobHolder });

      const notification = await notificationModel.create({
        title: "New comment reply received!",
        redirectLink: "/tasks",
        description: `${req.user.user.name} add a new comment reply of task "${task.task}". ${commentReply}`,
        taskId: jobId,
        userId: comment.senderId,
      });

      res.status(200).send({
        success: true,
        message: "Reply Posted!",
        job: task,
        notification: notification,
      });
    } else if (type === "Goals") {
      const goal = await goalModel.findById(jobId);
      if (!goal) {
        return res.status(400).send({
          success: false,
          message: "Goal not found!",
        });
      }
      const comment = goal.comments.find((item) => item._id.equals(commentId));
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
      comment.status = "read";

      await goal.save();

      // Create Notification
      const user = await userModel.findOne(
        mentionUser ? { name: mentionUser } : { _id: goal.jobHolder }
      );

      console.log("user:", user);

      const notification = await notificationModel.create({
        title: "New comment reply received!",
        redirectLink: "/goals",
        description: `${req.user.user.name} add a new comment reply of goals "${goal.subject}". ${commentReply}`,
        taskId: jobId,
        userId: comment.senderId,
      });

      res.status(200).send({
        success: true,
        message: "Reply Posted!",
        job: goal,
        notification: notification,
      });
    } else {
      const ticket = await ticketModel.findById(jobId);
      if (!ticket) {
        return res.status(400).send({
          success: false,
          message: "Ticket not found!",
        });
      }
      const comment = ticket.comments.find((item) =>
        item._id.equals(commentId)
      );
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
      comment.status = "read";

      await ticket.save();

      // Create Notification
      const user = await userModel.findOne({ name: ticket.jobHolder });

      const notification = await notificationModel.create({
        title: "New comment reply received!",
        redirectLink: "/tickets",
        description: `${req.user.user.name} add a new comment reply of ticket "${ticket.subject}". ${commentReply}`,
        taskId: jobId,
        userId: comment.senderId,
      });

      res.status(200).send({
        success: true,
        message: "Reply Posted!",
        job: ticket,
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
      comment.status = "read";
      await job.save();

      res.status(200).send({
        success: true,
        message: "Comment liked successfully!",
      });
    } else if (type === "Task") {
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
      comment.status = "read";
      await task.save();

      res.status(200).send({
        success: true,
        message: "Comment liked successfully!",
      });
    } else if (type === "Goals") {
      const goal = await goalModel.findById(jobId);
      if (!goal) {
        return res.status(400).send({
          success: false,
          message: "Goal not found!",
        });
      }
      const comment = goal.comments.find((item) => item._id.equals(commentId));
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
      comment.status = "read";
      await goal.save();

      res.status(200).send({
        success: true,
        message: "Comment liked successfully!",
      });
    } else {
      const ticket = await ticketModel.findById(jobId);
      if (!ticket) {
        return res.status(400).send({
          success: false,
          message: "Ticket not found!",
        });
      }
      const comment = ticket.comments.find((item) =>
        item._id.equals(commentId)
      );
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
      comment.status = "read";
      await ticket.save();

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
    } else if (type === "Task") {
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
    } else if (type === "Goals") {
      const goal = await goalModel.findById(jobId);
      if (!goal) {
        return res.status(400).send({
          success: false,
          message: "Goal not found!",
        });
      }
      const comment = goal.comments.find((item) => item._id.equals(commentId));
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
      await goal.save();

      res.status(200).send({
        success: true,
        message: "Comment unliked successfully!",
      });
    } else {
      const ticket = await ticketModel.findById(jobId);
      if (!ticket) {
        return res.status(400).send({
          success: false,
          message: "Ticket not found!",
        });
      }
      const comment = ticket.comments.find((item) =>
        item._id.equals(commentId)
      );
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
      await ticket.save();

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
