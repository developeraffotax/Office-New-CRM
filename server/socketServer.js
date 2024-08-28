import { Server as SocketIOServer } from "socket.io";

export const initSocketServer = (server) => {
  const io = new SocketIOServer(server);

  io.on("connection", (socket) => {
    console.log("User connected!");

    // Listen "Notification"
    socket.on("notification", (data) => {
      io.emit("newNotification", data);
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

    // Listen Add/Update Job
    socket.on("addJob", (data) => {
      io.emit("newJob", data);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected!");
    });
  });
};
