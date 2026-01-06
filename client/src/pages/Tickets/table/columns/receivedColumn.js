import { useEffect, useState } from "react";
import { TiFilter } from "react-icons/ti";
import { NumderFilterFn } from "../../../../utlis/NumberFilterPortal";

export const receivedColumn = (ctx) => {


    return  {
      accessorKey: "received",
      Header: ({column}) => (
        <div className="flex flex-col items-center justify-between">
          <span title="Click to remove filter" onClick={() => column.setFilterValue("")} className="cursor-pointer ">Recv.</span>
          <button ref={ctx.anchorRef} onClick={(e) => ctx.handleFilterClick(e, "received")}>
            <TiFilter size={20} className="ml-1 text-gray-500 hover:text-black" />
          </button>
        </div>
      ),
      filterFn: NumderFilterFn,
      Cell: ({ row }) => (
        <span className="w-full flex justify-center text-lg bg-sky-600 text-white rounded-md">
          {row.original.received}
        </span>
      ),
      size: 60,
    }
}