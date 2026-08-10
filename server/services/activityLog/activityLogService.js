// services/activityLogService.js
import mongoose from "mongoose";
import ActivityLog from "../../models/activityLogModel.js";

 
const normalize = (val) => {
  if (val === undefined || val === null || val === "") return null;
  if (val instanceof Date) return val.getTime();
  if (val instanceof mongoose.Types.ObjectId) return val.toString();
  return val;
};

export const diffFields = (before = {}, after = {}, keys = Object.keys(after)) => {
  const changes = [];
  for (const key of keys) {
    const fromVal = before[key];
    const toVal = after[key];
    if (normalize(fromVal) !== normalize(toVal)) {
      changes.push({ field: key, from: fromVal ?? null, to: toVal ?? null });
    }
  }
  return changes;
};
export const recordActivity = async ({ entityType, entityId, action, performedBy, changes = [], message, meta }) => {
  try {
    return await ActivityLog.create({ entityType, entityId, action, performedBy, changes, message, meta });
  } catch (error) {
    // Never let logging failure break the main write
    console.log("Failed to record activity:", error);
    return null;
  }
};

export const getActivityForEntity = async (entityType, entityId, { limit = 50, skip = 0 } = {}) => {
  return ActivityLog.find({ entityType, entityId })
    .populate("performedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};