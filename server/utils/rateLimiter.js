 import rateLimit from "express-rate-limit";

// ---- Per-minute limiter ----
export const aiPerMinuteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // max 10 requests per IP per minute
  message: {
    status: 429,
    error: "Too many requests! Please wait a minute before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---- Per-day limiter ----
export const aiDailyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 500, // max 500 requests per IP per day
  message: {
    status: 429,
    error: "Daily limit reached. Please try again tomorrow.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

 