export const hrsColumn = ({totalHours}) => {


    return         {
          id: "Hrs",
          accessorKey: "totalHours",
          Header: ({ column }) => {
            return (
              <div className=" flex flex-col gap-[2px] w-full items-center justify-center pr-2 ">
                <span
                  className="ml-1 w-full text-center cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Hrs
                </span>
                <span className="font-medium w-[5rem] ml-2 text-center  px-1 py-1 rounded-md bg-gray-50 text-black">
                  {totalHours}
                </span>
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const hours = cell.getValue();
            return (
              <div className="w-full flex items-center justify-center">
                <span className="text-[15px] font-medium">{hours}</span>
              </div>
            );
          },
          filterFn: "equals",
          size: 60,
        }
}