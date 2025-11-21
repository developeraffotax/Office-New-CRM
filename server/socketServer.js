// socketServer.js
import { Server as SocketIOServer } from "socket.io";
import { createRedisClient, connection as redis } from "./utils/ioredis.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { cleanupOnline } from "./utils/cleanupRedis.js";


const isClusterPrimary = process.env.pm_id === "0";


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

  const checkAdapterReady = async () => {
    await Promise.all([
      new Promise((res) => pubClient.once("ready", res)),
      new Promise((res) => subClient.once("ready", res)),
    ]);



    if (isClusterPrimary) {
      // Cleanup any stale online users/agents
      await cleanupOnline(io);


    }




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

      socket.data.userId = userId; // store on socket
      socket.join(`user:${userId}`);

      try {
        await redis.sadd(`sockets:user:${userId}`, socket.id);
        const isOnline = await redis.sismember("onlineUsers", userId);
        if (!isOnline) await redis.sadd("onlineUsers", userId);

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

      socket.data.agentId = id; // store on socket
      socket.join(`agent:${id}`);

      try {
        await redis.sadd(`sockets:agent:${id}`, socket.id);
        const isOnline = await redis.sismember("onlineAgents", id);
        if (!isOnline) await redis.sadd("onlineAgents", id);

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
        // -------------------
        // Handle user disconnect
        // -------------------
        if (socket?.data?.userId) {
          const userKey = `sockets:user:${socket.data.userId}`;
          await redis.srem(userKey, socket.id);
          const remainingSockets = await redis.scard(userKey);
          if (remainingSockets === 0) {
            await redis.srem("onlineUsers", socket.data.userId);
            console.log(`⚪ User offline → ${socket.data.userId}`);
          }
        }

        // -------------------
        // Handle agent disconnect
        // -------------------
        if (socket?.data?.agentId) {
          const agentKey = `sockets:agent:${socket.data.agentId}`;
          await redis.srem(agentKey, socket.id);
          const remainingSockets = await redis.scard(agentKey);
          if (remainingSockets === 0) {
            await redis.srem("onlineAgents", socket.data.agentId);
            console.log(`⚪ Agent offline → ${socket.data.agentId}`);
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
