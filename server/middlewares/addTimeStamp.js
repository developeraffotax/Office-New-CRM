// middleware/addTimestamp.js
export function addTimestamp(req, res, next) {
  req.uploadTimestamp = req.body.timestamp || Date.now();
  next();
}