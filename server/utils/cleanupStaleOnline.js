import { connection as redis } from "./ioredis.js";



export const cleanupStaleOnline = async (io) => {
  // ─── AGENTS ───────────────────────────────────────────────
  const agents = await redis.smembers("onlineAgents");
  console.log("Agents 🎈🎈", agents);

  for (const id of agents) {
    const key = `sockets:agent:${id}`;
    const socketIds = await redis.smembers(key);

    if (socketIds.length === 0) {
      // Set exists but is empty — remove agent from online list
      await redis.del(key);
      await redis.srem("onlineAgents", id);
      console.log("🧹 Cleaned empty agent set:", id);
      continue;
    }

    // Check each socket ID against Socket.IO's live sockets
    for (const socketId of socketIds) {
      const isAlive = io ? io.sockets.sockets.has(socketId) : false;
      const mappingExists = await redis.exists(`socket:agent:${socketId}`);

      if (!isAlive || !mappingExists) {
        await redis.srem(key, socketId);
        await redis.del(`socket:agent:${socketId}`); // cleanup reverse mapping
        console.log(`🧹 Removed stale agent socket: ${socketId} (agent: ${id})`);
      }
    }

    // After pruning, check if the set is now empty
    const remaining = await redis.scard(key);
    if (remaining === 0) {
      await redis.del(key);
      await redis.srem("onlineAgents", id);
      console.log("🧹 Agent now fully offline after socket cleanup:", id);
    }
  }

  // ─── USERS ────────────────────────────────────────────────
  const users = await redis.smembers("onlineUsers");
  console.log("Users 🎈🎈", users);

  for (const id of users) {
    const key = `sockets:user:${id}`;
    const socketIds = await redis.smembers(key);

    if (socketIds.length === 0) {
      await redis.del(key);
      await redis.srem("onlineUsers", id);
      console.log("🧹 Cleaned empty user set:", id);
      continue;
    }

    for (const socketId of socketIds) {
      const isAlive = io ? io.sockets.sockets.has(socketId) : false;
      const mappingExists = await redis.exists(`socket:user:${socketId}`);

      if (!isAlive || !mappingExists) {
        await redis.srem(key, socketId);
        await redis.del(`socket:user:${socketId}`); // cleanup reverse mapping
        console.log(`🧹 Removed stale user socket: ${socketId} (user: ${id})`);
      }
    }

    const remaining = await redis.scard(key);
    if (remaining === 0) {
      await redis.del(key);
      await redis.srem("onlineUsers", id);
      console.log("🧹 User now fully offline after socket cleanup:", id);
    }
  }
};