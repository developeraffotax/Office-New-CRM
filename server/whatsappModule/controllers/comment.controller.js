import mongoose from "mongoose";
 
 
import { createNotification } from "../utils/createNotification.js";
import { scheduleNotification } from "../../utils/customFns/scheduleNotification.js";
import { emitToAll, emitToUser } from "../../utils/socketEmitter.js";
import { getOtherParticipantEmail } from "../utils/utils.js";
import WhatsappConversation from "../models/WhatsappConversation.js";
import Comment from "../../emailModule/models/Comment.js";

export const addComment = async (req, res) => {
  try {
    const {
      conversationId,
      content,
      isInternal = false,
      mentions = [],
      parentComment = null,
    } = req.body;
    const userId = req.user.user._id;
 

    // 🔍 Validate thread
    const conversation = await WhatsappConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Thread not found" });
    }

    // Normalize mentions (schema expects ObjectId[])
    const mentionIds = mentions.map((id) => new mongoose.Types.ObjectId(id));

    const comment = await Comment.create({
      entity: "Whatsapp",
      entityId: new mongoose.Types.ObjectId(conversationId),
      author: new mongoose.Types.ObjectId(userId),
      content,
      isInternal,
      mentions: mentionIds,
      parentComment: parentComment
        ? new mongoose.Types.ObjectId(parentComment)
        : null,
      readBy: [
        {
          userId: new mongoose.Types.ObjectId(userId),
          readAt: new Date(),
        },
      ],
    });

    const notificationRecepients = new Set([
      ...mentions,
      conversation?.userId?.toString(),
    ]);

    for (const recepient_id of notificationRecepients) {
      if (recepient_id !== userId) {
 

        const payload = {
          title: "New Comment 💬",
          redirectLink: `/whatsapp/${conversation?._id}?companyName=${conversation?.companyName}`,
          description: `${req.user.user.name} added a new comment!
          ✔ Phone: ${conversation?.phone}
          ✔ Last Message: ${conversation?.lastMessage}
          `,
          taskId: `${conversation._id}`,
          userId: recepient_id,
          type: "comment_received",
          entityType: `whatsapp`,
        };

        scheduleNotification(true, payload);

      }
    }

    const eventName = `wa-comments:updated-${conversation.companyName}`;
 
    emitToAll(eventName, { conversationIds: [conversationId] });

    res.status(201).json({
      success: true,
      commentId: comment._id,
    });
  } catch (err) {
    console.error("ADD COMMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};














export const getUnreadCounts = async (req, res) => {
  try {
    const { conversationIds } = req.body;
    const userId = req.user.user._id;

    if (!Array.isArray(conversationIds) || conversationIds.length === 0) {
      return res.json({ success: true, unreadCounts: {} });
    }

    const unreadCounts = await Comment.aggregate([
      {
        $match: {
          // entity: "Whatsapp", can also add this
          entityId: {
            $in: conversationIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
          "readBy.userId": { $ne: new mongoose.Types.ObjectId(userId) }, // only unread for this user
        },
      },
      {
        $group: {
          _id: "$entityId",
          unreadCount: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = {};
    unreadCounts.forEach((u) => {
      unreadMap[u._id.toString()] = u.unreadCount;
    });

    console.log("UNREAD MAP🔐🔐🔐", unreadMap)


    res.json({ success: true, unreadCounts: unreadMap });
  } catch (err) {
    console.error("❌ Unread count error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch unread counts" });
  }
};
















export const getComments = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.user._id;


     const thread = await WhatsappConversation.findById(conversationId);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }


    const query = {
      entity: "Whatsapp",
      entityId: new mongoose.Types.ObjectId(conversationId),
    };

    const comments = await Comment.find(query)
      .sort({ createdAt: 1 })
      .populate("author", "name email avatar")
      .populate("mentions", "name email")
      .populate("readBy.userId", "name email avatar")
      .lean();

    // 🔔 Mark unread comments as read
    const unreadIds = comments
      .filter(
        (c) =>
          !c.readBy?.some(
            (r) => r.userId?._id?.toString() === userId.toString(),
          ),
      )
      .map((c) => c._id);
 

    if (unreadIds.length > 0) {
      await Comment.updateMany(
        {
          _id: { $in: unreadIds },
          "readBy.userId": { $ne: new mongoose.Types.ObjectId(userId) },
        },
        {
          $push: {
            readBy: {
              userId: new mongoose.Types.ObjectId(userId),
              readAt: new Date(),
            },
          },
        },
      );
    }



    const eventName = `wa-comments:updated-${thread?.companyName}`;

    emitToUser(userId ,eventName, { conversationIds: [conversationId] });

    res.json({
      data: comments,
      // page: Number(page),
      // limit: Number(limit),
    });
  } catch (err) {
    console.error("GET COMMENTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
















export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Optional: only author or admin can delete
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    comment.metadata = {
      ...comment.metadata,
      deletedAt: new Date(),
      deletedBy: userId,
    };

    comment.content = "[deleted]";
    await comment.save();

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

















 