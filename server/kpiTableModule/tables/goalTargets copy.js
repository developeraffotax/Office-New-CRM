import goalModel from "../../models/goalModel.js"; // <- adjust path/name if yours differs
import userModel from "../../models/userModel.js"; // <- adjust path/name if yours differs

/**
 * Per-user targets, read the same way getWonLeadData's MONTHLY view reads them:
 *   - goal docs of one goalType ("Target Lead Value" / "Target Lead Count")
 *   - one doc per user (jobHolder = user _id) per month, dated by `startDate`
 *   - the target amount lives in `achievement`
 *   - every goal whose startDate falls inside the selected range is summed
 *
 * Returns { [userName]: number } like every other table metric.
 *
 * Individual goals only (no " (Team Lead)" suffix), i.e. what getWonLeadData shows
 * for a single user. A team lead's column is their own target, not their team's.
 */
export const fetchGoalTargetsByUser = async ({ goalType, start, end, users = [], query = {} }) => {
  // Targets aren't split by lead source, so a source-filtered achievement would be
  // (filtered sales / whole target). Return nothing instead of a misleading number.
  if (query.source) return {};

  const match = {
    goalType,
    startDate: { $gte: new Date(start), $lte: new Date(end) },
  };

  // names -> ids (when users are selected, only look at their goals)
  if (users.length) {
    const found = await userModel
      .find({ name: { $in: users } })
      .select("name")
      .lean();
    if (!found.length) return {};
    match.jobHolder = { $in: found.map((u) => u._id) };
  }

  const rows = await goalModel.aggregate([
    { $match: match },
    { $group: { _id: "$jobHolder", total: { $sum: { $ifNull: ["$achievement", 0] } } } },
  ]);
  if (!rows.length) return {};

  // ids -> names
  const owners = await userModel
    .find({ _id: { $in: rows.map((r) => r._id) } })
    .select("name")
    .lean();
  const nameById = new Map(owners.map((u) => [String(u._id), u.name]));

  const out = {};
  rows.forEach((r) => {
    const name = nameById.get(String(r._id));
    if (name) out[name] = (out[name] || 0) + r.total;
  });
  return out;
};