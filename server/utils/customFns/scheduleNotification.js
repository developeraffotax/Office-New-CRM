import { io, onlineUsers } from "../../index.js";
import notificationModel from "../../models/notificationModel.js";

const sendSocketNotification = (notification, userId) => {
  const toSocketIds = onlineUsers.get(userId?.toString());

  if (toSocketIds && toSocketIds.size > 0) {
    for (const socketId of toSocketIds) {
      io.to(socketId).emit("newNotification", {
        notification,
      });
    }
  }
}



  const createAndSendNotification = async ({ title, description, redirectLink, taskId, userId, type }) => {
  if (!userId) return;

  const notification = await notificationModel.create({
    title,
    redirectLink,
    description,
    taskId,
    userId,
    type: type || "default",
  });

  // Real-time push
  sendSocketNotification(notification, userId);
};




export function scheduleNotification(condition, payload) {
  if (!condition) return;

  setImmediate(async () => {
    try {
      await createAndSendNotification(payload);
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  });
}