 

export const companyColumn = (ctx) => {


    return            {
        accessorKey: "company",
        minSize: 100,
        maxSize: 200,
        size: 100,
        grow: false,
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
                Company
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                <option value={"Affotax"}>Affotax</option>
                <option value={"Outsource"}>Outsource</option>
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const company = row.original.company;
          return (
            <div className="w-full px-1">
              <span>{company}</span>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: ctx.companyData?.map((category) => category?.name),
        filterVariant: "select",
      }
}