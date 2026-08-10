// services/bulkActivityService.js
import mongoose from "mongoose";
import ActivityLog from "../../models/activityLogModel.js";
import { diffFields } from "./activityLogService.js";

// Fetches lean "before" snapshots for a batch of ids on any model.
export const snapshotEntities = async (model, ids) => {
  return model.find({ _id: { $in: ids } }).lean();
};

// Builds and inserts one ActivityLog document per entity that actually changed
// in a bulk action, all tagged with a shared batchId. Returns the batchId so
// the caller can reference/report on this specific bulk action.
export const recordBulkActivity = async ({
  entityType,
  beforeDocs,        // lean docs, pre-update
  afterDocs,         // lean docs, post-update
  updatedKeys,       // keys that were part of the bulk update payload
  performedBy,
  actionLabel = "bulk updated", // used in the fallback (non-status-change) message
}) => {
  const beforeMap = new Map(beforeDocs.map((doc) => [doc._id.toString(), doc]));
  const batchId = new mongoose.Types.ObjectId();

  const activityDocs = afterDocs.flatMap((afterDoc) => {
    const beforeDoc = beforeMap.get(afterDoc._id.toString());
    if (!beforeDoc) return [];

    const changes = diffFields(beforeDoc, afterDoc, updatedKeys);
    if (changes.length === 0) return [];

    const statusChange = changes.find((c) => c.field === "status");
    const message = statusChange
      ? `changed status from "${statusChange.from}" to "${statusChange.to}" (bulk update)`
      : `${actionLabel} ${changes.map((c) => c.field).join(", ")}`;

    return [{
      entityType,
      entityId: afterDoc._id,
      action: statusChange ? "status_changed" : "updated",
      performedBy,
      changes,
      message,
      meta: { bulk: true, batchId },
    }];
  });

  if (activityDocs.length === 0) return { batchId, insertedCount: 0 };

  try {
    await ActivityLog.insertMany(activityDocs);
  } catch (err) {
    console.log("Failed to record bulk activity:", err);
  }

  return { batchId, insertedCount: activityDocs.length };
};

// One "bulk action" as a single summary object, for a detail/toast view.
export const getBulkActionSummary = async (batchId) => {
  const [summary] = await ActivityLog.aggregate([
    { $match: { "meta.batchId": new mongoose.Types.ObjectId(batchId) } },
    {
      $group: {
        _id: "$meta.batchId",
        entityType: { $first: "$entityType" },
        action: { $first: "$action" },
        performedBy: { $first: "$performedBy" },
        createdAt: { $first: "$createdAt" },
        affectedCount: { $sum: 1 },
        entities: { $push: { entityId: "$entityId", changes: "$changes" } },
      },
    },
    { $lookup: { from: "users", localField: "performedBy", foreignField: "_id", as: "performedBy" } },
    { $unwind: "$performedBy" },
  ]);
  return summary;
};

// List of recent bulk actions, for an admin audit view.
export const getRecentBulkActions = async ({ entityType, limit = 20 } = {}) => {
  const match = { "meta.bulk": true };
  if (entityType) match.entityType = entityType;

  return ActivityLog.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$meta.batchId",
        entityType: { $first: "$entityType" },
        action: { $first: "$action" },
        performedBy: { $first: "$performedBy" },
        createdAt: { $first: "$createdAt" },
        affectedCount: { $sum: 1 },
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
  ]);
};