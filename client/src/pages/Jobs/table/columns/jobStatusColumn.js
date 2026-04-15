import { useEffect } from "react";

export const jobStatusColumn = ({
  comment_taskId,
  handleUpdateTicketStatusConfirmation,
}) => {

  const jobStatusOptions = [
        "Quote",
        "Data",
        "Progress",
        "Revision",
        "Approval",
        "Submission",
        "Billing",
        "Feedback",
        "Missing Info",
      ];


  return {
    id: "Job_Status",

    // accessorKey: "jobStatus",

    accessorFn: (row) => row.job?.jobStatus || "",

    // ✅ HEADER (same UI, server-side safe)
    Header: ({ column }) => {
      

      // ✅ Default filter (server-safe)
      // useEffect(() => {
      //   if (!comment_taskId) {
      //     const current = column.getFilterValue();

      //     if (!current) {
      //       column.setFilterValue("Progress");
      //     }
      //   }
      // }, []);

      return (
        <div className="flex flex-col gap-[2px]">
          <span
            className="ml-1 cursor-pointer"
            title="Clear Filter"
            onClick={() => column.setFilterValue(undefined)}
          >
            Job Status
          </span>

          <select
            value={column.getFilterValue() || ""}
            onChange={(e) => {
              const value = e.target.value;

              column.setFilterValue(
                value === "" ? undefined : value
              );
            }}
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

    // ✅ CELL (unchanged UI)
    Cell: ({ cell, row }) => {
      const statusValue = cell.getValue();

      return (
        <select
          value={statusValue || "empty"}
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

          {/* <option value="Queries">Queries</option> */}

          <option value="Revision">Revision</option>
          <option value="Approval">Approval</option>
          <option value="Submission">Submission</option>
          <option value="Billing">Billing</option>
          <option value="Feedback">Feedback</option>
          <option value="Missing Info">
            Missing Info
          </option>

          <option value="Inactive">Inactive</option>
        </select>
      );
    },

 
    size: 110,
    grow: false,
  };
};