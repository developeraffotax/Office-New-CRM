// // src/services/socket.js
// import { io } from "socket.io-client";

// const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";

// // Singleton socket instance
// let socket = null;

// export const initSocket = (userId) => {
//   if (!userId || socket) return;

//   socket = io(ENDPOINT, {
//     transports: ["websocket"],
//     autoConnect: false,
//   });

//   socket.connect();

//   socket.on("connect", () => {
//     console.log("✅ Socket connected:", socket.id);
//     socket.emit("userConnected", userId);
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ Socket disconnected");
//   });
// };

// export const getSocket = () => {
//   if (!socket) {
//     console.warn("⚠️ Socket not initialized yet!");
//   }
//   return socket;
// };

// export const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// };
