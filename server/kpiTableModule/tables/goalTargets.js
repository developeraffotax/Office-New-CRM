import moment from "moment";
import goalModel from "../../models/goalModel.js"; // <- adjust path/name if yours differs
import userModel from "../../models/userModel.js"; // <- adjust path/name if yours differs

const DEFAULT_TZ = "+05:00"; // same default getWonLeadData uses
const TZ_RE = /^[+-]\d{2}:\d{2}$/;

/** { "2026-09": 3, "2026-10": 4 } = how many days of the range fall in each month (in `tz`). */
const rangeDaysByMonth = (start, end, tz) => {
  const days = {};
  const cursor = moment.utc(start).utcOffset(tz).startOf("day");
  const last = moment.utc(end).utcOffset(tz).endOf("day");
  while (cursor.isSameOrBefore(last)) {
    const key = cursor.format("YYYY-MM");
    days[key] = (days[key] || 0) + 1;
    cursor.add(1, "day");
  }
  return days;
};

const daysInMonthOf = (monthKey) => moment.utc(`${monthKey}-01`).daysInMonth();

/**
 * Per-user targets for ANY date range, built from the monthly goal docs.
 *
 * Goals are one doc per user per month (jobHolder = user _id, dated by `startDate`,
 * amount in `achievement`). Each month's goal is spread evenly over that month's days,
 * and the range gets the days it covers:
 *
 *     target = sum over months of  monthlyGoal * (days of range in month / days in month)
 *
 * so
 *   - whole months            -> the full monthly target (same as the monthly chart)
 *   - one week / a few days   -> that many days' share (same totals as the daily/weekly views)
 *   - a range across 2 months -> each month contributes only its own days
 *
 * Individual goals only (no " (Team Lead)" suffix), i.e. what getWonLeadData shows for a
 * single user. Counts are left fractional here (e.g. 0.9 leads for 7 days); the service
 * rounds to 2 decimals.
 *
 * Returns { [userName]: number } like every other table metric.
 */
export const fetchGoalTargetsByUser = async ({ goalType, start, end, users = [], query = {} }) => {
  // Targets aren't split by lead source, so a source-filtered achievement would be
  // (filtered sales / whole target). Return nothing instead of a misleading number.
  if (query.source) return {};

  const tz = TZ_RE.test(query.tz || "") ? query.tz : DEFAULT_TZ;

  const daysInRange = rangeDaysByMonth(start, end, tz);
  if (!Object.keys(daysInRange).length) return {};

  const match = {
    goalType,
    // whole months, so a goal starting on the 1st isn't dropped for a mid-month range
    startDate: {
      $gte: moment.utc(start).utcOffset(tz).startOf("month").toDate(),
      $lte: moment.utc(end).utcOffset(tz).endOf("month").toDate(),
    },
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
    {
      $group: {
        _id: {
          user: "$jobHolder",
          month: { $dateToString: { format: "%Y-%m", date: "$startDate", timezone: tz } },
        },
        total: { $sum: { $ifNull: ["$achievement", 0] } },
      },
    },
  ]);
  if (!rows.length) return {};

  // prorate each month's goal by the days of the range that fall in that month
  const byUserId = {};
  rows.forEach(({ _id, total }) => {
    const days = daysInRange[_id.month] || 0;
    if (!days) return;
    const id = String(_id.user);
    byUserId[id] = (byUserId[id] || 0) + (total * days) / daysInMonthOf(_id.month);
  });

  // ids -> names
  const owners = await userModel
    .find({ _id: { $in: Object.keys(byUserId) } })
    .select("name")
    .lean();

  const out = {};
  owners.forEach((u) => {
    out[u.name] = byUserId[String(u._id)];
  });
  return out;
};