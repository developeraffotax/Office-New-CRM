import EmailThread from "../models/EmailThread.js";
import mongoose from "mongoose";

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
export const getInbox = async (req, res) => {
  try {
    const {
      userId,
      companyName,
      category,
      startDate,
      endDate,
      unreadOnly,
      page = 1,
      limit = 20,
    } = req.query;

    // if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Valid userId is required",
    //   });
    // }

    /* -------------------- Build Mongo Query -------------------- */
    const query = {
      // userId: new mongoose.Types.ObjectId(userId),
      hasInboxMessage: true,
    };

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    if (companyName) {
      query.companyName = companyName;
    }

    if (category) {
      query.category = category;
    }

    if (unreadOnly === "true") {
      query.unreadCount = { $gt: 0 };
    }

    if (startDate || endDate) {
      query.lastMessageAt = {};
      if (startDate) query.lastMessageAt.$gte = new Date(startDate);
      if (endDate) query.lastMessageAt.$lte = new Date(endDate);
    }

    /* -------------------- Pagination -------------------- */
    const pageNumber = Math.max(parseInt(page), 1);
    const pageSize = Math.min(parseInt(limit), 100);
    const skip = (pageNumber - 1) * pageSize;

    /* -------------------- Query Execution -------------------- */
    const [threads, total] = await Promise.all([
      EmailThread.find(query)
        .sort({ lastMessageAt: -1 }) // inbox-style ordering
        .skip(skip)
        .limit(pageSize)
        .lean(),
      EmailThread.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      threads: threads,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("❌ Inbox fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inbox",
    });
  }
};





 





 
export const getSentItems = async (req, res) => {
  try {
    const {
      userId,
      companyName,
      category,
      startDate,
      endDate,
      unreadOnly,
      page = 1,
      limit = 20,
    } = req.query;

    /* -------------------- Build Mongo Query -------------------- */
    const query = {
      hasSentMessage: true,
    };

    if (companyName) query.companyName = companyName;
    if (category) query.category = category;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    if (unreadOnly === "true") {
      query.unreadCount = { $gt: 0 };
    }
      

    if (startDate || endDate) {
      query.lastMessageAt = {};
      if (startDate) query.lastMessageAt.$gte = new Date(startDate);
      if (endDate) query.lastMessageAt.$lte = new Date(endDate);
    }

    /* -------------------- Pagination -------------------- */
    const pageNumber = Math.max(parseInt(page), 1);
    const pageSize = Math.min(parseInt(limit), 100);
    const skip = (pageNumber - 1) * pageSize;

    /* -------------------- Query Execution -------------------- */
    const [threads, total] = await Promise.all([
      EmailThread.find(query)
        .sort({ lastMessageAt: -1 }) // most recent first
        .skip(skip)
        .limit(pageSize)
        .lean(),
      EmailThread.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      threads: threads,
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




