import EmailThread from "../models/EmailThread.js";
import mongoose from "mongoose";
import { getGmailClient } from "../services/gmail.service.js";
import {
  buildFilterQuery,
  getOtherParticipantEmail,
  isSelfAssignment,
} from "../utils/utils.js";
import { scheduleNotification } from "../../utils/customFns/scheduleNotification.js";
import { createNotification } from "../utils/createNotification.js";
import { emitToAll, emitToUser } from "../../utils/socketEmitter.js";
import Comment from "../models/Comment.js";
import EmailMessage from "../models/EmailMessage.js";

/**
 * GET /api/email/inbox
 * Query params:
 *  - userId (required)
 *  - companyName (optional)
 *  - category (optional: support | lead | client | other)
 *  - startDate (optional: ISO date)
 *  - endDate (optional: ISO date)
 *  - unreadOnly (optional: true/false)
 *  - page (default: 1)
 *  - limit (default: 20)
 */

export const getMailbox = async (req, res) => {
  try {
    const query = buildFilterQuery(req);
    // console.log("Mongo Query:", JSON.stringify(query, null, 2));

    const pageNumber = Math.max(parseInt(req.query.page) || 1, 1);
    const pageSize = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (pageNumber - 1) * pageSize;

    const dateField =
      req.query.folder === "sent" ? "lastMessageAtSent" : "lastMessageAtInbox";

    const [threads, total] = await Promise.all([
      EmailThread.find(query)
        .sort({ [dateField]: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      EmailThread.countDocuments(query),
    ]);

    //   const threadIds = threads.map(t => t._id);
    // const userId = req.user.user._id;

    // // 2️⃣ Aggregate unread comment counts per thread for this user
    // const unreadCounts = await Comment.aggregate([
    //   {
    //     $match: {
    //       entityId: { $in: threadIds },
    //       "readBy.userId": { $ne: new mongoose.Types.ObjectId(userId) }, // only unread for this user
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$entityId",
    //       unreadCount: { $sum: 1 },
    //     },
    //   },
    // ]);

    // const unreadMap = {};
    // unreadCounts.forEach(u => {
    //   unreadMap[u._id.toString()] = u.unreadCount;
    // });

    // // 3️⃣ Map unread count into threads
    // const enhancedThreads = threads.map(thread => ({
    //   ...thread,
    //   unreadComments: unreadMap[thread._id.toString()] || 0, // default 0 if no unread comments
    // }));

    res.json({
      success: true,
      threads: threads,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("❌ Thread fetch error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch threads" });
  }
};

export const getUnreadCounts2 = async (req, res) => {
  try {
    const user = req?.user?.user;
    const userId = user?._id;
    const isAdmin = user?.role?.name === "Admin";

    const query = {
      unreadCount: { $gte: 1 },
      hasInboxMessage: true,
    };

    if (!isAdmin) {
      query.userId = userId;
    } else {
      // Admins: threads where userId is missing or null
      query.$or = [{ userId: { $exists: false } }, { userId: null }];
    }

    const affotax = await EmailThread.countDocuments({
      companyName: "affotax",
      ...query,
    });

    const outsource = await EmailThread.countDocuments({
      companyName: "outsource",
      ...query,
    });

    res.status(200).json({
      success: true,
      counts: {
        affotax,
        outsource,
      },
    });
  } catch (err) {
    console.error("❌ Thread count error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread counts for inbox",
    });
  }
};
















export const getUnreadCounts = async (req, res) => {
  try {
    const user = req?.user?.user;
    const userId = new mongoose.Types.ObjectId(user?._id);
    const isAdmin = user?.role?.name === "Admin";

    const baseMatch = {
      hasInboxMessage: true,
      lastMessageAtInbox: { $ne: null },
    };
    
    if (!isAdmin) {
      baseMatch.userId = userId;
    }  

    const buildPipeline = (companyName) => [
      {
        $match: {
          companyName,
          ...baseMatch,
        },
      },

      // Extract user's read record
      {
        $addFields: {
          userRead: {
            $first: {
              $filter: {
                input: "$readBy",
                as: "r",
                cond: {
                  $eq: ["$$r.userId", userId],
                },
              },
            },
          },
        },
      },

      // Keep unread only
      {
        $match: {
          $expr: {
            $or: [
              // User never read
              { $eq: ["$userRead", null] },

              // User read older messages
              {
                $lt: [
                  "$userRead.lastReadAt",
                  "$lastMessageAtInbox",
                ],
              },
            ],
          },
        },
      },

      {
        $count: "total",
      },
    ];

    const [affotaxResult] = await EmailThread.aggregate(
      buildPipeline("affotax")
    );

    const [outsourceResult] = await EmailThread.aggregate(
      buildPipeline("outsource")
    );

    res.status(200).json({
      success: true,
      counts: {
        affotax: affotaxResult?.total || 0,
        outsource: outsourceResult?.total || 0,
      },
    });

  } catch (err) {
    console.error("❌ Thread count error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch unread counts for inbox",
      error: err.message,
    });
  }
};




// ------------------ Inbox ------------------
// GET /api/v1/gmail/threads
// export const getMailbox = async (req, res) => {
//   try {
//     const {
//       userId,
//       companyName,
//       category,
//       folder = "inbox", // inbox | sent
//       startDate,
//       endDate,
//       unreadOnly,
//       page = 1,
//       limit = 20,
//       search,
//     } = req.query;

//     const query = {};
//     const andFilters = [];

//     // ---------------- Folder logic ----------------
//     if (folder === "inbox") {
//       query.hasInboxMessage = true;
//     }

//     if (folder === "sent") {
//       query.hasSentMessage = true;
//     }

//     // ---- User filter ----
//     if (userId) {
//   if (userId === "unassigned") {
//     andFilters.push({ $or: buildUnassignedFilter("userId") });
//   } else if (mongoose.Types.ObjectId.isValid(userId)) {
//     andFilters.push({ userId: new mongoose.Types.ObjectId(userId) });
//   }
// }

//     if (companyName) query.companyName = companyName;

//     // ---- Category filter ----
// if (category) {
//   if (category === "unassigned") {
//     andFilters.push({ $or: buildUnassignedFilter("category") });
//   } else {
//     andFilters.push({ category });
//   }
// }
//     if (unreadOnly === "true") {
//       query.unreadCount = { $gt: 0 };
//     }

//     // ---------------- Date filter (per folder) ----------------
//     const dateField =
//       folder === "sent" ? "lastMessageAtSent" : "lastMessageAtInbox";

//     if (startDate || endDate) {
//       query[dateField] = {};
//       if (startDate) query[dateField].$gte = new Date(startDate);
//       if (endDate) query[dateField].$lte = new Date(endDate);
//     }

//     // ---------------- Search ----------------
//     if (search && search.trim()) {
//       const searchRegex = new RegExp(search.trim(), "i");

//       query.$or = [
//         { subject: searchRegex },
//         { "participants.email": searchRegex },
//         { "participants.name": searchRegex },
//       ];
//     }

//     if (andFilters.length) {
//       query.$and = andFilters;
//     }

//     const pageNumber = Math.max(parseInt(page), 1);
//     const pageSize = Math.min(parseInt(limit), 100);
//     const skip = (pageNumber - 1) * pageSize;

//     const [threads, total] = await Promise.all([
//       EmailThread.find(query)
//         .sort({ [dateField]: -1 })
//         .skip(skip)
//         .limit(pageSize)
//         .lean(),
//       EmailThread.countDocuments(query),
//     ]);

//     res.json({
//       success: true,
//       threads,
//       pagination: {
//         page: pageNumber,
//         limit: pageSize,
//         total,
//         totalPages: Math.ceil(total / pageSize),
//       },
//     });
//   } catch (error) {
//     console.error("❌ Thread fetch error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch threads",
//     });
//   }
// };

// ------------------ Sent ------------------
export const getSentItems = async (req, res) => {
  try {
    const {
      userId,
      companyName,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { hasSentMessage: true };

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    if (companyName) query.companyName = companyName;
    if (category) query.category = category;

    if (startDate || endDate) {
      query.lastMessageAtSent = {};
      if (startDate) query.lastMessageAtSent.$gte = new Date(startDate);
      if (endDate) query.lastMessageAtSent.$lte = new Date(endDate);
    }

    const pageNumber = Math.max(parseInt(page), 1);
    const pageSize = Math.min(parseInt(limit), 100);
    const skip = (pageNumber - 1) * pageSize;

    const [threads, total] = await Promise.all([
      EmailThread.find(query)
        .sort({ lastMessageAtSent: -1 }) // Gmail Sent order
        .skip(skip)
        .limit(pageSize)
        .lean(),
      EmailThread.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      threads,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("❌ Sent items fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sent emails",
    });
  }
};

export const updateThreadMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    /**
     * 1️⃣ Whitelist validation
     */
    const allowedUpdates = ["category", "userId", "status"];
    const updateKeys = Object.keys(updates);

    const isValidUpdate = updateKeys.every((key) =>
      allowedUpdates.includes(key),
    );

    if (!isValidUpdate) {
      return res.status(400).json({
        success: false,
        message: "Invalid fields in update!",
      });
    }

    /**
     * 2️⃣ Fetch old thread
     */
    const oldThread = await EmailThread.findById(id);
    if (!oldThread) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found!",
      });
    }

    if (updates?.userId) {
      updates.userId = new mongoose.Types.ObjectId(updates.userId);
    }


    /**
     * 3️⃣ Update thread
     */
    const updatedThread = await EmailThread.findOneAndUpdate({_id: id}, {$set: {...updates}}, {
      new: true,
      runValidators: true,
       updatedBy: req?.user?.user?._id
    })

    // console.log("UPDATED THREAD✔️", updatedThread)

    /**
     * 4️⃣ Assignment diff
     */
    const oldUserId = oldThread.userId?.toString() || null;
    const newUserId = updatedThread.userId?.toString() || null;

    const selfAssign = isSelfAssignment(req?.user?.user, newUserId);

    /**
     * 5️⃣ Notifications (skip self-assign)
     */
    if (updateKeys.includes("userId") && !selfAssign) {
      await createNotification(req, updatedThread);
    }

    /**
     * 6️⃣ Socket emits (skip self-assign)
     */

    const eventName = `metadata:updated-${updatedThread.companyName}`;

    // Assigned → Unassigned OR Reassigned
    if (oldUserId && !isSelfAssignment(req?.user?.user, oldUserId)) {
      emitToUser(oldUserId, eventName, {});
    }

    // Unassigned → Assigned OR Reassigned
    if (
      newUserId &&
      newUserId !== oldUserId &&
      !isSelfAssignment(req?.user?.user, newUserId)
    ) {
      emitToUser(newUserId, eventName, {});
    }

    /**
     * 7️⃣ Response
     */
    res.status(200).json({
      success: true,
      message: "Thread updated successfully!",
      thread: updatedThread,
    });
  } catch (error) {
    console.error("Error updating thread:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating thread.",
      error: error.message,
    });
  }
};

























/**
 * PATCH /api/v1/gmail/mark-as-unread/:id
 * Marks the thread as unread
 * Updates both Gmail and local DB
 */
export const markThreadAsUnread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { companyName } = req.body;

    const userId = req.user.user._id;
    const roleName = req.user.user.role.name;

    // ----------- Find thread -----------
    const thread = await EmailThread.findOne({
      threadId: threadId,
      companyName: companyName,
    });

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: "Thread not found",
      });
    }

    const now = new Date();

    // ---------------- Update readBy ----------------
    if (!thread.readBy) thread.readBy = [];

    const existingUser = thread.readBy.find(
      (r) => r.userId.toString() === userId.toString(),
    );

    let alreadyUnread = false;

    if (existingUser) {
      // If user's lastReadAt is already before last message → already unread
      alreadyUnread =
        !existingUser.lastReadAt ||
        existingUser.lastReadAt < thread.lastMessageAtInbox;

      // Move lastReadAt BEFORE latest message
      existingUser.lastReadAt = new Date(
        thread.lastMessageAtInbox.getTime() - 1000
      );
    } else {
      // User never read → already unread
      alreadyUnread = true;

      // Add entry marking unread
      thread.readBy.push({
        userId,
        lastReadAt: new Date(
          thread.lastMessageAtInbox.getTime() - 1000
        ),
      });
    }

    // ----------- Gmail update (Admin only) -----------
    if (roleName === "Admin") {
      const gmailClient = await getGmailClient(companyName);

      if (gmailClient && thread.threadId) {
        await gmailClient.users.threads.modify({
          userId: "me",
          id: thread.threadId,
          requestBody: {
            addLabelIds: ["UNREAD"],
          },
        });
      }

      // Optional: keep legacy unreadCount support
      thread.unreadCount = 1;
    }

    await thread.save();

    res.status(200).json({
      success: true,
      message: "Thread marked as unread",
      thread,
      alreadyUnread,
    });

  } catch (error) {
    console.error("Error marking thread as unread:", error);

    res.status(500).json({
      success: false,
      message: "Failed to mark thread as unread",
      error: error.message,
    });
  }
};














































/**
 * PATCH /api/v1/gmail/mark-as-read/:id
 * Marks the thread as read (unreadCount = 0)
 * Updates both Gmail and local DB
 */
export const markThreadAsRead = async (req, res) => {
  try {
    const { threadId } = req.params; // MongoDB _id
    const { companyName } = req.body;
    const userId = req.user.user._id;
    const roleName = req.user.user.role.name;
    const now = new Date();

    // Find the thread
    const thread = await EmailThread.findOne({
      threadId: threadId,
      companyName: companyName,
    });
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: "Thread not found",
      });
    }


    // ---------------- Update readBy (Upsert user) ----------------
    if (!thread.readBy) thread.readBy = [];
    const existingUser = thread.readBy.find(
      (r) => r.userId.toString() === userId.toString(),
    );

      let alreadyRead = false;

      if (existingUser) {
        // Check if lastReadAt is already after latest message
        alreadyRead = existingUser.lastReadAt && existingUser.lastReadAt >= thread.lastMessageAtInbox;
        // Always update lastReadAt to now
        existingUser.lastReadAt = now;
      } else {
        // New user entry
        thread.readBy.push({ userId, lastReadAt: now });
        
        if (thread.hasInboxMessage) {
          alreadyRead = false;

        } else {
          alreadyRead = true;
        }
      }

    if (roleName === "Admin") {
      const gmailClient = await getGmailClient(companyName);
      if (gmailClient && thread.threadId) {
        await gmailClient.users.threads.modify({
          userId: "me",
          id: thread.threadId,
          requestBody: {
            removeLabelIds: ["UNREAD"],
          },
        });
      }

      thread.unreadCount = 0;
    }

    await thread.save();

    res.status(200).json({
      success: true, 
      message: "Thread marked as read",
      thread,
      alreadyRead: alreadyRead,
    });
  } catch (error) {
    console.error("Error marking thread as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark thread as read",
      error: error.message,
    });
  }
};









































/**
 * DELETE /api/v1/gmail/delete-thread/:id
 * Deletes the thread from Gmail (if applicable) and local DB
 */
export const deleteThread = async (req, res) => {
  try {
    const { threadId } = req.params; // MongoDB _id
    const { companyName } = req.body;

    // Find the thread in local DB
    const thread = await EmailThread.findOne({ threadId, companyName });
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: "Thread not found",
      });
    }

    // ----------- 1. Delete from Gmail (if Gmail client available) -----------
    const gmailClient = await getGmailClient(companyName);
    if (gmailClient && thread.threadId) {
      await gmailClient.users.threads.trash({
        userId: "me",
        id: thread.threadId,
      });

      // await gmailClient.users.threads.modify({
      //   userId: "me",
      //   id: thread.threadId,
      //   removeLabelIds: ["INBOX", "SENT"],
      //   addLabelIds: ["TRASH"],
      // });
    }

    // ----------- 2. Delete from local DB -----------
    // await EmailThread.deleteOne({ threadId, companyName });

    // const eventName = `metadata:updated-${thread.companyName}`;
    // const assignedUserId = thread.userId?.toString() || null;

    // if (assignedUserId && !isSelfAssignment(req?.user?.user, assignedUserId)) {
    //   emitToUser(assignedUserId, eventName, {});
    // }

    res.status(200).json({
      success: true,
      message: "Thread deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting thread:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete thread",
      error: error.message,
    });
  }
};

export const toggleStarredThread = async (req, res) => {
  try {
    const { threadId } = req.params; // MongoDB _id
    const { companyName } = req.body;

    // Find the thread in local DB
    const thread = await EmailThread.findOne({ threadId, companyName });
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: "Thread not found",
      });
    }

    // ----------- 1. Delete from Gmail (if Gmail client available) -----------
    const gmailClient = await getGmailClient(companyName);
    const isStarred = thread.labels?.includes("STARRED");

    const updateObject = {
      userId: "me",
      id: thread.threadId,
    };

    if (isStarred) {
      updateObject.removeLabelIds = ["STARRED"];
    } else {
      updateObject.addLabelIds = ["STARRED"];
    }

    if (gmailClient && thread.threadId) {
      await gmailClient.users.threads.modify(updateObject);
    }

    res.status(200).json({
      success: true,
      isStarred: isStarred,
      message: isStarred ? "Thread unstarred" : "Thread starred",
    });
  } catch (error) {
    console.error("Error starring thread:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update starred status",
      error: error.message,
    });
  }
};

export const getMailboxUserCounts = async (req, res) => {
  try {
    const query = buildFilterQuery(req);

    // 🔥 Deep clone to avoid mutation
    const countQuery = structuredClone(query);

    // --------------------------------------------------
    // Remove userId filter from $and
    // --------------------------------------------------
    if (countQuery.$and) {
      countQuery.$and = countQuery.$and.filter((condition) => {
        if (condition.userId) return false;

        if (condition.$or) {
          const containsUserId = condition.$or.some(
            (c) => c.userId !== undefined,
          );
          if (containsUserId) return false;
        }

        return true;
      });

      if (countQuery.$and.length === 0) {
        delete countQuery.$and;
      }
    }

    // --------------------------------------------------
    // Aggregate User Counts
    // --------------------------------------------------
    const userCountsAgg = await EmailThread.aggregate([
      { $match: countQuery },
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 },
        },
      },
    ]);

    const userCounts = userCountsAgg.map((item) => ({
      userId: item._id ? item._id.toString() : "unassigned",
      count: item.count,
    }));

    const unassignedCount = await EmailThread.countDocuments({
      ...countQuery,
      $or: [{ userId: { $exists: false } }, { userId: null }],
    });

    const total = await EmailThread.countDocuments(countQuery);

    res.json({
      success: true,
      userCounts,
      unassignedCount,
      allCount: total,
    });
  } catch (error) {
    console.error("❌ User count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch mailbox counts",
    });
  }
};

export const getThreadMessageUsers = async (req, res) => {
  try {
    const { threadId, companyName } = req.query;

    if (!threadId || !companyName) {
      return res.status(400).json({
        success: false,
        message: "threadId and companyName are required",
      });
    }

    // get messages
    const messages = await EmailMessage.find({
      gmailThreadId: threadId,
      companyName: companyName,
    });

    // build map
    const messageUserMap = {};

    messages.forEach((msg) => {
      messageUserMap[msg.gmailMessageId] = msg.senderName || "";
    });

    return res.status(200).json({
      success: true,
      data: messageUserMap,
    });
  } catch (error) {
    console.error("getThreadMessageUsers error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
