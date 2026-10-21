import moment from "moment";
import goalModel from "../models/goalModel.js";
import userModel from "../models/userModel.js";





























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



























































export async function resolveUsers(requestedUsers) {
  const allTeamLeads = await userModel
    .find({ isTeamLead: true })
    .select("name isTeamLead juniors")
    .populate("juniors", "name")
    .lean();

  const resolved = await Promise.all(
    requestedUsers.map(async (name) => {
      if (name === "All") {
        const teamLeadNames = allTeamLeads.map((u) => u.name);
        const juniorNames = allTeamLeads
          .flatMap((u) => u.juniors || [])
          .map((j) => j.name);

        return [
          {
            label: "All",
            jobHolderNames: [...teamLeadNames, ...juniorNames],
            goalJobHolderIds: allTeamLeads.map((u) => u._id),
            goalTypeSuffix: " (Team Lead)",
          },
        ];
      }

      const fetchedUser = await userModel
        .findOne({ name })
        .select("name juniors isTeamLead")
        .populate("juniors", "name")
        .lean();

      if (!fetchedUser) return [];

      const juniorNames = fetchedUser.juniors?.map((j) => j.name) || [];

      // If user is a Team Lead, return BOTH team combined and individual series configs
      if (fetchedUser.isTeamLead) {
        return [
          {
            label: `${fetchedUser.name} & Team`,
            jobHolderNames: [fetchedUser.name, ...juniorNames],
            goalJobHolderIds: [fetchedUser._id],
            goalTypeSuffix: " (Team Lead)",
          },
          {
            label: `${fetchedUser.name} `,
            jobHolderNames: [fetchedUser.name],
            goalJobHolderIds: [fetchedUser._id],
            goalTypeSuffix: "",
          },
        ];
      }

      // Standard user (Junior / Individual)
      return [
        {
          label: fetchedUser.name,
          jobHolderNames: [fetchedUser.name],
          goalJobHolderIds: [fetchedUser._id],
          goalTypeSuffix: "",
        },
      ];
    })
  );

  return resolved.flat();
}


export function parseRequestedUsers(query) {
  let requested = query.users ?? query.user ?? "All";

  if (typeof requested === "string") {
    requested = requested
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(requested)) requested = [requested];
  if (requested.length === 0) requested = ["All"];

  return requested;
}



















































export const getWeekRangeLabel = (year, week) => {
  const monday = moment().isoWeekYear(year).isoWeek(week).startOf("isoWeek");
  const sunday = moment(monday).endOf("isoWeek");
  return `${monday.format("MMM D")} – ${sunday.format("MMM D")}`;
};





export function buildLabels(view, startDate, endDate, tz = "+05:00") {
  const labels = [];
  const periodKeys = {};
  const dayMeta = []; // daily only: used to spread monthly goals across days

  if (view === "daily") {
    
    const start = moment.utc(startDate).utcOffset(tz).startOf("day");
    const end = moment.utc(endDate).utcOffset(tz).endOf("day");
    const spansYears = start.year() !== end.year();
    const current = start.clone();

    while (current.isSameOrBefore(end)) {
      const key = current.format("YYYY-MM-DD");
      periodKeys[key] = labels.length;
      labels.push(current.format(spansYears ? "D MMM YYYY" : "D MMM"));
      dayMeta.push({ monthKey: current.format("YYYY-MM"), daysInMonth: current.daysInMonth() });
      current.add(1, "day");
    }
  } else if (view === "weekly") {
    const start = startDate ? moment(startDate) : moment().startOf("month");
    const end = endDate ? moment(endDate) : moment().endOf("month");
    let current = start.clone().startOf("isoWeek");

    while (current.isSameOrBefore(end)) {
      const weekYear = current.isoWeekYear();
      const weekNum = current.isoWeek();
      const key = `${weekYear}-W${weekNum}`;
      if (!(key in periodKeys)) {
        periodKeys[key] = labels.length;
        labels.push(getWeekRangeLabel(weekYear, weekNum));
      }
      current.add(1, "week");
    }
  } else {
    const start = startDate ? moment(startDate).startOf("month") : moment().startOf("year");
    const end = endDate ? moment(endDate).endOf("month") : moment().endOf("year");
    let current = start.clone();

    while (current.isSameOrBefore(end)) {
      const key = `${current.year()}-${current.month() + 1}`;
      if (!(key in periodKeys)) {
        periodKeys[key] = labels.length;
        labels.push(current.format("MMM YYYY"));
      }
      current.add(1, "month");
    }
  }

  return { labels, periodKeys, dayMeta };
}
