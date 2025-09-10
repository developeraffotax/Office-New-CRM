export const createIdColumn = () => ({
  accessorKey: "_id",
  header: "ID",
  size: 0,
  maxSize: 0,
  minSize: 0,
  enableColumnFilter: false,
  enableSorting: false,
  Cell: () => null,
});

export default createIdColumn;


