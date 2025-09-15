 
import { IoRemoveCircle } from "react-icons/io5";

export const completedActionsColumn = ( {handleUpdateClientStatus}) => {


    return         {
            accessorKey: "complete",
            header: "Actions",
            Cell: ({ cell, row }) => {
              return (
                <div
                  className="flex items-center justify-center gap-1 w-full h-full"
                  onClick={() => {
                    handleUpdateClientStatus(row.original._id);
                  }}
                >
                  <span className="text-[1rem] cursor-pointer">
                    <IoRemoveCircle className="h-5 w-5 text-red-500 hover:text-red-600" />
                  </span>
                </div>
              );
            },
            size: 100,
          }
}