import { Server as SocketIOServer } from "socket.io";
import { onlineAgents, onlineUsers } from "./index.js";
import userModel from "./models/userModel.js";

// 👇 Separate tracker for connected agents (Electron devices)
 // key: email or userId, value: { socketId, deviceId }

export const initSocketServer = (server) => {
  const io = new SocketIOServer(server);

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // ---- CRM USERS ----
    socket.on("userConnected", (userId) => {
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);
      console.log(`🟢 User ${userId} connected (${socket.id})`);
    });

    // ---- ELECTRON AGENT ----
    socket.on("agent:subscribe", ({ id, }) => {
      //id is userId
      if (id) {
        onlineAgents.set(id, { socketId: socket.id, });
        console.log(`💻 Agent connected for ${id}  `);
      }
    });


    

    // ---- Existing Events ----
    socket.on("notification", (data) => {
      io.emit("newNotification", data);
    });

    socket.on("timer", (data) => {
      io.emit("newTimer", data);
    });

    socket.on("addTask", (data) => {
      io.emit("newtask", data);
    });

    socket.on("addTaskComment", (data) => {
      io.emit("addnewTaskComment", data);
    });

    socket.on("addproject", (data) => {
      io.emit("newProject", data);
    });

    socket.on("addJob", (data) => {
      io.emit("newJob", data);
    });

    // ---- Handle Disconnect ----
    socket.on("disconnect", () => {
      for (const [userId, socketSet] of onlineUsers.entries()) {
        socketSet.delete(socket.id);
        if (socketSet.size === 0) {
          onlineUsers.delete(userId);
        }
      }

      for (const [email, agent] of onlineAgents.entries()) {
        if (agent.socketId === socket.id) {
          onlineAgents.delete(email);
          console.log(`🔴 Agent disconnected: ${email}`);
        }
      }

      console.log(`⚡ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Optional: helper to push timer state externally (e.g., from controller)
export const emitTimerState = (io, email, running) => {
  const agent = onlineAgents.get(email);
  if (agent) {
    io.to(agent.socketId).emit("timer:state", { running });
    console.log(`⏱ Emitted timer state externally to ${email}`);
  }
};


export const Skey = "salman@affotax";