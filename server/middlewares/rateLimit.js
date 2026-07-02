// import rateLimit, { ipKeyGenerator } from "express-rate-limit";
// import { RedisStore } from "rate-limit-redis";
// import { connection } from "../utils/ioredis.js";

// function userKey(req) {
//   if (req.user?.id) return `user:${String(req.user.id)}`;
//   return `ip:${ipKeyGenerator(req)}`; // unauthenticated fallback
// }

// function ipKey(req) {
//   return `ip:${ipKeyGenerator(req)}`;
// }

// function makeStore(prefix) {
//   return new RedisStore({
//     sendCommand: (...args) => connection.call(...args),
//     prefix: `rl:${prefix}:`,
//   });
// }

// // ---- Per-user, per-minute ----
// export const userPerMinuteLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 20,
//   keyGenerator: userKey,
//   store: makeStore("user-min"),
//   message: { status: 429, error: "Too many requests! Please wait a minute before trying again." },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // ---- Per-user, per-day ----
// export const userDailyLimiter = rateLimit({
//   windowMs: 24 * 60 * 60 * 1000,
//   max: 1000,
//   keyGenerator: userKey,
//   store: makeStore("user-day"),
//   message: { status: 429, error: "Daily limit reached. Please try again tomorrow." },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // ---- Per-IP, per-minute (catches one IP spamming multiple accounts) ----
// export const ipPerMinuteLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 60,
//   keyGenerator: ipKey,
//   store: makeStore("ip-min"),
//   message: { status: 429, error: "Too many requests from this network. Please wait a minute." },
//   standardHeaders: true,
//   legacyHeaders: false,
// });









// router.use(authenticate);       
// router.use(ipPerMinuteLimiter);
// router.use(userPerMinuteLimiter);
// router.use(userDailyLimiter);