export const getColumnSearchValue = (
  columnFilters,
  columnId,
  globalSearch
) => {
  const columnFilter = columnFilters?.find(
    (f) => f.id === columnId
  )?.value;

  return columnFilter || globalSearch || "";
};