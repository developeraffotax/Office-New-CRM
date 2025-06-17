import { Server as SocketIOServer } from "socket.io";
import { onlineUsers } from "./index.js";





export const initSocketServer = (server) => {
  const io = new SocketIOServer(server);

  io.on("connection", (socket) => {
    console.log("User connected!");

    // When user logs in or joins the chat, send their MongoDB userId
    socket.on('userConnected', (userId) => {
        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);
        console.log(`🟢 User ${userId} connected with socket ${socket.id}`);
      });

    // Listen "Notification"
    socket.on("notification", (data) => {
      io.emit("newNotification", data);
    });

    // Listen "Reminder"
    socket.on("reminder", (data) => {
      io.emit("newReminder", data);
    });

    // Listen Timer
    socket.on("timer", (data) => {
      io.emit("newTimer", data);
    });

    // Listen Add task
    socket.on("addTask", (data) => {
      io.emit("newtask", data);
    });

    // Add Comment
    socket.on("addTaskComment", (data) => {
      io.emit("addnewTaskComment", data);
    });

    // Project
    socket.on("addproject", (data) => {
      io.emit("newProject", data);
    });

    // Listen Add/Update Job
    socket.on("addJob", (data) => {
      io.emit("newJob", data);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      for (const [userId, socketSet] of onlineUsers.entries()) {
        socketSet.delete(socket.id);
        if (socketSet.size === 0) {
          onlineUsers.delete(userId);
        }
      }
      console.log(`🔴 Socket ${socket.id} disconnected`);
    });



  });



  return io;
};

export const Skey = "salman@affotax";
