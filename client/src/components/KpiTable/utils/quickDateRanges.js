import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

dayjs.extend(quarterOfYear);

// Single source of truth for every "quick" date range on the dashboard.
// Computed fresh on each call so ranges stay correct across day/month/
// quarter/year boundaries instead of being frozen at module import time.
export const getQuickDateRanges = () => {
  const now = dayjs();
  const lastMonth = now.subtract(1, "month");
  const lastQuarter = now.subtract(1, "quarter");
  const lastYear = now.subtract(1, "year");

  return {
    "This Month": [now.startOf("month"), now.endOf("month")],
    "Last Month": [lastMonth.startOf("month"), lastMonth.endOf("month")],
    "This Quarter": [now.startOf("quarter"), now.endOf("quarter")],
    "Last Quarter": [lastQuarter.startOf("quarter"), lastQuarter.endOf("quarter")],
    "This Year": [now.startOf("year"), now.endOf("year")],
    "Last Year": [lastYear.startOf("year"), lastYear.endOf("year")],
    "This Financial Year": [
      dayjs().subtract(1, "year").startOf("month"),
      dayjs().endOf("month"),
    ],
    "Last Financial Year": [
      dayjs().subtract(2, "year").startOf("month"),
      dayjs().subtract(1, "year").endOf("month"),
    ],
  };
};