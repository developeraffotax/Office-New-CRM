// redis.js
import { Redis } from "ioredis";

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || 6379;
const MAX_RETRY_ATTEMPTS = 3;
let retryCount = 0;

console.log("🧩 Connecting to Redis:", redisHost, redisPort);

export const connection = new Redis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null, // Required for BullMQ
  retryStrategy(times) {
    retryCount = times;
    if (times > MAX_RETRY_ATTEMPTS) {
      console.error(`❌ Redis failed to connect after ${MAX_RETRY_ATTEMPTS} attempts. Giving up.`);
      return null; // stop retrying
    }
    const delay = times * 2000;
    console.warn(`🔁 Redis reconnect attempt #${times}, retrying in ${delay / 1000}s...`);
    return delay;
  },
});

 
// Event handlers
connection.on("connect", () => { retryCount = 0; console.log(`🟢 Connected to Redis at ${redisHost}:${redisPort}`); });
connection.on("ready", () => console.log("✅ Redis connection is ready."));
connection.on("error", (err) => console.error("❌ Redis connection error:", err.message));
connection.on("close", () => console.warn("🔴 Redis connection closed."));
connection.on("end", () => console.warn("⚠️ Redis connection ended. No more retries will be attempted."));

















// Subscriber for Pub/Sub
export const subscriber = new Redis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null, // important for Pub/Sub
  retryStrategy(times) {
    retryCount = times;
    if (times > MAX_RETRY_ATTEMPTS) {
      console.error(`❌ Redis subscriber failed to connect after ${MAX_RETRY_ATTEMPTS} attempts. Giving up.`);
      return null; // stop retrying
    }
    const delay = times * 2000; // 2s, 4s, 6s
    console.warn(`🔁 Redis subscriber reconnect attempt #${times}, retrying in ${delay / 1000}s...`);
    return delay;
  },
});

// Optional event handlers
subscriber.on("connect", () => console.log("🟢 Redis subscriber connected"));
subscriber.on("ready", () => console.log("✅ Redis subscriber ready"));
subscriber.on("error", (err) => console.error("❌ Redis subscriber error:", err.message));
subscriber.on("close", () => console.warn("🔴 Redis subscriber closed"));
subscriber.on("end", () => console.warn("⚠️ Redis subscriber ended, no more retries"));