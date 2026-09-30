import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

dayjs.extend(quarterOfYear);

// Compact number formatter: 2300 -> "2.3k", 3450000 -> "3.5m"
export const formatCompactNumber = (val) => {
  if (val === undefined || val === null || Number.isNaN(val)) return "";
  const num = Number(val);
  const sign = num < 0 ? "-" : "";
  const abs = Math.abs(num);

  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${sign}${abs}`;
};

// Start and end dates for a named filter
export const getDateRange = (filter) => {
  const now = dayjs();
  switch (filter) {
    case "thisYear":
      return [now.startOf("year"), now.endOf("year")];
    case "lastYear":
      return [
        now.subtract(1, "year").startOf("year"),
        now.subtract(1, "year").endOf("year"),
      ];
    case "thisMonth":
      return [now.startOf("month"), now.endOf("month")];
    case "lastMonth":
      return [
        now.subtract(1, "month").startOf("month"),
        now.subtract(1, "month").endOf("month"),
      ];
    case "thisQuarter":
      return [now.startOf("quarter"), now.endOf("quarter")];
    case "lastQuarter":
      return [
        now.subtract(1, "quarter").startOf("quarter"),
        now.subtract(1, "quarter").endOf("quarter"),
      ];
    default:
      return [null, null];
  }
};







 
export function isDailyAllowed(dateRange) {
  const [start, end] = dateRange || [];
  if (!start || !end) return false;
  // inclusive span in days
  return dayjs(end).diff(dayjs(start), "day") < 32;
}