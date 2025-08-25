import { Server as SocketIOServer } from "socket.io";
import { onlineUsers } from "./index.js";
import userModel from "./models/userModel.js";





export const initSocketServer = (server) => {

  const io = new SocketIOServer(server);


  // const io = new SocketIOServer(server, {
  //   cors: {
  //     origin: ["http://localhost:5173", "http://localhost:3000", "https://affotax.com"],
  //     methods: ["GET", "POST"],
  //     credentials: true,
  //   },
  // });

  io.on("connection", (socket) => {
  console.log("User connected!💚💚💚💚💚");

    // When user logs in or joins the chat, send their MongoDB userId
    socket.on('userConnected', (userId) => {
        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);

        //logOnlineUsers();
         broadcastOnlineUsers(io); // 👈 send to frontend
        console.log(`🟢 User ${userId} connected with socket ${socket.id}`);
      });

    // Listen "Notification"
    socket.on("notification", (data) => {
      console.log("OnlineUsers 💚",onlineUsers)
      io.emit("newNotification", data);
    });

    // Listen "Reminder"
    // socket.on("reminder", (data) => {
    //   io.emit("newReminder", data);
    // });

    // Listen Timer
    socket.on("timer", (data) => {
      io.emit("newTimer", data);
    });

    // Listen Add task
    socket.on("addTask", (data) => {
      console.log("OnlineUsers 💚",onlineUsers)
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
      //logOnlineUsers();
       broadcastOnlineUsers(io); // 👈 send to frontend
      console.log(`🔴 Socket ${socket.id} disconnected`);
    });



  });



  return io;
};

export const Skey = "salman@affotax";











function logOnlineUsers() {
  const uniqueUsers = onlineUsers.size;
  const totalSockets = Array.from(onlineUsers.values())
    .reduce((sum, set) => sum + set.size, 0);

  console.log(`👥 Online users: ${uniqueUsers} | 🔗 Total sockets: ${totalSockets}`);
}







async function broadcastOnlineUsers(io) {
  try {
    // Get just the keys (userIds) from onlineUsers Map
    const userIds = Array.from(onlineUsers.keys());

    // Fetch their names (or any fields you want)
    const users = await userModel.find(
      { _id: { $in: userIds } },
      { _id: 1, name: 1, avatar: 1 } // projection: only send needed fields
    ).lean();

    // Emit the user list
    io.emit("onlineUsersUpdate", users);

    // console.log("👥 Online users:", users.map(u => u.name).join(", "));
  } catch (err) {
    console.error("Error broadcasting online users:", err);
  }
}