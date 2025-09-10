import React from "react";

export const createOwnerColumn = ({ userName, handleUpdateSubscription }) => ({
  accessorKey: "job.lead",
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px]">
        <span
          className="  cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
          }}
        >
          Owner
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          className="font-normal h-[1.8rem] w-full cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {userName?.map((lead, i) => (
            <option key={i} value={lead}>
              {lead}
            </option>
          ))}
        </select>
      </div>
    );
  },
  Cell: ({ cell, row }) => {
    const leadValue = cell.getValue();
    return (
      <div className="w-full">
        <select
          value={leadValue || ""}
          onChange={(e) =>
            handleUpdateSubscription(
              row.original._id,
              e.target.value,
              "lead"
            )
          }
          className="w-full h-[2rem] rounded-md border-none bg-transparent outline-none"
        >
          <option value="empty"></option>
          {userName.map((lead, i) => (
            <option value={lead} key={i}>
              {lead}
            </option>
          ))}
        </select>
      </div>
    );
  },
  filterFn: "equals",
  filterSelectOptions: userName.map((lead) => lead),
  filterVariant: "select",
  size: 100,
  minSize: 70,
  maxSize: 140,
  grow: false,
});

export default createOwnerColumn;


