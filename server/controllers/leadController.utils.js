import moment from "moment";
import { diffFields, recordActivity } from "../services/activityLog/activityLogService.js";
import goalModel from "../models/goalModel.js";

export const resolveGroupBy = (groupBy, startDate, endDate) => {
  const valid = ["day", "week", "month"];
  if (valid.includes(groupBy)) return groupBy;
  // "auto" or missing -> pick based on range length
  const diffDays = endDate.diff(startDate, "days");
  if (diffDays <= 31) return "day";
  if (diffDays <= 180) return "week";
  return "month";
};

export const dateFormatMap = {
  day: "%Y-%m-%d",
  week: "%G-W%V",
  month: "%Y-%m",
};

// Walks start->end in the given unit, returning aligned {keys, labels}
// keys must match the Mongo $dateToString output for that unit exactly
export const buildBucketKeysAndLabels = (startDate, endDate, groupUnit) => {
  const keys = [];
  const labels = [];
  let current = startDate.clone();

  if (groupUnit === "day") {
    while (current.isSameOrBefore(endDate, "day")) {
      keys.push(current.format("YYYY-MM-DD"));
      labels.push(current.format("DD MMM"));
      current.add(1, "day");
    }
  } else if (groupUnit === "week") {
    current = current.clone().startOf("isoWeek");
    while (current.isSameOrBefore(endDate, "day")) {
      keys.push(`${current.isoWeekYear()}-W${String(current.isoWeek()).padStart(2, "0")}`);
      const weekEnd = current.clone().endOf("isoWeek");
      labels.push(`${current.format("DD MMM")} - ${weekEnd.format("DD MMM")}`);
      current.add(1, "week");
    }
  } else {
    current = current.clone().startOf("month");
    while (current.isSameOrBefore(endDate, "day")) {
      keys.push(current.format("YYYY-MM"));
      labels.push(current.format("MMM YYYY"));
      current.add(1, "month");
    }
  }

  return { keys, labels };
};











// services/leadService.js
export const applyStatusTransition = (updates, userId) => {
  if (updates.status === "won") {
    updates.wonAt = new Date();
    updates.wonBy = userId;
    updates.lostAt = null;
    updates.lostBy = null;
  } else if (updates.status === "lost") {
    updates.lostAt = new Date();
    updates.lostBy = userId;
    updates.wonAt = null;
    updates.wonBy = null;
  } else if (updates.status === "progress") {
    updates.wonAt = null;
    updates.wonBy = null;
    updates.lostAt = null;
    updates.lostBy = null;
  }
  return updates;
};









// services/leadService.js
export const logLeadUpdate = async (leadId, beforeDoc, afterDoc, updatedKeys, userId) => {
  const changes = diffFields(beforeDoc, afterDoc, updatedKeys);
  if (changes.length === 0) return;

  const statusChange = changes.find((c) => c.field === "status");
  const message = statusChange
    ? `changed status from "${statusChange.from}" to "${statusChange.to}"`
    : `updated ${changes.map((c) => c.field).join(", ")}`;

  await recordActivity({
    entityType: "Lead",
    entityId: leadId,
    action: statusChange ? "status_changed" : "updated",
    performedBy: userId,
    changes,
    message,
  });
};


































// Goals are one-doc-per-month. Spread that month's achievement across every
// ISO week overlapping the month, weighted by day-overlap, so a boundary
// week (e.g. Jan 29 - Feb 4) gets the correct slice of each month's target.
function distributeMonthlyGoalAcrossWeeks(goal) {
  const monthStart = moment(goal.startDate).startOf("month");
  const monthEnd = moment(goal.startDate).endOf("month");
  const totalDays = monthEnd.diff(monthStart, "days") + 1;

  const dayCountByWeek = {}; // "isoYear-Wn" -> days of this month in that week
  const cursor = monthStart.clone();
  for (let i = 0; i < totalDays; i++) {
    const key = `${cursor.isoWeekYear()}-W${cursor.isoWeek()}`;
    dayCountByWeek[key] = (dayCountByWeek[key] || 0) + 1;
    cursor.add(1, "day"); // mutates cursor in place, no reassignment needed
  }

  const achievement = goal.achievement || 0;

  return Object.entries(dayCountByWeek).map(([periodKey, days]) => ({
    periodKey,
    goalType: goal.goalType,
    amount: achievement * (days / totalDays),
  }));
}

// Raw monthly goal docs -> weekly totals: { "year-Wweek": { [goalType]: amount } }
export async function getWeeklyGoalTotals(goalMatch) {
  const goals = await goalModel
    .find(goalMatch)
    .select("achievement startDate goalType")
    .lean();

  const totals = {};
  goals.forEach((goal) => {
    distributeMonthlyGoalAcrossWeeks(goal).forEach(
      ({ periodKey, goalType, amount }) => {
        totals[periodKey] ??= {};
        totals[periodKey][goalType] = (totals[periodKey][goalType] || 0) + amount;
      },
    );
  });

  return totals;
}