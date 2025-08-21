export const DateFilterFn = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);
  if (!cellValue) return false;

  const cellDate = new Date(cellValue);
  const today = new Date();

  //    const startOfToday = new Date(
  //       today.getFullYear(),
  //       today.getMonth(),
  //       today.getDate()
  //     );

  if (typeof filterValue === "object" && filterValue.from && filterValue.to) {
    const fromDate = new Date(filterValue.from);
    const toDate = new Date(filterValue.to);
    return cellDate >= fromDate && cellDate <= toDate;
  }

  switch (filterValue) {
    case "Expired":
      return cellDate < today;
    case "Today":
      return cellDate.toDateString() === today.toDateString();
    case "Yesterday":
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() - 1);
      return cellDate.toDateString() === tomorrow.toDateString();
    case "Last 7 days":
      const last7 = new Date(today);
      last7.setDate(today.getDate() - 7);
      return cellDate >= last7 && cellDate <= today;
    case "Last 15 days":
      const last15 = new Date(today);
      last15.setDate(today.getDate() - 15);
      return cellDate >= last15 && cellDate <= today;
    case "Last 30 Days":
      const last30 = new Date(today);
      last30.setDate(today.getDate() - 30);
      return cellDate >= last30 && cellDate <= today;
    case "Last 60 Days":
      const last60Days = new Date(today);
      last60Days.setDate(today.getDate() - 60);
      return cellDate >= last60Days && cellDate <= today;
    case "Last 12 months":
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      return cellDate >= lastYear && cellDate <= today;

    // 🔹 New filters
    case "This Month": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return cellDate >= startOfMonth && cellDate <= endOfMonth;
    }

    case "Last Month": {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return cellDate >= startOfLastMonth && cellDate <= endOfLastMonth;
    }

    case "This Year": {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      return cellDate >= startOfYear && cellDate <= endOfYear;
    }

    case "Last Year": {
      const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
      const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
      return cellDate >= startOfLastYear && cellDate <= endOfLastYear;
    }
    default:
      // if (typeof filterValue === "string" && filterValue.includes("-")) {
      //   const [year, month] = filterValue.split("-");
      //   const cellYear = cellDate.getFullYear().toString();
      //   const cellMonth = (cellDate.getMonth() + 1).toString().padStart(2, "0");
      //   return year === cellYear && month === cellMonth;
      // }
      return false;
  }
};
