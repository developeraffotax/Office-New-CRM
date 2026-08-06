import React, { useEffect, useRef, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";

export const createSourceColumn = ({
  totalFee,
  handleUpdateSubscription,
  sources,
}) => ({
  accessorKey: "source",
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
          Source
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
          }}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          {sources.map((source, i) => (
            <option value={source} key={i}>
              {source}
            </option>
          ))}
        </select>
      </div>
    );
  },
  Cell: ({ row }) => {
    const source = row.original.source;
    const [show, setShow] = useState(false);
    const [localLead, setLocalLead] = useState(source || "");

    const handleChange = (e) => {
      const selectedValue = e.target.value;

      handleUpdateSubscription(row.original._id, selectedValue, "source");
      setShow(false);
    };

    return (
      <div className="w-full ">
        {!show ? (
          <div
            className="w-full cursor-pointer"
            onDoubleClick={() => setShow(true)}
          >
            {source ? (
              <span>{source}</span>
            ) : (
              <span className="text-white">.</span>
            )}
          </div>
        ) : (
          <select
            value={localLead || ""}
            className="w-full h-[2rem] rounded-md border-none  outline-none"
            onChange={handleChange}
          >
            <option value="empty"></option>
            {sources?.map((source, i) => (
              <option value={source} key={i}>
                {source}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  },
  filterFn: "equals",
  size: 80,
  minSize: 50,
  maxSize: 120,
});

export default createSourceColumn;
