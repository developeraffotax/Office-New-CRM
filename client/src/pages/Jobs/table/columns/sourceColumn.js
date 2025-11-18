export const sourceColumn = (ctx) => {


    return {
                id: "Source",
                accessorKey: "source",
                Header: ({ column }) => {
                  const sources = [
                    "FIV",
                    "UPW",
                    "PPH",
                    "Website",
                    "Direct",
                    "Partner",
                    "No Source",
                  ];
                  return (
                    <div className=" flex flex-col gap-[2px] w-[70px] items-center justify-center  ">
                      <span
                        className="ml-1 w-full text-center cursor-pointer pr-6"
                        title="Clear Filter"
                        onClick={() => {
                          column.setFilterValue("");
                        }}
                      >
                        Source
                      </span>

                      <select
                        value={column.getFilterValue() || ""}
                        onChange={(e) => column.setFilterValue(e.target.value)}
                        className="font-normal w-full max-w-[5rem] h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                      >
                        <option value="">Select</option>
                        {sources?.map((sour, i) => (
                          <option key={i} value={sour}>
                            {sour}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                },
                Cell: ({ cell, row }) => {
                  const source = row.original.source;
                  return (
                    <div className="w-full flex items-start justify-start">
                      <span className="text-[15px] font-medium">
                        {source && source}
                      </span>
                    </div>
                  );
                },
                // filterFn: "equals",
                filterFn: (row, columnId, filterValue) => {
                  const source = row.getValue(columnId);

                  if (filterValue === "No Source") {
                    return !source;
                  }

                  return source === filterValue;
                },
                size: 80,
                
              }
}