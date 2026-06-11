import { useEffect, useState } from "react";

export const leadUserColumn = (ctx) => {
  return {
    accessorKey: "leadUser",
    // id: "Lead",

    Header: ({ column }) => {
      const user = ctx.auth?.user?.name;

      return (
        <div className=" flex flex-col gap-[2px]">
          <span
            className="ml-1 cursor-pointer"
            title="Clear Filter"
            onClick={() => {
              column.setFilterValue("");
            }}
          >
            Lead
          </span>

          <select
            value={column.getFilterValue() || ""}
            onChange={(e) => column.setFilterValue(e.target.value)}
            className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
          >
            <option value="">Select</option>
            {ctx.users?.map((jobhold, i) => (
              <option key={i} value={jobhold?.name}>
                {jobhold?.name}
              </option>
            ))}
          </select>
        </div>
      );
    },
    Cell: ({ cell, row }) => {
      const leadUser = cell.getValue();
      const [show, setShow] = useState(false);
      const [employee, setEmployee] = useState(leadUser);

      return (
        <div className="w-full">
          {show ? (
            <select
              value={employee || ""}
              className="w-full h-[2rem] rounded-md border-none  outline-none"
              onChange={(e) => {
                ctx.updateLeadUser(row.original._id, e.target.value);
                setEmployee(e.target.value);
                setShow(false);
              }}
            >
              <option value="empty"></option>
              {ctx.users?.map((jobHold, i) => (
                <option value={jobHold?.name} key={i}>
                  {jobHold.name}
                </option>
              ))}
            </select>
          ) : (
            <span
              onDoubleClick={() => setShow(true)}
              className="w-full cursor-pointer"
            >
              {leadUser ? leadUser : <div className="text-white w-full">.</div>}
            </span>
          )}
        </div>
      );
    },
    filterFn: (row, id, filterValue) => {
      if (!filterValue) return true;

      const value = row.getValue(id);

      return (
        (value || "").toString().trim().toLowerCase() ===
        filterValue.toLowerCase()
      );
    },
    filterSelectOptions: (ctx.users || [])
      .map((jobhold) => jobhold?.name)
      .filter(Boolean),
    filterVariant: "select",
    size: 100,
    minSize: 80,
    maxSize: 130,
    grow: false,
  };
};
