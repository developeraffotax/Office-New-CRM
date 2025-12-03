// -----------Handle Custom date filter------
export const getCurrentMonthYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
};












export const DateFilterFn = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);
  if (!cellValue) return false;

  const cellDate = new Date(cellValue);
  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (typeof filterValue === "object" && filterValue.from && filterValue.to) {
    const fromDate = new Date(filterValue.from);
    const toDate = new Date(filterValue.to);
    return cellDate >= fromDate && cellDate <= toDate;
  }

  switch (filterValue) {
    case "Expired":
      return cellDate < startOfToday;
    case "Today":
      return cellDate.toDateString() === today.toDateString();
    case "Tomorrow":
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return cellDate.toDateString() === tomorrow.toDateString();
    case "In 7 days":
      const in7Days = new Date(today);
      in7Days.setDate(today.getDate() + 7);
      return cellDate <= in7Days && cellDate > today;
    case "In 15 days":
      const in15Days = new Date(today);
      in15Days.setDate(today.getDate() + 15);
      return cellDate <= in15Days && cellDate > today;
    case "In 30 Days":
      const in30Days = new Date(today);
      in30Days.setDate(today.getDate() + 30);
      return cellDate <= in30Days && cellDate > today;
    case "In 60 Days":
      const in60Days = new Date(today);
      in60Days.setDate(today.getDate() + 60);
      return cellDate <= in60Days && cellDate > today;
    // case "Last 12 months":
    //   const lastYear = new Date(today);
    //   lastYear.setFullYear(today.getFullYear() - 1);
    //   return cellDate >= lastYear && cellDate <= today;
    default:
      return false;
  }
};





























export const TaskDateFilterFn = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);
  if (!cellValue) return false;

  const cellDate = new Date(cellValue);
  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (typeof filterValue === "object" && filterValue.from && filterValue.to) {
    const fromDate = new Date(filterValue.from);
    const toDate = new Date(filterValue.to);
    return cellDate >= fromDate && cellDate <= toDate;
  }

  switch (filterValue) {
        case "Expired":
          return cellDate < startOfToday;

           case "Upcoming":
          return cellDate > tomorrow;

        case "Yesterday":
          const Yesterday = new Date(today);
          Yesterday.setDate(today.getDate() - 1);
          return cellDate.toDateString() === Yesterday.toDateString();

        case "Today":
          return cellDate.toDateString() === today.toDateString();
        case "Tomorrow":
          return cellDate.toDateString() === tomorrow.toDateString();
        case "In 7 days":
          const in7Days = new Date(today);
          in7Days.setDate(today.getDate() + 7);

          return cellDate <= in7Days && cellDate > tomorrow;
        case "In 15 days":
          const in15Days = new Date(today);
          in15Days.setDate(today.getDate() + 15);
          return cellDate <= in15Days && cellDate > tomorrow;
        case "In 30 Days":
          const in30Days = new Date(today);
          in30Days.setDate(today.getDate() + 30);
          return cellDate <= in30Days && cellDate > tomorrow;
        case "In 60 Days":
          const in60Days = new Date(today);
          in60Days.setDate(today.getDate() + 60);
          return cellDate <= in60Days && cellDate > tomorrow;

        default:
          return false;
      }
};
