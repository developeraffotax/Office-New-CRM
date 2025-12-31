import TicketActivity from "../models/ticketActivityModel.js";

// Add a new activity
// export const addTicketActivity = async (req, res) => {
//   try {
//     const { ticketId, action, details } = req.body;
//     const userId = req.user?._id; // assuming auth middleware adds req.user

//     const activity = new TicketActivity({ ticketId, userId, action, details });
//     await activity.save();

//     res.status(201).json(activity);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to log activity" });
//   }
// };

// Get all activity for a ticket
export const getTicketActivities = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const activities = await TicketActivity.find({ ticketId })
      .populate("userId", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
};




 
export const getMessageSender = async (req, res) => {
  try {
    const { gmailMessageId } = req.params;
    const activity = await TicketActivity.findOne({ gmailMessageId: gmailMessageId }).select("userId action")
      .populate("userId", "name")

    // If no activity → client message or external send
    if (!activity) {
      return res.json({
        type: "external",
        user: null,
      });
    }

    res.json({
      type: "crm",
      user: activity.userId,
      action: activity.action,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
};



export const getThreadSenders = async (req, res) => {
  try {
    const { threadId } = req.params;

    const activities = await TicketActivity.find({
      gmailThreadId: threadId,
      gmailMessageId: { $exists: true },
    })
      .select("gmailMessageId userId action")
      .populate("userId", "name");

    const map = Object.fromEntries(
      activities.map(a => [
        a.gmailMessageId,
        {
          user: a.userId,
          action: a.action,
        },
      ])
    );

    res.json(map);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch thread senders" });
  }
};
