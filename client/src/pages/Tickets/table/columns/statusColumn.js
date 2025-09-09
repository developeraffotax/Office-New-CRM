 

export const statusColumn = (ctx) => {


    return            {
        accessorKey: "status",
        header: "Status",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col items-center justify-center gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Status
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] w-[80px] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {ctx.status?.map((stat, i) => (
                  <option key={i} value={stat}>
                    {stat}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const stat = cell.getValue();

          return (
            <div className="w-full flex items-center justify-center">
              <span
                className={` py-1 px-2 rounded-lg text-white ${
                  stat === "Read"
                    ? "bg-gray-500"
                    : stat === "Unread"
                    ? "bg-sky-400"
                    : "bg-green-400"
                } `}
              >
                {stat}
              </span>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: ctx.status.map((stat) => stat),
        filterVariant: "select",
        size: 90,
        minSize: 80,
        maxSize: 130,
        grow: false,
      }
}