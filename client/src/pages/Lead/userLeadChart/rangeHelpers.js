import dayjs from "dayjs";

/* ───────── Auto view ───────── */

// First row whose maxDays >= selected span wins. Tune freely.
export const VIEW_THRESHOLDS = [
  { maxDays: 31, view: "daily" },
  { maxDays: 100, view: "weekly" },
  { maxDays: 800, view: "monthly" },
  { maxDays: 1000, view: "quarterly" },
  { maxDays: Infinity, view: "yearly" },
];

export const rangeDays = ([start, end]) =>
  dayjs(end).startOf("day").diff(dayjs(start).startOf("day"), "day") + 1;

// returns null until both dates are set (custom range half-picked)
export function suggestView(range) {
  if (!range?.[0] || !range?.[1]) return null;
  const days = rangeDays(range);
  return VIEW_THRESHOLDS.find((t) => days <= t.maxDays).view;
}

/* ───────── Compare with ───────── */

export const COMPARE_OPTIONS = [
  { value: "1w", label: "1 week", amount: 1, unit: "week" },
  { value: "2w", label: "2 weeks", amount: 2, unit: "week" },
  { value: "3w", label: "3 weeks", amount: 3, unit: "week" },
  { value: "1m", label: "1 month", amount: 1, unit: "month" },
  { value: "2m", label: "2 months", amount: 2, unit: "month" },
  { value: "3m", label: "3 months", amount: 3, unit: "month" },
  { value: "1y", label: "1 year", amount: 1, unit: "year" },
  { value: "2y", label: "2 years", amount: 2, unit: "year" },
  { value: "3y", label: "3 years", amount: 3, unit: "year" },
];

// Which unit the selected range is "in": "week" | "month" | "year" | null
export function getCompareUnit(range) {
  if (!range?.[0] || !range?.[1]) return null;
  const s = dayjs(range[0]);
  const e = dayjs(range[1]);
  const startsOn = (unit) => s.isSame(s.startOf(unit), "day");

  // calendar-aligned presets (This/Last month, This/Last year)
  if (startsOn("month") && e.isSame(s, "month")) return "month";
  if (startsOn("year") && e.isSame(s, "year")) return "year";

  // everything else (Last 7 days, Last 30 days, custom): by length
  const days = rangeDays(range);
  if (days <= 10) return "week";
  if (days <= 240) return "month";
  return "year";
}

// Options to show for this range
export function getCompareOptions(range) {
  const unit = getCompareUnit(range);
  return unit ? COMPARE_OPTIONS.filter((o) => o.unit === unit) : [];
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