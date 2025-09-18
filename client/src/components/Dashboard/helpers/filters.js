// helpers/filters.js

// Build a date filter function
export function buildDateFilter({ search, selectedMonth, selectedYear, startDate, now }) {
  return function (itemDate) {
    const month = itemDate.getMonth() + 1;
    const year = itemDate.getFullYear();

    const today = new Date();
    const pastDate = new Date();

    if (search && !isNaN(search) && search >= 1) {
      pastDate.setDate(today.getDate() - parseInt(search));
    }

    const matchesSearch = !search || (itemDate >= pastDate && itemDate <= today);

    if (!selectedYear) {
      const normalizedDate = new Date(year, month - 1, 1);
      return (
        (!selectedMonth || month === parseInt(selectedMonth)) &&
        normalizedDate >= startDate &&
        normalizedDate <= now &&
        matchesSearch
      );
    }

    return (
      (!selectedMonth || month === parseInt(selectedMonth)) &&
      (!selectedYear || year === parseInt(selectedYear)) &&
      matchesSearch
    );
  };
}

// Month order for sorting
export const monthOrder = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

// Sort keys like "Aug 2025"
export function sortMonths(a, b) {
  const [monthA, yearA] = a.split(" ");
  const [monthB, yearB] = b.split(" ");
  return (
    parseInt(yearA) - parseInt(yearB) ||
    monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB)
  );
}
