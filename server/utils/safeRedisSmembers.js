import { connection as redis } from "./ioredis.js";
// Helper: safe Redis smembers with retry
export const safeRedisSmembers = async (key, retries = 2, delay = 200) => {
  for (let i = 0; i <= retries; i++) {
    try {
      if (redis && redis.status === "ready") {
        return await redis.smembers(key);
      } else {
        console.log("⚠ Redis not connected.");
        return [];
      }
    } catch (err) {
      console.log(`⚠ Redis error on ${key}: ${err.message}`);
      if (i < retries) {
        console.log(`Retrying Redis (${i + 1}/${retries})...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        console.log("⚠ Giving up on Redis for this operation.");
        return [];
      }
    }
  }
};