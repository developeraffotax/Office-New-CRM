import moment from "moment";
import goalModel from "../models/goalModel.js";
import { getWeeklyGoalTotals } from "./shared.utils.js";

export const VALID_VIEWS = ["daily", "weekly", "monthly"];
export const MAX_DAILY_RANGE_DAYS = 366;

export const JOB_METRICS = {
  prepared: {
    nameField: "prepared",
    stampField: "preparedAt",
    goalName: "Jobs Prepared",
  },
  reviewed: {
    nameField: "review",
    stampField: "reviewedAt",
    goalName: "Jobs Reviewed",
  },
  filed: { nameField: "filed", stampField: "filedAt", goalName: "Jobs Filed" },
};

// which date puts a job into a chart period
export const JOB_DATE_BASES = {
  workDeadline: () => "job.workDeadline",
  jobDeadline: () => "job.jobDeadline",
  yearEnd: () => "job.yearEnd",
  updated: () => "updatedAt",
  event: (m) => m.stampField,
};
















const round2 = (n) => Math.round(n * 100) / 100;
const localTz = (d, tz) => moment.utc(d).utcOffset(tz);











// names in prepared/review/filed are matched against the same
// team-lead + juniors name list used for leads
export const jobsPipeline = (ru, nameField, dateField, dateRange) => [
  {
    $match: {
      [nameField]: { $in: ru.jobHolderNames },
      [dateField]: dateRange,
      // optionally: isActive: true,
    },
  },
];






// Same range rules as getWonLeadData (weekly snaps to whole ISO weeks)
export function buildJobDateRange(view, startDate, endDate, tz) {
  if (!startDate || !endDate) return { $ne: null };
  if (view === "weekly") {
    return {
      $gte: localTz(startDate, tz).startOf("isoWeek").toDate(),
      $lte: localTz(endDate, tz).endOf("isoWeek").toDate(),
    };
  }
  return { $gte: new Date(startDate), $lte: new Date(endDate) };
}













// Goal targets aligned to the chart labels (same logic as the lead goals)
export async function getJobGoalTargets({
  ru,
  countType,
  view,
  startDate,
  endDate,
  tz,
  labels,
  periodKeys,
  dayMeta,
}) {
  const targets = new Array(labels.length).fill(0);



  const goalMatch = {
    goalType: { $in: [countType] },
    jobHolder: { $in: ru.goalJobHolderIds },
  };

  // console.log(goalMatch)

  if (startDate && endDate) {
    if (view === "daily") {
      goalMatch.startDate = {
        $gte: localTz(startDate, tz).startOf("month").toDate(),
        $lte: localTz(endDate, tz).endOf("month").toDate(),
      };
    } else if (view === "weekly") {
      goalMatch.startDate = {
        $gte: localTz(startDate, tz)
          .startOf("isoWeek")
          .startOf("month")
          .toDate(),
        $lte: localTz(endDate, tz).endOf("isoWeek").endOf("month").toDate(),
      };
    } else {
      goalMatch.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
  }

  if (view === "daily") {
    const goalsAgg = await goalModel.aggregate([
      { $match: goalMatch },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$startDate",
              timezone: tz,
            },
          },
          total: { $sum: { $ifNull: ["$achievement", 0] } },
        },
      },
    ]);
    const monthly = Object.fromEntries(goalsAgg.map((g) => [g._id, g.total]));
    dayMeta.forEach(({ monthKey, daysInMonth }, idx) => {
      if (monthly[monthKey])
        targets[idx] = round2(monthly[monthKey] / daysInMonth);
    });
  } else if (view === "weekly") {
    const weeklyTotals = await getWeeklyGoalTotals(goalMatch);
    Object.entries(weeklyTotals).forEach(([periodKey, byType]) => {
      const idx = periodKeys[periodKey];
      if (idx !== undefined && byType[countType])
        targets[idx] = byType[countType];
    });
  } else {
    const goalsAgg = await goalModel.aggregate([
      { $match: goalMatch },
      {
        $group: {
          _id: {
            year: { $year: "$startDate" },
            month: { $month: "$startDate" },
          },
          total: { $sum: { $ifNull: ["$achievement", 0] } },
        },
      },
    ]);
    goalsAgg.forEach((g) => {
      const idx = periodKeys[`${g._id.year}-${g._id.month}`];
      if (idx !== undefined) targets[idx] = g.total;
    });
  }

  return targets;
}
