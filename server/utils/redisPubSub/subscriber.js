// import { subscriber } from "../ioredis.js";
// import { CHANNELS } from "./constants.js";

// export const startSubscriber = ({ onlineUsers, onlineAgents }) => {
//   (async () => {
//     try {
//       await subscriber.subscribe(CHANNELS.ONLINE_USERS, CHANNELS.ONLINE_AGENTS);
//       console.log("🔔 Subscribed to Redis Pub/Sub channels");
//     } catch (err) {
//       console.warn("⚠️ Failed to subscribe to Redis channels:", err.message);
//     }
//   })();

//   subscriber.on("message", (channel, message) => {
//     try {
//       const data = JSON.parse(message);
//       if (channel === CHANNELS.ONLINE_USERS) {
//         const { userId, socketId, action } = data;
//         if (action === "add") {
//           if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
//           onlineUsers.get(userId).add(socketId);
//         } else {
//           onlineUsers.get(userId)?.delete(socketId);
//           if (onlineUsers.get(userId)?.size === 0) onlineUsers.delete(userId);
//         }
//       }

//       if (channel === CHANNELS.ONLINE_AGENTS) {
//         const { userId, socketId, action } = data;
//         if (action === "add") onlineAgents.set(userId, { socketId });
//         else onlineAgents.delete(userId);
//       }
//     } catch (err) {
//       console.error("❌ Redis Pub/Sub error:", err);
//     }
//   });
// };
