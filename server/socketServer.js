// socketServer.js
import { Server as SocketIOServer } from "socket.io";
import { connection as redis } from "./utils/ioredis.js"; 
import { onlineAgents, onlineUsers } from "./index.js";
import { CHANNELS } from "./utils/redisPubSub/constants.js";

export const initSocketServer = (server) => {
  const io = new SocketIOServer(server);

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // ---- Users ----
    socket.on("userConnected", async (userId) => {
      // Update local Map
      if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
      onlineUsers.get(userId).add(socket.id);

      // Publish to Redis safely
      try {
        await redis.publish(
          CHANNELS.ONLINE_USERS,
          JSON.stringify({ userId, socketId: socket.id, action: "add" })
        );
      } catch (err) {
        console.error("❌ Failed to publish user connection to Redis:", err.message);
      }

      console.log(`🟢 User connected: ${userId} (${socket.id})`);
    });

    // ---- Agents ----
    socket.on("agent:subscribe", async ({ id }) => {
      if (!id) return;

      // Update local Map
      onlineAgents.set(id, { socketId: socket.id });

      // Publish to Redis safely
      try {
        await redis.publish(
          CHANNELS.ONLINE_AGENTS,
          JSON.stringify({ userId: id, socketId: socket.id, action: "add" })
        );
      } catch (err) {
        console.error("❌ Failed to publish agent connection to Redis:", err.message);
      }

      console.log(`💻 Agent connected: ${id}`);
    });

    // ---- Existing Events ----
    socket.on("notification", (data) => io.emit("newNotification", data));
    socket.on("timer", (data) => io.emit("newTimer", data));
    socket.on("addTask", (data) => io.emit("newtask", data));
    socket.on("addTaskComment", (data) => io.emit("addnewTaskComment", data));
    socket.on("addproject", (data) => io.emit("newProject", data));
    socket.on("addJob", (data) => io.emit("newJob", data));

    // ---- Disconnect ----
    socket.on("disconnect", async () => {
      // Users
      for (const [userId, socketSet] of onlineUsers.entries()) {
        if (socketSet.delete(socket.id)) {
          try {
            await redis.publish(
              CHANNELS.ONLINE_USERS,
              JSON.stringify({ userId, socketId: socket.id, action: "remove" })
            );
          } catch (err) {
            console.error("❌ Failed to publish user disconnect to Redis:", err.message);
          }
          if (socketSet.size === 0) onlineUsers.delete(userId);
        }
      }

      // Agents
      for (const [id, agent] of onlineAgents.entries()) {
        if (agent.socketId === socket.id) {
          onlineAgents.delete(id);
          try {
            await redis.publish(
              CHANNELS.ONLINE_AGENTS,
              JSON.stringify({ userId: id, socketId: socket.id, action: "remove" })
            );
          } catch (err) {
            console.error("❌ Failed to publish agent disconnect to Redis:", err.message);
          }
        }
      }

      console.log(`⚡ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};













// Optional helper to emit timer state
export const emitTimerState = (io, email, running) => {
  const agent = onlineAgents.get(email);
  if (agent) {
    io.to(agent.socketId).emit("timer:state", { running });
    console.log(`⏱ Emitted timer state externally to ${email}`);
  }
};

export const Skey = "salman@affotax";
