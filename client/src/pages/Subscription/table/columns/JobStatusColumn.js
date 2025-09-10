import React from "react";

export const createJobStatusColumn = ({ states, handleUpdateSubscription }) => ({
  accessorKey: "status",
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
          Job Status
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          className="font-normal h-[1.8rem] ml-1 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {states?.map((status, i) => (
            <option key={i} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const statusValue = cell.getValue();
    return (
      <select
        value={statusValue}
        onChange={(e) =>
          handleUpdateSubscription(
            row.original._id,
            e.target.value,
            "status"
          )
        }
        className="w-[6rem] h-[2rem] rounded-md border border-sky-300 outline-none"
      >
        <option value="empty"></option>
        {states?.map((stat, i) => (
          <option value={stat} key={i}>
            {stat}
          </option>
        ))}
      </select>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.getValue(columnId);
    return (cellValue || "").toString() === filterValue.toString();
  },
  filterSelectOptions: [
    "Data",
    "Progress",
    "Queries",
    "Approval",
    "Submission",
  ],
  filterVariant: "select",
  size: 110,
  grow: false,
});

export default createJobStatusColumn;


