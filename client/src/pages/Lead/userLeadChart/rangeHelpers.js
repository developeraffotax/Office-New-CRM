import dayjs from "dayjs";

/* ───────── Auto view ───────── */

// First row whose maxDays >= selected span wins. Tune freely.
export const VIEW_THRESHOLDS = [
  { maxDays: 31, view: "daily" },
  { maxDays: 80, view: "weekly" },
  { maxDays: 400, view: "monthly" },
  { maxDays: 800, view: "quarterly" },
  { maxDays: Infinity, view: "yearly" },
];

// Used when a "Compare with" option is selected: the view follows its unit.
// Tune freely, e.g. week: "daily" if two weekly bars feel too sparse.
export const COMPARE_VIEW = {
  week: "weekly",
  month: "monthly",
  quarter: "quarterly",
  year: "yearly",
};

export const rangeDays = ([start, end]) =>
  dayjs(end).startOf("day").diff(dayjs(start).startOf("day"), "day") + 1;

// range = the range the user picked (NOT widened); compareOption = resolved option or null
// returns null until both dates are set (custom range half-picked)
export function suggestView(range, compareOption = null) {
  if (compareOption) return COMPARE_VIEW[compareOption.group] ?? null;
  if (!range?.[0] || !range?.[1]) return null;
  const days = rangeDays(range);
  return VIEW_THRESHOLDS.find((t) => days <= t.maxDays).view;
}

/* ───────── Compare with ───────── */

// group  = which kind of range offers this option
// amount + unit = how far back the range is widened (dayjs units)
export const COMPARE_OPTIONS = [
  { value: "1w", label: "1 week", amount: 1, unit: "week", group: "week" },
  { value: "2w", label: "2 weeks", amount: 2, unit: "week", group: "week" },
  { value: "3w", label: "3 weeks", amount: 3, unit: "week", group: "week" },

  { value: "1m", label: "1 month", amount: 1, unit: "month", group: "month" },
  { value: "2m", label: "2 months", amount: 2, unit: "month", group: "month" },
  { value: "3m", label: "3 months", amount: 3, unit: "month", group: "month" },

  // quarters are expressed in months (no dayjs plugin needed)
  { value: "1q", label: "1 quarter", amount: 3, unit: "month", group: "quarter" },
  { value: "2q", label: "2 quarters", amount: 6, unit: "month", group: "quarter" },
  { value: "3q", label: "3 quarters", amount: 9, unit: "month", group: "quarter" },

  { value: "1y", label: "1 year", amount: 1, unit: "year", group: "year" },
  { value: "2y", label: "2 years", amount: 2, unit: "year", group: "year" },
  { value: "3y", label: "3 years", amount: 3, unit: "year", group: "year" },
];

// Which kind of range is selected: "week" | "month" | "quarter" | "year" | null
export function getCompareUnit(range) {
  if (!range?.[0] || !range?.[1]) return null;
  const s = dayjs(range[0]);
  const e = dayjs(range[1]);
  const startsOn = (unit) => s.isSame(s.startOf(unit), "day");

  // calendar-aligned presets, smallest first
  if (startsOn("month") && e.isSame(s, "month")) return "month";

  // quarter: starts on Jan/Apr/Jul/Oct 1 and stays inside that quarter
  const sameQuarter =
    e.isSame(s, "year") && Math.floor(e.month() / 3) === Math.floor(s.month() / 3);
  if (startsOn("month") && s.month() % 3 === 0 && sameQuarter) return "quarter";

  if (startsOn("year") && e.isSame(s, "year")) return "year";

  // everything else (Last 7 days, Last 30 days, custom): by length
  const days = rangeDays(range);
  if (days <= 10) return "week";
  if (days <= 240) return "month";
  return "year";
}

// Options to show for this range
export function getCompareOptions(range) {
  const group = getCompareUnit(range);
  return group ? COMPARE_OPTIONS.filter((o) => o.group === group) : [];
}

// The selected option, only if it is still valid for this range
export function resolveCompare(range, value) {
  return getCompareOptions(range).find((o) => o.value === value) ?? null;
}

// Widen the range backwards; the end stays where it is
export function extendRange(range, option) {
  if (!option || !range?.[0] || !range?.[1]) return range;
  return [dayjs(range[0]).subtract(option.amount, option.unit), range[1]];
}