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

  const dayCountByWeek = {};
  const cursor = monthStart.clone();
  for (let i = 0; i < totalDays; i++) {
    const key = `${cursor.isoWeekYear()}-W${cursor.isoWeek()}`;
    dayCountByWeek[key] = (dayCountByWeek[key] || 0) + 1;
    cursor.add(1, "day");
  }

  const achievement = Number(goal.achievement) || 0;
  const isCount = /count/i.test(goal.goalType);
  const entries = Object.entries(dayCountByWeek);
  const raw = entries.map(([, days]) => (achievement * days) / totalDays);

  let amounts;
  if (isCount) {
    // whole leads per week, still summing exactly to the monthly target
    amounts = raw.map(Math.floor);
    let remaining = Math.round(achievement) - amounts.reduce((a, b) => a + b, 0);
    raw
      .map((r, i) => ({ i, frac: r - Math.floor(r) }))
      .sort((a, b) => b.frac - a.frac)
      .forEach(({ i }) => {
        if (remaining-- > 0) amounts[i] += 1;
      });
  } else {
    // values: just round to 2 decimals
    amounts = raw.map((r) => Math.round(r * 100) / 100);
  }

  return entries.map(([periodKey], i) => ({
    periodKey,
    goalType: goal.goalType,
    amount: amounts[i],
  }));
}


 

// mode: "daily" (recommended) | "thursday" (÷ weeks in month) | "fixed4" (plain ÷ 4)
// export function distributeMonthlyGoalAcrossWeeks(goal, tz = "+05:00", mode = "daily") {
//   const monthStart = moment.utc(goal.startDate).utcOffset(tz).startOf("month");
//   const daysInMonth = monthStart.daysInMonth();
//   const total = goal.achievement || 0;
//   const byWeek = {};
//   const keyOf = (d) => `${d.isoWeekYear()}-W${d.isoWeek()}`;

//   if (mode === "daily") {
//     const perDay = total / daysInMonth;
//     for (let i = 0; i < daysInMonth; i++) {
//       const key = keyOf(monthStart.clone().add(i, "day"));
//       byWeek[key] = (byWeek[key] || 0) + perDay;
//     }
//   } else {
//     // each ISO week has exactly one Thursday, so the week belongs to that day's month
//     const weekKeys = [];
//     for (let i = 0; i < daysInMonth; i++) {
//       const d = monthStart.clone().add(i, "day");
//       if (d.isoWeekday() === 4) weekKeys.push(keyOf(d));
//     }
//     const divisor = mode === "fixed4" ? 4 : weekKeys.length;
//     weekKeys.forEach((key) => {
//       byWeek[key] = total / divisor;
//     });
//   }

//   return Object.entries(byWeek).map(([periodKey, amount]) => ({
//     periodKey,
//     goalType: goal.goalType,
//     amount,
//   }));
// }




// Raw monthly goal docs -> weekly totals: { "year-Wweek": { [goalType]: amount } }
export async function getWeeklyGoalTotals(goalMatch) {
  const goals = await goalModel
    .find(goalMatch)
    .select("achievement startDate goalType")
    .lean();


    
    const totals = {};
    goals.forEach((goal) => {
      console.log(distributeMonthlyGoalAcrossWeeks(goal))
      distributeMonthlyGoalAcrossWeeks(goal).forEach(
        ({ periodKey, goalType, amount }) => {
          totals[periodKey] ??= {};
          totals[periodKey][goalType] = (totals[periodKey][goalType] || 0) + amount;
        },
      );
    });
    
    console.log("totals >>>" , totals)
  return totals;
}



