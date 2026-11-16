// ai/core/rateLimit.js
// Per-user fixed-window limiter on Redis. Reuse your existing Redis connection if you have one.
import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
});
redis.on("error", (e) => console.error("[ai] redis:", e.message));

export function rateLimit({ name = "ai", limit = 20, windowSec = 60 } = {}) {
  return async (req, res, next) => {
    const id = req.user?._id ?? req.ip;
    const nowSec = Math.floor(Date.now() / 1000);
    const key = `rl:${name}:${id}:${Math.floor(nowSec / windowSec)}`;
    try {
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, windowSec + 1);
      res.set({
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(Math.max(0, limit - count)),
      });
      if (count > limit) {
        const retry = windowSec - (nowSec % windowSec);
        res.set("Retry-After", String(retry));
        return res.status(429).json({ message: `Too many requests. Try again in ${retry}s.` });
      }
    } catch {
      // Fail open: a Redis hiccup shouldn't take the assistant down.
    }
    next();
  };
}