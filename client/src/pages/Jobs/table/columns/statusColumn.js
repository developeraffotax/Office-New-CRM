import { getStatus } from "../../utils/utils";
//actually the due status
export const statusColumn = (ctx) => {

  const dateStatus = ["Overdue", "Due", "Upcoming"];

    return         {
          id: "Status",
          // accessorKey: "status",
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
                  Status
                </span>
                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal ml-1 h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {dateStatus?.map((status, i) => (
                    <option key={i} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            );
          },
          Cell: ({ row }) => {
            const status = getStatus(
              row.original.job?.jobDeadline,
              row.original.job?.yearEnd
            );
 
            return (
              <div className="w-full ">
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
           
 
          size: 95,
          minSize: 70,
          maxSize: 120,
          grow: false,
        }
}