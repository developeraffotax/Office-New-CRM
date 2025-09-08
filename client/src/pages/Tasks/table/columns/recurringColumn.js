export const recurringColumn = (ctx) => {


    return     {
      accessorKey: "recurring",
      Header: ({ column }) => {
        const recurringData = ["daily", "weekly", "monthly", "quarterly"];
        return (
          <div className=" flex flex-col items-center justify-center  w-full pr-2  gap-[2px]">
            <span
              className="cursor-pointer w-full text-center"
              title="Clear Filter"
              onClick={() => {
                column.setFilterValue("");
              }}
            >
              Recurring
            </span>
            <select
              value={column.getFilterValue() || ""}
              onChange={(e) => column.setFilterValue(e.target.value)}
              className="font-normal w-full h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
            >
              <option value="">Select</option>
              {recurringData?.map((recurr, i) => (
                <option key={i} value={recurr} className="capitalize">
                  {recurr}
                </option>
              ))}
            </select>
          </div>
        );
      },
      Cell: ({ cell, row, data }) => {
        const recurring = row.original.recurring;

        return (
          <div className="w-full flex items-center justify-center">
            <span
              className={`text-[15px] font-medium capitalize py-1 px-2 rounded-md  ${
                recurring === "daily"
                  ? "bg-orange-600 text-white"
                  : recurring === "weekly"
                  ? "bg-green-600 text-white"
                  : recurring === "monthly"
                  ? "bg-sky-600 text-white"
                  : recurring === "quarterly"
                  ? "bg-pink-600 text-white"
                  : ""
              } `}
            >
              {recurring}
            </span>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const cellValue =
          row.original[columnId]?.toString().toLowerCase() || "";

        return cellValue.startsWith(filterValue.toLowerCase());
      },
      size: 100,
      grow: false,
    }
}