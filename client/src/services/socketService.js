// src/services/socketService.js
// import { io } from "socket.io-client";

// const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
// let socket = null;

// export const connectSocket = (userId) => {
//   if (!userId || socket) return;

//   socket = io(ENDPOINT, {
//     transports: ["websocket"],
//     autoConnect: false,
//   });

//   socket.connect();

//   socket.on("connect", () => {
//     console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Socket connected:", socket.id);
//     socket.emit("userConnected", userId);
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ Socket disconnected");
//   });
// };

// export const getSocket = () => socket;

// export const disconnectSocket = () => {
//   if (socket) {
//     console.log("❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌ Socket disconnected");
//     socket.disconnect();
//     socket = null;
//   }
// };


// src/services/socketService.js
import { io } from "socket.io-client";

const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
let socket = null;

export const connectSocket = (userId) => {
  if (!userId) return;

  // If socket already exists and is connected, just reuse it
  if (socket && socket.connected) {
    return socket;
  }

  // Create socket instance (force websocket only)
  socket = io(ENDPOINT, {
    transports: ["websocket"],   // avoid multiple IDs from polling upgrade
    reconnection: true,          // optional: allow auto reconnect
    reconnectionAttempts: 3,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    socket.emit("userConnected", userId);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log("❌ Forcing socket disconnect:", socket.id);
    socket.disconnect();
    socket = null;
  }
};
