export const assignColumn = ({
  auth,
  users,
  comment_taskId,
  handleUpdateJobHolder,
}) => {

  const user = auth?.user?.name || "";

  return {
    id: "Assign",
    accessorKey: "job.jobHolder",

    // ======================================================
    // HEADER (PURE UI ONLY)
    // ======================================================
    Header: ({ column }) => (
      <div className="flex flex-col gap-[2px]">

        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => column.setFilterValue("")}
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
    ),

    // ======================================================
    // CELL (SAFE)
    // ======================================================
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
            <option value=""> </option>

            {users.map((jobHold, i) => (
              <option value={jobHold} key={i}>
                {jobHold}
              </option>
            ))}
          </select>
        </div>
      );
    },

    // ======================================================
    // FILTER CONFIG
    // ======================================================
    filterFn: "equals",
    filterSelectOptions: users,
    filterVariant: "select",

    size: 100,
    minSize: 80,
    maxSize: 150,
    grow: false,
  };
};