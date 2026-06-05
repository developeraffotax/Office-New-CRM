import logger from "../whatsappModule/utils/logger.js";

 

export const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled API Error", {
    method: req.method,
    path: req.originalUrl,
    userId: req.user?.user?._id,

    error: err.message,
    stack: err.stack,

    body: req.body,
    query: req.query,
    params: req.params,
  });

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
};