import notificationModel from "../models/notificationModel.js";

// Get All Notification
export const getNotification = async (req, res) => {
  try {
    const userId = req.params.id;

    const notifications = await notificationModel
      .find({ userId: userId, status: "unread" })
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "All user notifications.",
      notifications: notifications,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get notifications",
      error: error,
    });
  }
};

// Update Notification
export const updateNotification = async (req, res) => {
  try {
    const id = req.params.id;

    const notification = await notificationModel.findByIdAndUpdate(
      { _id: id },
      { status: "read" },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "notification updated!",
      notification: notification,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get notifications",
      error: error,
    });
  }
};

// Update All Notifications

export const updateAllNotification = async (req, res) => {
  try {
    const userId = req.params.id;

    const notifications = await notificationModel.updateMany(
      { userId: userId },
      { $set: { status: "read" } }
    );

    res.status(200).send({
      success: true,
      message: "Notifications marked as read successfully!",
      notifications: notifications,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get notifications",
      error: error,
    });
  }
};
