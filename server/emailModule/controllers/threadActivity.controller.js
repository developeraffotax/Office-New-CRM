import ThreadActivity from "../models/ThreadActivity.js";

/**
 * Get thread activities
 * Supports pagination
 */
export const getThreadActivities = async (req, res) => {
  try {
    const { threadId } = req.params;

    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 20;

    // const skip = (page - 1) * limit;

    const activities = await ThreadActivity.find({
      threadId,
    })
      .populate("performedBy", "name email avatar")
      .sort({ createdAt: -1 })
      // .skip(skip)
      // .limit(limit)
      .lean();

    // const total = await ThreadActivity.countDocuments({
    //   threadId,
    // });

    res.json({
      success: true,
      data: activities,
      // pagination: {
      //   total,
      //   page,
      //   pages: Math.ceil(total / limit),
      // },
    });
  } catch (err) {
    console.error("Get thread activities error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch thread activities",
    });
  }
};