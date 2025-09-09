import { useEffect, useState } from "react";

export const jobStatusColumn = (ctx) => {


    return            {
            accessorKey: "jobStatus",
            header: "Job Status",
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
                    className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                  >
                    <option value="">Select</option>
                    {ctx.jobStatusOptions?.map((status, i) => (
                      <option key={i} value={status}>
                        {status}
                      </option>
                    ))}
    
                    <option value="empty">Empty</option>
                  </select>
                </div>
              );
            },
            Cell: ({ cell, row, table }) => {
              const jobStatus = cell.getValue();
    
              const [show, setShow] = useState(false);
              const [value, setValue] = useState(jobStatus);
    
              return (
                <div className="w-full">
                  {show ? (
                    <select
                      value={value || ""}
                      className="w-full h-[2rem] rounded-md border-none  outline-none"
                      onChange={(e) => {
                        ctx.updateJobStatus(row.original._id, e.target.value);
                        //setValue(e.target.value);
                        setShow(false);
                      }}
                    >
                      <option value="empty"></option>
                      {ctx.jobStatusOptions?.map((status, i) => (
                        <option value={status} key={i}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      onDoubleClick={() => setShow(true)}
                      className="w-full h-full cursor-pointer"
                    >
                      {jobStatus && jobStatus !== "empty" ? (
                        jobStatus
                      ) : (
                        <div className="text-white w-full h-full  ">.</div>
                      )}
                    </span>
                  )}
                </div>
              );
            },
    
            filterFn: (row, columnId, filterValue) => {
              const cellValue = row.getValue(columnId);
    
              if (filterValue === "empty") {
                return !cellValue || cellValue === "empty";
              }
    
              return String(cellValue ?? "") === String(filterValue);
            },
    
            size: 100,
            minSize: 80,
            maxSize: 150,
            grow: false,
          }
}