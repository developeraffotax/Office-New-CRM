import React, { useEffect } from "react";

export const jobHolderColumn = (ctx) => {





  return     {
        accessorKey: "jobHolder",
        header: "Job Holder",
  
        Header: ({ column }) => {
          const user = ctx.auth?.user?.name;
  
          useEffect(() => {
            column.setFilterValue(user);
  
             
          }, []);
  
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
          const jobholder = cell.getValue();
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <select
                value={jobholder || ""}
                className="w-full h-[2rem] rounded-md border-none outline-none"
                onChange={(e) =>
                  ctx.updateTaskJLS(row.original?._id, e.target.value, "", "")
                }
              >
                <option value="empty"></option>
                {ctx.users?.map((jobHold, i) => (
                  <option value={jobHold?.name} key={i}>
                    {jobHold.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: ctx.users?.map((jobhold) => jobhold.name),
        filterVariant: "select",
        size: 100,
        minSize: 80,
        maxSize: 130,
        grow: false,
      }







};
