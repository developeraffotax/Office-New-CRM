import React from "react";

export const createClientColumn = () => ({
  accessorKey: "clientName",
  header: "Client",
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
          }}
        >
          Client
        </span>
        <input
          type="search"
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        />
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.original[columnId]?.toString().toLowerCase() || "";
    return cellValue.includes(filterValue.toLowerCase());
  },
  size: 120,
  minSize: 80,
  maxSize: 150,
  grow: false,
});

export default createClientColumn;


