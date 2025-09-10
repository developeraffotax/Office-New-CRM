import { useEffect } from "react";

export const assignColumn = ({auth, users, comment_taskId, handleUpdateJobHolder}) => {


    return         {
          id: "Assign",
          accessorKey: "job.jobHolder",
          Header: ({ column }) => {
            const user = auth?.user?.name;
            useEffect(() => {
              if(!comment_taskId) {

                column.setFilterValue(user);
              }

              // eslint-disable-next-line
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
                  {users?.map((jobhold, i) => (
                    <option key={i} value={jobhold}>
                      {jobhold}
                    </option>
                  ))}
                </select>
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const jobholder = cell.getValue();

            return (
              <div className="w-full flex items-center justify-center">
                <select
                  value={jobholder || ""}
                  onChange={(e) =>
                    handleUpdateJobHolder(row.original._id, e.target.value)
                  }
                  className="w-full h-[2rem] rounded-md border-none outline-none"
                >
                  <option value="empty"></option>
                  {users.map((jobHold, i) => (
                    <option value={jobHold} key={i}>
                      {jobHold}
                    </option>
                  ))}
                </select>
              </div>
            );
          },
          filterFn: "equals",
          filterSelectOptions: users.map((jobhold) => jobhold),
          filterVariant: "select",
          size: 100,
          minSize: 80,
          maxSize: 150,
          grow: false,
        }
}