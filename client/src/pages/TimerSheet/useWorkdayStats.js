import { useMemo } from "react";

export function useWorkdayStats(active) {
  // Utility to get weekday counts
  const getWeekdayCounts = ({ year, month = null }) => {
    const counts = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    let date = new Date(year, month ?? 0, 1);
    const end = month !== null ? new Date(year, month + 1, 0) : new Date(year, 11, 31);

    while (date <= end) {
      const dayIndex = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const label = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
      counts[label]++;
      date.setDate(date.getDate() + 1);
    }

    return counts;
  };

  return useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const counts =
      active === "Weekly"
        ? {
            Monday: 1,
            Tuesday: 1,
            Wednesday: 1,
            Thursday: 1,
            Friday: 1,
            Saturday: 1,
            Sunday: 1,
          }
        : active === "Monthly"
        ? getWeekdayCounts({ year, month })
        : getWeekdayCounts({ year });

    const totalWorkdays =
      counts["Monday"] +
      counts["Tuesday"] +
      counts["Wednesday"] +
      counts["Thursday"] +
      counts["Friday"];

    const requiredHours = totalWorkdays * 8;

    return {
      weekdayCounts: counts,
      totalWorkdays,
      requiredHours,
    };
  }, [active]);
}
