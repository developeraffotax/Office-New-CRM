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













// 2. Job Filter (composes Date Filter)
export function buildJobFilter({
  search,
  selectedMonth,
  selectedYear,
  startDate,
  now,
  selectedSource,
  selectedClient,
  selectedPartner,
  selectedDepartment,
}) {
  const dateFilterFn = buildDateFilter({ search, selectedMonth, selectedYear, startDate, now });

  return function (job) {
    const jobDate = new Date(job.currentDate);

    return (
      dateFilterFn(jobDate) &&
      (!selectedSource || job.source === selectedSource) &&
      (!selectedClient || job.clientType === selectedClient) &&
      (!selectedPartner || job.partner === selectedPartner) &&
      (!selectedDepartment || job.jobName === selectedDepartment)
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





 

export function fillMissingMonths(leadsMonthData) {
  const months = Object.keys(leadsMonthData).sort(sortMonths);
  if (months.length === 0) return leadsMonthData;

  // find first and last month indices in monthOrder
  const firstMonthIndex = monthOrder.indexOf(months[0]);
  const lastMonthIndex = monthOrder.indexOf(months[months.length - 1]);

  // loop only between first and last month
  for (let i = firstMonthIndex; i <= lastMonthIndex; i++) {
    const month = monthOrder[i];
    if (!leadsMonthData[month]) {
      leadsMonthData[month] = { leadCount: 0 };
    }
  }

  return leadsMonthData;
}
