export const clientTypeColumn = (ctx) => {


    return {
                id: "ClientType",
                accessorKey: "clientType",
                Header: ({ column }) => {
                  const clientType = [
                    "Limited",
                    "LLP",
                    "Individual",
                    "Non UK",
                    "No CT",
                  ];
                  return (
                    <div className=" flex flex-col gap-[2px] w-[80px] items-center justify-center  ">
                      <span
                        className="ml-1 w-full text-center cursor-pointer pr-6"
                        title="Clear Filter"
                        onClick={() => {
                          column.setFilterValue("");
                        }}
                      >
                        Client Type
                      </span>

                      <select
                        value={column.getFilterValue() || ""}
                        onChange={(e) => column.setFilterValue(e.target.value)}
                        className="font-normal w-full max-w-[5rem] h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                      >
                        <option value="">Select</option>
                        {clientType?.map((sour, i) => (
                          <option key={i} value={sour}>
                            {sour}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                },
                Cell: ({ cell, row }) => {
                  const clientType = row.original.clientType;
                  return (
                    <div className="w-full flex items-start justify-start">
                      <span className="text-[15px] font-medium">
                        {clientType && clientType}
                      </span>
                    </div>
                  );
                },
                // filterFn: "equals",
                filterFn: (row, columnId, filterValue) => {
                  const clientType = row.getValue(columnId);

                  if (filterValue === "No CT") {
                    return !clientType;
                  }

                  return clientType === filterValue;
                },
                size: 90,
              }
}