export const partnerColumn = (ctx) => {


    return   {
                id: "Partner",
                accessorKey: "partner",
                Header: ({ column }) => {
                  const partners = [
                    "Affotax",
                    "Outsource",
                    "OTL",
                    
                    "No Partner",
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
                        Partner
                      </span>

                      <select
                        value={column.getFilterValue() || ""}
                        onChange={(e) => column.setFilterValue(e.target.value)}
                        className="font-normal w-full max-w-[5rem] h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                      >
                        <option value="">Select</option>
                        {partners?.map((partner, i) => (
                          <option key={i} value={partner}>
                            {partner}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                },
                Cell: ({ cell, row }) => {
                  
                  const partner = row.original.partner;
                  
                  return (
                    <div className="w-full flex items-start justify-start">
                      <span className="text-[15px] font-medium">
                        {partner && partner}
                      </span>
                    </div>
                  );
                },
                
                filterFn: (row, columnId, filterValue) => {
                  const partner = row.getValue(columnId);

                  if (filterValue === "No Partner") {
                    return !partner;
                  }

                  return partner === filterValue;
                },
                size: 90,
              }
}