
import { connection as redis } from "./ioredis.js";




export const cleanupStaleOnline = async () => {
  const agents = await redis.smembers("onlineAgents");

  for (const id of agents) {
    const key = `sockets:agent:${id}`;
    const exists = await redis.exists(key);

    if (!exists) {
      await redis.srem("onlineAgents", id);
      console.log("🧹 cleaned stale agent:", id);
    }
  }

  const users = await redis.smembers("onlineUsers");

  for (const id of users) {
    const key = `sockets:user:${id}`;
    const exists = await redis.exists(key);

    if (!exists) {
      await redis.srem("onlineUsers", id);
      console.log("🧹 cleaned stale user:", id);
    }
  }
};

 