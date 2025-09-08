export const idColumn = (ctx) => {


  return {
  accessorKey: "_id",
  header: "ID",
  size: 0,
  maxSize: 0,
  minSize: 0,
  enableColumnFilter: false,
  enableSorting: false,
  Cell: () => null, // hidden
};
} 