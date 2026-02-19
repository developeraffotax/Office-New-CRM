import React from "react";

export const createAssignColumn = ({ userName, handleUpdateSubscription }) => ({
  accessorKey: "job.jobHolder",
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
          Assign
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {userName?.map((jobhold, i) => (
            <option key={i} value={jobhold}>
              {jobhold}
            </option>
          ))}
        </select>
      </div>
    );
  },
  Cell: ({ row }) => {
    const employee = row?.original?.job?.jobHolder;
    return (
      <div className="w-full flex items-center justify-center">
        <select
          value={employee || ""}
          onChange={(e) => {
            handleUpdateSubscription(
              row.original._id,
              e.target.value,
              "jobHolder"
            );
          }}
          className="w-full h-[2rem] rounded-md border-none outline-none"
        >
          <option value="empty"></option>
          {userName.map((jobHold, i) => (
            <option value={jobHold} key={i}>
              {jobHold}
            </option>
          ))}
        </select>
      </div>
    );
  },
  filterFn: "equals",
  filterSelectOptions: userName?.map((jobhold) => jobhold),
  filterVariant: "select",
  size: 110,
  minSize: 80,
  maxSize: 150,
  grow: false,
});

export default createAssignColumn;


