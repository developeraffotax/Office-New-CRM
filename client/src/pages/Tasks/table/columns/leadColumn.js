export const leadColumn = (ctx) => {



    return     {
      accessorKey: "lead",
      Header: ({ column }) => {
        return (
          <div className=" flex flex-col gap-[2px] ml-1">
            <span
              className="ml-1 cursor-pointer "
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
              className=" font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
            >
              <option value="">Select</option>
              {ctx.users?.map((lead, i) => (
                <option key={i} value={lead?.name}>
                  {lead?.name}
                </option>
              ))}
            </select>
          </div>
        );
      },
      Cell: ({ cell, row }) => {
        const leadValue = cell.getValue();

        return (
          <div className="flex items-center justify-center w-full">
            <select
              value={leadValue || ""}
              onChange={(e) =>
                ctx.updateTaskJLS(row.original?._id, "", e.target.value, "")
              }
              className="w-full h-[2rem] rounded-md border-none bg-transparent outline-none"
            >
              <option value="empty"></option>
              {ctx.users?.map((lead, i) => (
                <option value={lead?.name} key={i}>
                  {lead?.name}
                </option>
              ))}
            </select>
          </div>
        );
      },
      filterFn: "equals",
      filterSelectOptions: ctx.users?.map((lead) => lead),
      filterVariant: "select",
      size: 100,
      minSize: 60,
      maxSize: 120,
      grow: false,
    }



}