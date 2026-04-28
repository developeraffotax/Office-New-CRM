import moment from "moment";

export const isWithinShift = (shift) => {
  const now = moment();
  
  const start = moment(shift.startTime, "HH:mm");
  const end = moment(shift.endTime, "HH:mm");

  const current = moment();

  // attach today’s date to shift times
  start.set({
    year: now.year(),
    month: now.month(),
    date: now.date(),
  });

  end.set({
    year: now.year(),
    month: now.month(),
    date: now.date(),
  });

  // handle overnight shift
  if (end.isBefore(start)) {
    return current.isAfter(start) || current.isBefore(end);
  }

  return current.isBetween(start, end);
};







export const formatTo12Hour = (time) => {
  if (!time) return "";

  return moment(time, "HH:mm").format("hh:mm A");
};