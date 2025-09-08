export const dateStatusColumn = (ctx) => {

const getStatus = (startDateOfTask, deadlineOfTask) => {
  const startDate = new Date(startDateOfTask);
  const deadline = new Date(deadlineOfTask);
  const today = new Date();

  // Remove time parts for accurate date comparison
  startDate.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (deadline < today) {
    return "Overdue";
  } else if (
    startDate <= today &&
    !(deadline < today)
  ) {
     return "Due";
  } else {
    return "Upcoming";
  }
  
  // if (end.getTime() === today.getTime()) {
  //   return "Due";
  // }

  // if (end > today) {
  //   return "Upcoming";
  // }

  // return "";
};


    return     {
      accessorKey: "datestatus",
      Header: ({ column }) => {
        const dateStatus = ["Overdue", "Due", "Upcoming"];
        return (
          <div className=" flex flex-col gap-[2px]">
            <span
              className="ml-1 cursor-pointer "
              title="Clear Filter"
              onClick={() => {
                column.setFilterValue("");
              }}
            >
              Status
            </span>
            <form className="w-full flex ">
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] w-full  cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select </option>
                {dateStatus?.map((status, i) => (
                  <option key={i} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </form>
          </div>
        );
      },
      Cell: ({ row }) => {
        const status = getStatus(row.original.startDate, row.original.deadline);

        return (
          <div className="w-full flex items-center justify-center">
            <span
              className={`   rounded-[2rem] ${
                status === "Due"
                  ? "bg-green-500  py-[6px] px-4 text-white"
                  : status === "Overdue"
                  ? "bg-red-500  py-[6px] px-3 text-white"
                  : "bg-gray-200  py-[6px] px-3 text-black ml-[-5px]"
              }`}
            >
              {status}
            </span>
          </div>
        );
      },
      filterFn: (row, id, filterValue) => {
        const status = getStatus(row.original.startDate, row.original.deadline);
        if (status === undefined || status === null) return false;
        return status.toString().toLowerCase() === filterValue.toLowerCase();
      },
      filterSelectOptions: ["Overdue", "Due"],
      filterVariant: "select",
      size: 100,
      minSize: 90,
      maxSize: 110,
      grow: false,
    }
}