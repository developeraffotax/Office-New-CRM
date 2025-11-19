import { io } from "../../index.js";
import { connection as redis } from "../../utils/ioredis.js";

// -----------------------------
// Send task update to user's sockets
// -----------------------------
export const sendSocketEvent = async ({ updated_task, userId }) => {
  if (!userId) return;

  console.log("sendSocketEvent");

  // Get all socket IDs for this user from Redis
  const toSocketIds = await redis.smembers(`sockets:user:${userId}`);

  if (toSocketIds && toSocketIds.length > 0) {
    for (const socketId of toSocketIds) {
      io.to(socketId).emit("task_updated", {
        updated_task: updated_task || null,
      });
    }
    console.log(`✅ Task update sent to user:${userId}`, toSocketIds);
  } else {
    console.log(`⚪ User ${userId} is offline. Task update not delivered in real-time.`);
  }
};

// -----------------------------
// Schedule task update emit
// -----------------------------
export function emitTaskUpdate(condition, payload) {
  if (!condition) return;

  setImmediate(async () => {
    try {
      await sendSocketEvent(payload);
    } catch (err) {
      console.error("❌ Failed to emit task update:", err);
    }
  });
}
