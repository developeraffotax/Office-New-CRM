import React from "react";

export const createCompanyNameColumn = () => ({
  accessorKey: "companyName",
  minSize: 190,
  maxSize: 300,
  size: 200,
  grow: false,
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
          Company Name
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
  Cell: ({ cell }) => {
    const companyName = cell.getValue();
    return (
      <div className="cursor-pointer text-[#0078c8] hover:text-[#0053c8] w-full h-full flex items-center justify-start">
        {companyName}
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.original[columnId]?.toString().toLowerCase() || "";
    return cellValue.includes(filterValue.toLowerCase());
  },
});

export default createCompanyNameColumn;


