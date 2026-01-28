import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createRedisClient } from "./ioredis.js";
 

let io;

export const getSocketEmitter = async () => {
  if (io) return io;

  const pubClient = createRedisClient();
  const subClient = createRedisClient();

  await Promise.all([
    new Promise((res) => pubClient.once("ready", res)),
    new Promise((res) => subClient.once("ready", res)),
  ]);

  io = new Server(); // ⚠️ NO HTTP SERVER
  io.adapter(createAdapter(pubClient, subClient));

  console.log("🔗 Socket.IO Redis emitter ready (worker-safe)");

  return io;
};
