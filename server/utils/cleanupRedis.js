import { connection as redis } from "./ioredis.js";

export const cleanupOnline = async (io) => {
  if (!redis || redis.status !== "ready") return;

  // ----- Users -----
  const userKeys = await redis.keys("sockets:user:*");
  for (const key of userKeys) {
    const userId = key.split(":")[2];
    const socketIds = await redis.smembers(key);
    for (const socketId of socketIds) {
      if (!io.sockets.sockets.has(socketId)) {
        await redis.srem(key, socketId);
      }
    }
    const remaining = await redis.scard(key);
    if (remaining === 0) await redis.srem("onlineUsers", userId);
  }

  // ----- Agents -----
  const agentKeys = await redis.keys("sockets:agent:*");
  for (const key of agentKeys) {
    const agentId = key.split(":")[2];
    const socketIds = await redis.smembers(key);
    for (const socketId of socketIds) {
      if (!io.sockets.sockets.has(socketId)) {
        await redis.srem(key, socketId);
      }
    }
    const remaining = await redis.scard(key);
    if (remaining === 0) await redis.srem("onlineAgents", agentId);
  }

  console.log("🧹 Cleanup completed");
};
