import { io } from "../../index.js";
 
import { safeRedisSmembers } from "../safeRedisSmembers.js";
// -----------------------------
// Send task update to user's sockets
// -----------------------------
export const sendSocketEvent = async ({ updated_task, userId }) => {
  if (!userId) return;

  console.log("sendSocketEvent");

  // Get all socket IDs for this user safely
  const toSocketIds = await safeRedisSmembers(`sockets:user:${userId}`);

  if (toSocketIds.length > 0) {
    for (const socketId of toSocketIds) {
      io.to(socketId).emit("task_updated", {
        updated_task: updated_task || null,
      });
    }
    console.log(`✅ Task update sent to user:${userId}`, toSocketIds);
  } else {
    console.log(`⚪ User ${userId} is offline or Redis unavailable. Task update not delivered in real-time.`);
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