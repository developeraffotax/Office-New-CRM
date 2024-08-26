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

    // Disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected!");
    });
  });
};
