 

import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import EmailThread from "../models/EmailThread.js";
import { createNotification } from "../utils/createNotification.js";
import { scheduleNotification } from "../../utils/customFns/scheduleNotification.js";
import { emitToUser } from "../../utils/socketEmitter.js";
import { getOtherParticipantEmail } from "../utils/utils.js";

export const addComment = async (req, res) => {
  try {
    const { threadId, content, isInternal = false, mentions = [], parentComment = null } = req.body;
    const userId = req.user.user._id;

    console.log("USERS❤️❤️❤️❤️❤️❤️", mentions)

    // 🔍 Validate thread 
    const thread = await EmailThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    // Normalize mentions (schema expects ObjectId[])
    const mentionIds = mentions.map(id => new mongoose.Types.ObjectId(id));

    const comment = await Comment.create({
      entity: "EmailThread",
      entityId: new mongoose.Types.ObjectId(threadId),
      author: new mongoose.Types.ObjectId(userId),
      content,
      isInternal,
      mentions: mentionIds,
      parentComment: parentComment ? new mongoose.Types.ObjectId(parentComment) : null,
      readBy: [
        {
          userId: new mongoose.Types.ObjectId(userId),
          readAt: new Date(),
        },
      ],
    });



    const notificationRecepients = new Set([...mentions, thread?.userId?.toString()])


    for (const recepient_id of notificationRecepients) {

      if(recepient_id !== userId) {
         
    console.log(recepient_id, userId)


const payload = {
    title: "New Comment 💬",
    redirectLink: `/mail?folder=inbox&companyName=${thread?.companyName}`,
    description: `${req.user.user.name} added a new comment!
          ✔ Subject: ${thread?.subject}
          ✔ From: ${getOtherParticipantEmail(thread?.participants, thread?.companyName === "affotax" ? "info@affotax.com" : "Admin@outsourceaccountings.co.uk")}
          `,
    taskId: `${thread._id}`,
    userId: recepient_id,
    type: "comment_received",
    entityType: `mailbox`,
  };

   scheduleNotification(true, payload);




       
          const eventName = `metadata:updated-${thread.companyName}`;
    
          emitToUser(recepient_id, eventName, {});


  }

    }



   
 
        /**
         * 6️⃣ Socket emits (skip self-assign)
         */

    
         



    res.status(201).json({
      success: true,
      commentId: comment._id,
    });
  } catch (err) {
    console.error("ADD COMMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};













export const getComments = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.user._id;

    const query = {
      entity: "EmailThread",
      entityId: new mongoose.Types.ObjectId(threadId),
    };

    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("author", "name email")
      .populate("mentions", "name email")
      .lean();

    // 🔔 Mark unread comments as read
    const unreadIds = comments
      .filter(
        c => !c.readBy?.some(r => r.user?.toString() === userId.toString())
      )
      .map(c => c._id);

    if (unreadIds.length > 0) {
      await Comment.updateMany(
        { _id: { $in: unreadIds } },
        {
          $addToSet: {
            readBy: {
              userId: new mongoose.Types.ObjectId(userId),
              readAt: new Date(),
            },
          },
        }
      );
    }

    res.json({
      data: comments,
      page: Number(page),
      limit: Number(limit),
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



































































 
// export const addComment = async (req, res) => {
//   try {
//     const { threadId, content, attachments, isInternal, mentions = [] } = req.body;
//     const userId = req.user.user._id;

//       const mentionsArr = mentions.map(({userId, name}) => {
//         return {
//           name: name,
//           userId: new mongoose.Types.ObjectId(userId),
//         }
//       })

//     // ✅ Create comment
//     const comment = await Comment.create({
//       threadId: threadId,        // store Mongo thread _id
//       userId: new mongoose.Types.ObjectId(userId),
//       content,
//       attachments,
//       isInternal,
//       mentions: mentionsArr,
//       readBy: [
//         {
//           userId: new mongoose.Types.ObjectId(userId),
//           readAt: new Date(),
//         },
//       ],
//     })


//           const eventName = `metadata:updated-${"outsource"}`;
    
//           // Assigned → Unassigned OR Reassigned
//           // if (mentionsArr.length > 0) {
//           //   emitToUser(oldUserId, eventName, {});
//           // }


//     res.status(201).json({
//       success: true
//     });
//   } catch (err) {
//     console.error("ADD COMMENT ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// /**
//  * Get all comments for a thread (with pagination)
//  */
// export const getComments = async (req, res) => {
//   try {
//     const { threadId } = req.params;
//     const { page = 1, limit = 20 } = req.query;
//     const userId = req.user.user._id;

//     const comments = await Comment.find({ threadId : new mongoose.Types.ObjectId(threadId), })
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit))
//       .populate("userId", "name email")
//       .populate("mentions.userId", "name email");


//       console.log("COMMENTS", comments)
//     // Mark fetched comments as read for the user
//     const unreadCommentIds = comments
//       .filter(c => !c.readBy.some(r => r.userId.toString() === userId.toString()))
//       .map(c => c._id);

//     if (unreadCommentIds.length > 0) {
//       await Comment.updateMany(
//         { _id: { $in: unreadCommentIds } },
//         { $push: { readBy: { userId, readAt: new Date() } } }
//       );

     
//     }

//     res.json(comments);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /**
//  * Delete a comment
//  */
// export const deleteComment = async (req, res) => {
//   try {
//     const { commentId } = req.params;

//     const deleted = await Comment.findByIdAndDelete(commentId);
//     if (!deleted) return res.status(404).json({ message: "Comment not found" });

//     // Update thread metadata
//     await EmailThread.findByIdAndUpdate(deleted.threadId, {
//       $inc: { commentCount: -1, unreadCount: -1 }
//     });

//     res.json({ message: "Comment deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };














































 