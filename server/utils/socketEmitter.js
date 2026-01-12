// utils/socketEmitter.js
 
import { io } from "../index.js";
import { safeRedisSmembers } from "./safeRedisSmembers.js";

export const emitToUser = async (userId, event, payload) => {
  const socketIds = await safeRedisSmembers(`user_sockets:${userId}`);

  if (!socketIds.length) return;

  socketIds.forEach(socketId => {
    io.to(socketId).emit(event, payload);
  });
};