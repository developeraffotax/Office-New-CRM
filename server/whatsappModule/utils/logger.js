import winston from "winston";

const { combine, timestamp, printf, colorize, json, errors, } = winston.format;

const isProduction = process.env.NODE_ENV === "production";
//const isProduction = 1;

const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  printf(
    ({ level, message, timestamp, stack, ...meta }) => {
      const metaStr =
        Object.keys(meta).length > 0
          ? ` ${JSON.stringify(meta)}`
          : "";

      return `${timestamp} [${level}]: ${
        stack || message
      }${metaStr}`;
    }
  )
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level:
    process.env.LOG_LEVEL ??
    (isProduction ? "info" : "debug"),

  defaultMeta: {
    service: "crm-backend",
  },

  format: isProduction
    ? prodFormat
    : devFormat,

  transports: [
    new winston.transports.Console(),
  ],
});

export default logger;