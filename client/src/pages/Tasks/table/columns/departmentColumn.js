import React from "react";

export const departmentColumn = (ctx) => ({
  accessorFn: (row) =>
    row.project?.departments?.map((d) => d.departmentName) || [],
  id: "departmentName",
  minSize: 150,
  maxSize: 200,
  size: 160,
  grow: false,

  Header: ({ column }) => (
    <div className="flex flex-col gap-[2px]">
      <span
        className="ml-1 cursor-pointer"
        title="Clear Filter"
        onClick={() => column.setFilterValue("")}
      >
        Department(s)
      </span>
      <select
        value={column.getFilterValue() || ""}
        onChange={(e) => column.setFilterValue(e.target.value)}
        className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
      >
        <option value="">Select</option>
        {ctx.departments?.map((dpt) => (
          <option key={dpt._id} value={dpt.departmentName}>
            {dpt.departmentName}
          </option>
        ))}
      </select>
    </div>
  ),

  Cell: ({ cell }) => {
    const values = cell.getValue();
    if (!values?.length) return <span>-</span>;

    return (
      <div className="flex flex-wrap gap-1">
        {values.map((name, idx) => (
          <span
            key={idx}
            className="px-2 py-[2px] text-xs rounded-md bg-blue-100 text-blue-700"
          >
            {name}
          </span>
        ))}
      </div>
    );
  },

  filterFn: (row, columnId, filterValue) => {
    const values = row.getValue(columnId) || [];
    return values.includes(filterValue);
  },
});
