import { useEffect } from "react";

export const jobStatusColumn = ({comment_taskId, handleUpdateTicketStatusConfirmation}) => {


    return         {
          id: "Job_Status",
          accessorKey: "jobStatus",
          accessorFn: (row) => row.job?.jobStatus || "",
          Header: ({ column }) => {
            const jobStatusOptions = [
              "Quote",
              "Data",
              "Progress",
              "Queries",
              "Approval",
              "Submission",
              "Billing",
              "Feedback",
               
              
              
            ];

            useEffect(() => {
              if(!comment_taskId) {
                column.setFilterValue("Progress");

              }
            }, []);

            return (
              <div className="flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => column.setFilterValue("")}
                >
                  Job Status
                </span>
                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] ml-1 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {jobStatusOptions.map((status, i) => (
                    <option key={i} value={status}>
                      {status}
                    </option>
                  ))}

                <option value="empty">Empty</option>
                 
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
                  handleUpdateTicketStatusConfirmation(
                    row.original._id,
                    e.target.value
                  )
                }
                className="w-[6rem] h-[2rem] rounded-md border border-sky-300 outline-none"
              >
                <option value="empty"></option>
                <option value="Quote">Quote</option>
                <option value="Data">Data</option>
                <option value="Progress">Progress</option>
                <option value="Queries">Queries</option>
                <option value="Approval">Approval</option>
                <option value="Submission">Submission</option>
                <option value="Billing">Billing</option>
                <option value="Feedback">Feedback</option>
                
                <option value="Inactive">Inactive</option>
              </select>
            );
          },


          // filterFn: (row, columnId, filterValue) => {
          //   const labelName = row.original?.data?.name || "";
          //   if (filterValue === "empty") {
          //     return !labelName;
          //   }
          //   return labelName === filterValue;
          // },


          filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue(columnId);
            
            if (filterValue === "empty") {

              return cellValue === "empty" ? true : !cellValue

            
                }


            return (cellValue || "").toString() === filterValue.toString();
          },
          filterSelectOptions: [
            "Quote",
            "Data",
            "Progress",
            "Queries",
            "Approval",
            "Submission",
            "Billing",
            "Feedback",
            "empty",
           
            "Inactive",
          ],
          filterVariant: "select",
          size: 110,
          grow: false,
        }
}