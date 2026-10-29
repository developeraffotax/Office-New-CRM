// ai/utils/followUpTime.js
import { DateTime, IANAZone } from "luxon";

export const isValidZone = (z) => IANAZone.isValidZone(z);

const hm = (t = "09:00") => {
  const [hour, minute] = t.split(":").map(Number);
  return { hour, minute, second: 0, millisecond: 0 };
};

// now + N days, at sendTime in the schedule's timezone (never before startDate)
export function computeNextRun(s, from = new Date()) {
  const zone = s.timezone || "UTC";
  const at = hm(s.sendTime);
  let next = DateTime.fromJSDate(from, { zone }).plus({ days: s.frequencyDays }).set(at);
  if (s.startDate) {
    const start = DateTime.fromISO(s.startDate, { zone }).set(at);
    if (next < start) next = start;
  }
  return next.toJSDate();
}

// first run when the schedule is created: exactly startDate at sendTime, else one interval from now
export function computeFirstRun(s) {
  if (!s.startDate) return computeNextRun(s);
  const zone = s.timezone || "UTC";
  return DateTime.fromISO(s.startDate, { zone }).set(hm(s.sendTime)).toJSDate();
}