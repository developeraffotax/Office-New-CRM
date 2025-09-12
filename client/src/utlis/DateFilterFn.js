export const DateFilterFn = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);
  if (!cellValue) return false;

  const cellDate = new Date(cellValue);
  const today = new Date();

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

    case "Yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return cellDate.toDateString() === yesterday.toDateString();
    }

    case "Last 7 days": {
      const last7 = new Date(today);
      last7.setDate(today.getDate() - 7);
      return cellDate >= last7 && cellDate <= today;
    }

    case "Last 15 days": {
      const last15 = new Date(today);
      last15.setDate(today.getDate() - 15);
      return cellDate >= last15 && cellDate <= today;
    }

    case "Last 30 Days": {
      const last30 = new Date(today);
      last30.setDate(today.getDate() - 30);
      return cellDate >= last30 && cellDate <= today;
    }

    case "Last 60 Days": {
      const last60 = new Date(today);
      last60.setDate(today.getDate() - 60);
      return cellDate >= last60 && cellDate <= today;
    }

    case "Last 12 months": {
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      return cellDate >= lastYear && cellDate <= today;
    }

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

    // 🔹 New filters
    case "This Quarter": {
      const currentQuarter = Math.floor(today.getMonth() / 3); // 0=Q1, 1=Q2, 2=Q3, 3=Q4
      const startOfQuarter = new Date(today.getFullYear(), currentQuarter * 3, 1);
      const endOfQuarter = new Date(today.getFullYear(), currentQuarter * 3 + 3, 0);
      return cellDate >= startOfQuarter && cellDate <= endOfQuarter;
    }

    case "Last Quarter": {
      let quarter = Math.floor(today.getMonth() / 3); // 0=Q1, 1=Q2...
      let year = today.getFullYear();

      if (quarter === 0) {
        // if currently Q1, last quarter = Q4 previous year
        quarter = 3;
        year -= 1;
      } else {
        quarter -= 1;
      }

      const startOfLastQuarter = new Date(year, quarter * 3, 1);
      const endOfLastQuarter = new Date(year, quarter * 3 + 3, 0);
      return cellDate >= startOfLastQuarter && cellDate <= endOfLastQuarter;
    }

    default:
      return false;
  }
};
