export const emailColumn = (ctx) => {
  return {
    id: "email",
    accessorKey: "email",

    Header: ({ column }) => {
      const filterValue = column.getFilterValue() ?? "";

      return (
        <div className="flex flex-col gap-1">
          <span
            className="ml-1 cursor-pointer text-sm font-medium"
            title="Clear Filter"
            onClick={() => column.setFilterValue("")}
          >
            Email
          </span>

          <input
            type="search"
            value={filterValue}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder="Search email..."
            className="font-normal h-[1.8rem] px-2 cursor-pointer bg-white rounded-md border border-gray-300 outline-none"
          />
        </div>
      );
    },

    Cell: ({ row }) => {
      const email = row.original.email;

      return (
        <div className="w-full">
          <span>{email}</span>
        </div>
      );
    },

    // ✅ Case-insensitive email filter
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.original[columnId]?.toString().toLowerCase() || "";
      return cellValue.includes(filterValue.toLowerCase());
    },
    minSize: 100,
    maxSize: 220,
    grow: true,
  };
};
