export const idColumn = (ctx) => {
  return {
    accessorKey: "_id",
    header: "ID",

    size: 0,
    maxSize: 0,
    minSize: 0,
    enableColumnFilter: false, // 🔒 no filter input
    enableSorting: false,

    Cell: () => null, // visually hides the content
  };
};
