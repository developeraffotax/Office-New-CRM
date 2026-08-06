import React from "react";

export const createCompletedByColumn = ({ users }) => {
  const userMap = new Map(users?.map((user) => [user._id, user.name]) || []);

  return {
    accessorKey: "completedBy",
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
            Completed By
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
      const completedBy = cell.getValue();

      // handles a raw id string, or a populated { _id, name } object, just in case
      const displayName =
        completedBy && typeof completedBy === "object"
          ? completedBy.name || completedBy.username || ""
          : userMap.get(completedBy) || "";

      return (
        <div className="w-full h-[2rem] flex items-center px-2 text-sm text-gray-600">
          {displayName || "-"}
        </div>
      );
    },
    filterFn: "equals",
    size: 100,
    minSize: 70,
    maxSize: 140,
    grow: false,
  };
};

export default createCompletedByColumn;