import { io } from "../../index.js";
import notificationModel from "../../models/notificationModel.js";
import { safeRedisSmembers } from "../safeRedisSmembers.js";

// -----------------------------
// Send real-time notification to all user's sockets
// -----------------------------
const sendSocketNotification = async (notification, userId) => {
  if (!userId) return;

  // Get all socket IDs safely
  const toSocketIds = await safeRedisSmembers(`sockets:user:${userId}`);

  if (toSocketIds.length > 0) {
    for (const socketId of toSocketIds) {
      io.to(socketId).emit("newNotification", { notification });
    }
    console.log(`🔔 Notification sent to user:${userId}`, toSocketIds);
  } else {
    console.log(`⚪ User ${userId} is offline or Redis unavailable. Notification not delivered in real-time.`);
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

  // Save notification to DB
  const notification = await notificationModel.create({
    title,
    redirectLink,
    description,
    taskId,
    userId,
    type: type || "default",
  });

  // Real-time push via Redis-based sockets (safe)
  try {
    await sendSocketNotification(notification, userId);
  } catch (err) {
    console.error("⚠ Failed to push notification in real-time:", err);
  }

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