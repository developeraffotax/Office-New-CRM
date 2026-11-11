import dayjs from "dayjs";

// ── Auto view ─────────────────────────────────────────────
// First row whose maxDays >= selected span wins. Tune freely.
export const VIEW_THRESHOLDS = [
  { maxDays: 31, view: "daily" },       // up to a month
  { maxDays: 100, view: "weekly" },     // up to ~3 months
  { maxDays: 800, view: "monthly" },    // up to ~2 years (a year → monthly)
  { maxDays: 1000, view: "quarterly" }, // up to ~2.7 years
  { maxDays: Infinity, view: "yearly" } // 3+ years
];

export const rangeDays = ([start, end]) =>
  dayjs(end).startOf("day").diff(dayjs(start).startOf("day"), "day") + 1;

// returns null until both dates are set (custom range half-picked)
export function suggestView(range) {
  if (!range?.[0] || !range?.[1]) return null;
  const days = rangeDays(range);
  return VIEW_THRESHOLDS.find((t) => days <= t.maxDays).view;
}

// ── Compare ───────────────────────────────────────────────
export const COMPARE_OPTIONS = [
  { value: "1m", label: "1 month ago", amount: 1, unit: "month" },
  { value: "2m", label: "2 months ago", amount: 2, unit: "month" },
  { value: "3m", label: "3 months ago", amount: 3, unit: "month" },
  { value: "1y", label: "1 year ago", amount: 1, unit: "year" },
  { value: "2y", label: "2 years ago", amount: 2, unit: "year" },
  { value: "3y", label: "3 years ago", amount: 3, unit: "year" },
];


export const getCompareOption = (value) =>
  COMPARE_OPTIONS.find((o) => o.value === value) ?? null;

// Widen the range backwards; the end stays where it is
export function extendRange(range, option) {
  if (!option || !range?.[0] || !range?.[1]) return range;
  return [dayjs(range[0]).subtract(option.amount, option.unit), range[1]];
}





// // Shift a [start, end] range back; a range ending on a month-end stays
// // month-end (Apr 30 - 1 month → Mar 31, not Mar 30)
// export function shiftRange([start, end], { amount, unit }) {
//   const s = dayjs(start).subtract(amount, unit);
//   const e0 = dayjs(end);
//   let e = e0.subtract(amount, unit);
//   if (e0.isSame(e0.endOf("month"), "day")) e = e.endOf("month");
//   return [s, e];
// }

// // Only offer shifts that don't overlap the current range:
// // "This year" can't compare with "1 month ago", but can with "1 year ago"
// export function getCompareOptions(range) {
//   if (!range?.[0] || !range?.[1]) return [];
//   const start = dayjs(range[0]);
//   return COMPARE_OPTIONS.filter((opt) => shiftRange(range, opt)[1].isBefore(start));
// }

// // pad / trim so the previous period lines up with the current labels by position
// export const alignToLength = (arr = [], length) =>
//   Array.from({ length }, (_, i) => arr[i] ?? 0);