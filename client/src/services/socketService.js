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
  transports: ["websocket"],     // skip long-polling upgrade
  reconnection: true,            // auto-reconnect enabled
  reconnectionAttempts: Infinity,// never give up
  reconnectionDelay: 2000,       // start retrying after 2s
  reconnectionDelayMax: 5000,    // max backoff delay 5s
  timeout: 20000,                // 20s before a connect attempt fails
  autoConnect: true,             // connect immediately (default)
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
