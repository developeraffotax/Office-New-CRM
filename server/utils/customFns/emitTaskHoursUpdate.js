import { io } from "../../index.js";
 
import { safeRedisSmembers } from "../safeRedisSmembers.js";


// -----------------------------
// Send task hours update to user's sockets
// -----------------------------
export const sendSocketEvent = async ({ hours, userId }) => {
  if (!userId) return;

  // Get all socket IDs for this user from Redis safely
  const toSocketIds = await safeRedisSmembers(`sockets:user:${userId}`);

  if (toSocketIds.length > 0) {
    for (const socketId of toSocketIds) {
      io.to(socketId).emit("update_task_timer", {
        newAllocatedTimeInHours: hours,
      });
    }
    console.log(`⏱ Task hours update sent to user:${userId}`, toSocketIds);
  } else {
    console.log(`⚪ User ${userId} is offline or Redis unavailable. Task hours update not delivered.`);
  }
};

// -----------------------------
// Schedule task hours update emit
// -----------------------------
export function emitTaskHoursUpdate(condition, payload) {
  if (!condition) return;

  setImmediate(async () => {
    try {
      await sendSocketEvent(payload);
    } catch (err) {
      console.error("❌ Failed to emit task hours update:", err);
    }
  });
}