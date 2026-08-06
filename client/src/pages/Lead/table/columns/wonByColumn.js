// createWonByColumn.js
import React from "react";

export const createWonByColumn = ({ users }) => {
  const userMap = new Map(users?.map((user) => [user._id, user.name]) || []);

  return {
    accessorKey: "wonBy",
    Header: ({ column }) => {
      return (
        <div className="flex flex-col gap-[2px]">
          <span
            className="cursor-pointer"
            title="Clear Filter"
            onClick={() => {
              column.setFilterValue("");
            }}
          >
            Won By
          </span>
          <select
            value={column.getFilterValue() || ""}
            onChange={(e) => column.setFilterValue(e.target.value)}
            className="font-normal h-[1.8rem] w-full cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
          >
            <option value="">Select</option>
            {users?.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      );
    },
    Cell: ({ cell }) => {
      const wonBy = cell.getValue();

      const displayName =
        wonBy && typeof wonBy === "object"
          ? wonBy.name || wonBy.username || ""
          : userMap.get(wonBy) || "";

      return (
        <div className="w-full h-[2rem] flex items-center px-2 text-sm text-gray-600">
          {displayName || "-"}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue(columnId);
      if (!cellValue) return false;

      const id = typeof cellValue === "object" ? cellValue._id : cellValue;
      return id?.toString() === filterValue;
    },
    size: 100,
    minSize: 70,
    maxSize: 140,
    grow: false,
  };
};

export default createWonByColumn;