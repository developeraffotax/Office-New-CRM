 
import roleModel from "../models/roleModel.js";
import userModel from "../models/userModel.js";
import { getAssignedUsers } from "./getAssignedUsers.js";

/**
 * Resolve recipient user ids for a notification, based on assignment rules.
 *
 * @param {string} type - assignment rule type, e.g. "whatsapp_lead", "quote"
 * @param {object} [options]
 * @param {boolean} [options.combineWithAdmins=false]
 *   false (default): if assigned users exist, use ONLY them; otherwise fall back to admins.
 *   true: always include admins AND assigned users (deduped).
 * @returns {Promise<mongoose.Types.ObjectId[]>}
 */
export async function getRecipientIds(type, { combineWithAdmins = false } = {}) {
  const automaticAssignedUsers = await getAssignedUsers(type);
  const hasAssigned = automaticAssignedUsers?.length > 0;

  // ── Pure fallback mode: assigned users win outright, no admin lookup ──
  if (hasAssigned && !combineWithAdmins) {
    return automaticAssignedUsers;
  }

  // ── Need admins either as fallback or to merge in ──
  const adminRole = await roleModel.findOne({ name: "Admin" });
  if (!adminRole) {
    return hasAssigned ? automaticAssignedUsers : [];
  }

  const admins = await userModel
    .find({ role: adminRole._id, isActive: true })
    .select("_id");

  const adminIds = admins.map((admin) => admin._id);

  if (!hasAssigned) {
    return adminIds;
  }

  // ── Combine mode: merge admins + assigned, deduped ──
  const adminIdStrings = new Set(adminIds.map((id) => id.toString()));
  const dedupedAssigned = automaticAssignedUsers.filter(
    (userId) => !adminIdStrings.has(userId.toString()),
  );

  return [...adminIds, ...dedupedAssigned];
}