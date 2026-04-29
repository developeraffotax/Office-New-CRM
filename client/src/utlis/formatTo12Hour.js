export const formatTo12Hour = (time) => {
  if (!time) return "";

  const [hour, minute] = time.split(":");
  let h = parseInt(hour);

  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h === 0 ? 12 : h;

  return `${h}:${minute} ${ampm}`;
};












export const formatLocalTimeTo12Hour = (dateInput) => {
  if (!dateInput) return "";

  const date = new Date(dateInput);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};