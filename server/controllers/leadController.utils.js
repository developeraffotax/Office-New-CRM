import moment from "moment";

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