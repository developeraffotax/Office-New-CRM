// socketServer.js
import { Server as SocketIOServer } from "socket.io";
import { createRedisClient, connection as redis } from "./utils/ioredis.js";
import { createAdapter } from "@socket.io/redis-adapter";

// ---------------------------
// INITIALIZE SOCKET SERVER
// ---------------------------
export const initSocketServer = (server) => {
  const io = new SocketIOServer(server, { cors: { origin: "*" } });

  // ---------------------------
  // REDIS ADAPTER FOR MULTI-INSTANCE
  // ---------------------------
  const pubClient = createRedisClient();
  const subClient = createRedisClient();

  // Wait for both clients to be ready before attaching adapter
  const checkAdapterReady = async () => {
    await Promise.all([
      new Promise((res) => pubClient.once("ready", res)),
      new Promise((res) => subClient.once("ready", res)),
    ]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log("🔗 Socket.IO Redis Adapter Enabled");
  };
  checkAdapterReady();

  // ---------------------------
  // SOCKET CONNECTION HANDLER
  // ---------------------------
  io.on("connection", (socket) => {
    console.log("⚡ Socket connected:", socket.id);

    // -----------------------
    // USER CONNECTED
    // -----------------------
    socket.on("userConnected", async (userId) => {
      if (!userId) return;
      socket.join(`user:${userId}`);

      try {
        // Add socket ID to user set
        await redis.sadd(`sockets:user:${userId}`, socket.id);

        // Add user to onlineUsers if not already present
        const isOnline = await redis.sismember("onlineUsers", userId);
        if (!isOnline) {
          await redis.sadd("onlineUsers", userId);
        }

        console.log(`🟢 User online → ${userId}`);
      } catch (err) {
        console.error("❌ Failed to mark user online in Redis:", err.message);
      }
    });

    // -----------------------
    // AGENT CONNECTED
    // -----------------------
    socket.on("agent:subscribe", async ({ id }) => {
      if (!id) return;
      socket.join(`agent:${id}`);

      try {
        // Add socket ID to agent set
        await redis.sadd(`sockets:agent:${id}`, socket.id);

        // Add agent to onlineAgents if not already present
        const isOnline = await redis.sismember("onlineAgents", id);
        if (!isOnline) {
          await redis.sadd("onlineAgents", id);
        }

        console.log(`💻 Agent online → ${id}`);
      } catch (err) {
        console.error("❌ Failed to mark agent online in Redis:", err.message);
      }
    });

    // -----------------------
    // DISCONNECT
    // -----------------------
    socket.on("disconnect", async () => {
      console.log(`🔴 Socket disconnected: ${socket.id}`);

      try {
        // Remove socket from user sets
        const userKeys = await redis.keys("sockets:user:*");
        for (const key of userKeys) {
          const removed = await redis.srem(key, socket.id);
          if (removed) {
            const userId = key.split(":")[2];
            const remainingSockets = await redis.scard(key);
            if (remainingSockets === 0) {
              await redis.srem("onlineUsers", userId);
              console.log(`⚪ User offline → ${userId}`);
            }
          }
        }

        // Remove socket from agent sets
        const agentKeys = await redis.keys("sockets:agent:*");
        for (const key of agentKeys) {
          const removed = await redis.srem(key, socket.id);
          if (removed) {
            const id = key.split(":")[2];
            const remainingSockets = await redis.scard(key);
            if (remainingSockets === 0) {
              await redis.srem("onlineAgents", id);
              console.log(`⚪ Agent offline → ${id}`);
            }
          }
        }
      } catch (err) {
        console.error("❌ Error updating Redis on disconnect:", err.message);
      }
    });
  });

  return io;
};

// ---------------------------
// SAFE CLUSTER COMPATIBLE EMIT
// ---------------------------
export const emitTimerState = (io, email, running) => {
  io.to(`agent:${email}`).emit("timer:state", { running });
  console.log(`⏱ Emitted timer state to agent:${email}`);
};

export const Skey = "salman@affotax";
