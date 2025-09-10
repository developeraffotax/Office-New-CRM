import React from "react";
import { getStatus } from "../../utils/utils";

export const createStatusColumn = () => ({
  accessorKey: "state",
  Header: ({ column }) => {
    const dateStatus = ["Overdue", "Due", "Upcoming"];
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
          }}
        >
          Status
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          className="font-normal ml-1 h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {dateStatus?.map((status, i) => (
            <option key={i} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    );
  },
  Cell: ({ row }) => {
    const status = getStatus(
      row.original.job.deadline,
      row.original.job.billingEnd
    );
    return (
      <div className="w-full ">
        <span
          className={`text-white   rounded-[2rem] ${
            status === "Due"
              ? "bg-green-500  py-[6px] px-4 "
              : status === "Overdue"
              ? "bg-red-500  py-[6px] px-3 "
              : "bg-gray-400  py-[6px] px-3"
          }`}
        >
          {status}
        </span>
      </div>
    );
  },
  filterFn: (row, id, filterValue) => {
    const status = getStatus(
      row.original.job.deadline,
      row.original.job.billingEnd
    );
    if (status === undefined || status === null) return false;
    return status.toString().toLowerCase() === filterValue.toLowerCase();
  },
  filterSelectOptions: ["Overdue", "Due"],
  filterVariant: "select",
  size: 100,
  minSize: 70,
  maxSize: 120,
  grow: false,
});

export default createStatusColumn;


