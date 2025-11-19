import { io } from "../../index.js";
import { connection as redis } from "../../utils/ioredis.js";
import notificationModel from "../../models/notificationModel.js";

// -----------------------------
// Send real-time notification to all user's sockets
// -----------------------------
const sendSocketNotification = async (notification, userId) => {
  if (!userId) return;

  // Get all socket IDs for this user from Redis
  const toSocketIds = await redis.smembers(`sockets:user:${userId}`);

  if (toSocketIds && toSocketIds.length > 0) {
    for (const socketId of toSocketIds) {
      io.to(socketId).emit("newNotification", { notification });
    }
    console.log(`🔔 Notification sent to user:${userId}`, toSocketIds);
  } else {
    console.log(`⚪ User ${userId} is offline. Notification not delivered in real-time.`);
  }
};

// -----------------------------
// Create & send notification
// -----------------------------
const createAndSendNotification = async ({
  title,
  description,
  redirectLink,
  taskId,
  userId,
  type
}) => {
  if (!userId) return;

  const notification = await notificationModel.create({
    title,
    redirectLink,
    description,
    taskId,
    userId,
    type: type || "default",
  });

  // Real-time push via Redis-based sockets
  await sendSocketNotification(notification, userId);

  return notification;
};

// -----------------------------
// Schedule notification
// -----------------------------
export function scheduleNotification(condition, payload) {
  if (!condition) return;

  setImmediate(async () => {
    try {
      await createAndSendNotification(payload);
    } catch (err) {
      console.error("❌ Failed to send notification:", err);
    }
  });
}
