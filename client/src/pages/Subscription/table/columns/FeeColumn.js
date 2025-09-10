import React, { useEffect, useRef, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";

export const createFeeColumn = ({ totalFee, handleUpdateSubscription }) => ({
  accessorKey: "job.fee",
  Header: ({ column }) => {
    return (
      <div className=" flex flex-col gap-[2px] w-[80px]  items-center justify-center pr-2 ">
        <span
          className="ml-1 w-full text-center cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
          }}
        >
          Fee
        </span>
        <span className="font-medium w-full text-center  px-1 py-1 rounded-md bg-gray-50 text-black">
          {totalFee}
        </span>
      </div>
    );
  },
  Cell: ({ row }) => {
    const fee = row.original.job.fee;
    const [showFee, setShowFee] = useState(false);
    const [newFee, setNewFee] = useState(fee);
    const inputRef = useRef(null);

    useEffect(() => {
      if (showFee && inputRef?.current) {
        inputRef.current.focus();
      }
    }, [showFee]);

    const handleDateChange = () => {
      handleUpdateSubscription(row.original._id, newFee, "fee");
      setShowFee(false);
    };

    return (
      <div className="w-full flex items-center justify-center">
        {showFee ? (
          <form onSubmit={handleDateChange}>
            <input
              ref={inputRef}
              type="text"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              className="h-[2rem] w-full rounded-md border border-orange-200 px-1 outline-none"
            />
          </form>
        ) : (
          <span
            className="text-[15px] font-medium cursor-pointer"
            onDoubleClick={() => setShowFee(true)}
          >
            {fee ? (
              fee
            ) : (
              <span className="text-gray-400 cursor-pointer">
                <AiOutlineEdit />
              </span>
            )}
          </span>
        )}
      </div>
    );
  },
  filterFn: "equals",
  size: 80,
  minSize: 50,
  maxSize: 120,
});

export default createFeeColumn;


