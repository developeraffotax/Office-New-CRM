export const phoneColumn = (ctx) => {
  return {
    id: "phone",
    accessorKey: "phone",

    Header: ({ column }) => {
      const filterValue = column.getFilterValue() ?? "";

      return (
        <div className="flex flex-col gap-1">
          <span
            className="ml-1 cursor-pointer text-sm font-medium"
            title="Clear Filter"
            onClick={() => column.setFilterValue("")}
          >
            Phone
          </span>

          <input
            type="search"
            value={filterValue}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder="Search phone..."
            className="font-normal h-[1.8rem] px-2 cursor-pointer bg-white rounded-md border border-gray-300 outline-none"
          />
        </div>
      );
    },

    Cell: ({ row }) => {
      const phone = row.original.phone;

      return (
        <div className="w-full">
          <span>{phone}</span>
        </div>
      );
    },

    // ✅ Case-insensitive phone filter
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.original[columnId]?.toString().toLowerCase() || "";
      return cellValue.includes(filterValue.toLowerCase());
    },
    minSize: 80,
    maxSize: 150,
    grow: true,
  };
};
