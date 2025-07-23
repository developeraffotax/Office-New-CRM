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
