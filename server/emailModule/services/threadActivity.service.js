// services/threadActivity.service.js
import { TRACKED_FIELDS } from "../utils/constants.js";
import ThreadActivity from "../models/ThreadActivity.js";
import userModel from "../../models/userModel.js";

export async function logThreadActivity(existingDoc, updateData, updatedBy, metadata = {}) {
  if (!updatedBy || !existingDoc || !updateData) return;

  const activities = [];

  for (const field in TRACKED_FIELDS) {
    if (updateData[field] === undefined) continue;

    let oldValue = existingDoc[field];
    let newValue = updateData[field];

    if (field === "userId") {
      const [oldUser, newUser] = await Promise.all([
        userModel.findById(existingDoc[field]).select("name").lean(),
        userModel.findById(updateData[field]).select("name").lean(),
      ]);
      oldValue = oldUser?.name || "";
      newValue = newUser?.name || "";
    }

    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) continue;

    activities.push({
      threadId: existingDoc._id,
      action: TRACKED_FIELDS[field],
      field,
      oldValue,
      newValue,
      performedBy: updatedBy,
      metadata,
    });
  }

  if (activities.length > 0) {
    await ThreadActivity.insertMany(activities);
  }
}