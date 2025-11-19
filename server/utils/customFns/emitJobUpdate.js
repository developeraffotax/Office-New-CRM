import { io } from "../../index.js";
import { safeRedisSmembers } from "../safeRedisSmembers.js";


// -----------------------------
// Send job update to all user's sockets
// -----------------------------
export const sendSocketEvent = async ({ updated_job, userId }) => {
  if (!userId) return;

  console.log("sendSocketEvent");

  // Get all socket IDs for this user from Redis safely
  const toSocketIds = await safeRedisSmembers(`sockets:user:${userId}`);

  if (toSocketIds.length > 0) {
    for (const socketId of toSocketIds) {
      io.to(socketId).emit("job_updated", {
        updated_job: updated_job || null,
      });
    }
    console.log(`✅ Job update sent to user:${userId}`, toSocketIds);
  } else {
    console.log(`⚪ User ${userId} is offline or Redis unavailable. Job update not delivered.`);
  }
};

// -----------------------------
// Schedule job update emit
// -----------------------------
export function emitJobUpdate(condition, payload) {
  if (!condition) return;

  setImmediate(async () => {
    try {
      await sendSocketEvent(payload);
    } catch (err) {
      console.error("❌ Failed to emit job update:", err);
    }
  });
}