import { Link } from "react-router-dom";

export const clientNameColumn = (ctx) => {


    return {
          id: "clientName",
          accessorKey: "clientName",
          header: "Client",
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
                  Client
                </span>
                <input
                  type="search"
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] px-2 cursor-pointer bg-white rounded-md border border-gray-300 outline-none"
                />
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const clientName = row.original.clientName;
            const regNo = row.original.regNumber || "";
            // console.log("regNo:", row.original);

            return (
              <Link
                to={
                  regNo
                    ? `https://find-and-update.company-information.service.gov.uk/company/${regNo}`
                    : "#"
                }
                target="_black"
                className={`cursor-pointer flex items-center justify-start ${
                  regNo && "text-[#0078c8] hover:text-[#0053c8]"
                }   w-full h-full`}
              >
                {clientName}
              </Link>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            const cellValue =
              row.original[columnId]?.toString().toLowerCase() || "";

            return cellValue.includes(filterValue.toLowerCase());
          },
          size: 120,
          minSize: 80,
          maxSize: 150,
          grow: false,
        }
}