import { useEffect, useState } from "react";
import { NumderFilterFn } from "../../../../utlis/NumberFilterPortal";
import { TiFilter } from "react-icons/ti";

export const sentColumn = (ctx) => {


    return          {
            accessorKey: "sent",
            
             Header: ({column}) => (
        <div className="flex flex-col items-center justify-between">
           <span title="Click to remove filter" onClick={() => column.setFilterValue("")} className="cursor-pointer ">Sent</span>
          <button ref={ctx.anchorRef} onClick={(e) => ctx.handleFilterClick(e, "sent")}>
            <TiFilter size={20} className="ml-1 text-gray-500 hover:text-black" />
          </button>
        </div>
      ),
            Cell: ({ row }) => {
              const sent = row.original.sent;
              return (
                <span className="w-full flex justify-center text-lg bg-orange-600 text-white rounded-md">
                  {sent}
                </span>
              );
            },
    
            size: 60,
              filterFn: NumderFilterFn,
          }
}