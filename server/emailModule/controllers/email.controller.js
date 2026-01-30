import EmailThread from "../models/EmailThread.js";
import mongoose from "mongoose";
import { getGmailClient } from "../services/gmail.service.js";

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
 
// ------------------ Inbox ------------------
// GET /api/v1/gmail/threads
export const getMailbox = async (req, res) => {
  try {
    const {
      userId,
      companyName,
      category,
      folder = "inbox", // inbox | sent
      startDate,
      endDate,
      unreadOnly,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // ---------------- Folder logic ----------------
    if (folder === "inbox") {
      query.hasInboxMessage = true;
    }

    if (folder === "sent") {
      query.hasSentMessage = true;
    }

    // ---------------- Filters ----------------
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    if (companyName) query.companyName = companyName;
    if (category) query.category = category;

    if (unreadOnly === "true") {
      query.unreadCount = { $gt: 0 };
    }

    // ---------------- Date filter (per folder) ----------------
    const dateField =
      folder === "sent" ? "lastMessageAtSent" : "lastMessageAtInbox";

    if (startDate || endDate) {
      query[dateField] = {};
      if (startDate) query[dateField].$gte = new Date(startDate);
      if (endDate) query[dateField].$lte = new Date(endDate);
    }

    const pageNumber = Math.max(parseInt(page), 1);
    const pageSize = Math.min(parseInt(limit), 100);
    const skip = (pageNumber - 1) * pageSize;

    const [threads, total] = await Promise.all([
      EmailThread.find(query)
        .sort({ [dateField]: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      EmailThread.countDocuments(query),
    ]);

    res.json({
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
    console.error("❌ Thread fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch threads",
    });
  }
};


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
    const { id } = req.params; // MongoDB _id
    const updates = req.body;

    // Whitelist of allowed fields
    const allowedUpdates = ["category", "userId"];
    const updateKeys = Object.keys(updates);

    // Validate updates
    const isValidUpdate = updateKeys.every((key) => allowedUpdates.includes(key));
    if (!isValidUpdate) {
      return res.status(400).json({
        success: false,
        message: "Invalid fields in update!",
      });
    }

    // Update the document
    const updatedThread = await EmailThread.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true } // runValidators ensures category/userId are valid
    );

    if (!updatedThread) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found!",
      });
    }

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
 * PATCH /api/v1/gmail/mark-as-read/:id 
 * Marks the thread as read (unreadCount = 0)
 * Updates both Gmail and local DB
 */
export const markThreadAsRead = async (req, res) => {
  try {
    const { threadId } = req.params; // MongoDB _id
    const { companyName } = req.body;  

    // Find the thread
    const thread = await EmailThread.findOne({threadId: threadId, companyName:companyName});
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: "Thread not found",
      });
    }
 

  // 👇 already read → no-op
  if (thread.unreadCount === 0) {
    return res.json({
      success: true,
      thread,
      alreadyRead: true,
    });
  }


    // ----------- 1. Update Gmail (if applicable) -----------
    // Assume you have a function to get Gmail OAuth client per company


    const gmailClient =  await getGmailClient(companyName); 
    if (gmailClient && thread.threadId) {
      await gmailClient.users.threads.modify({
        userId: "me",
        id: thread.threadId,
        requestBody: {
          removeLabelIds: ["UNREAD"],
        },
      });
    }

    // ----------- 2. Update local DB -----------
    thread.unreadCount = 0;
    await thread.save();

    res.status(200).json({
      success: true,
      message: "Thread marked as read",
      thread,
      alreadyRead: false,
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

 

 