import React, { useState } from "react";

export const createTargetColumn = ({ setFormData, handleUpdateData, formData }) => ({
  accessorKey: "achievement",
  minSize: 60,
  maxSize: 80,
  size: 140,
  grow: false,
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
          Target
        </span>
        <input
          type="search"
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
          }}
          className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-white border-gray-300 rounded-md border  outline-none"
        />
      </div>
    );
  },
  Cell: ({ row }) => {
    const achievement = row.original.achievement;
    const [show, setShow] = useState(false);
    const [localClientName, setLocalClientName] = useState(achievement);

    const handleSubmit = (e) => {
      e?.preventDefault?.();
      setFormData((prevData) => ({
        ...prevData,
        achievement: localClientName,
      }));
      handleUpdateData(row.original._id, {
        ...formData,
        achievement: localClientName,
      });
      setShow(false);
    };

    return (
      <div className="w-full px-1">
        {show ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={localClientName}
              autoFocus
              onChange={(e) => setLocalClientName(e.target.value)}
              className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
            />
          </form>
        ) : (
          <div
            onDoubleClick={() => setShow(true)}
            className="cursor-pointer w-full flex items-center justify-center"
          >
            {achievement ? achievement : <div className="text-white w-full h-full">.</div>}
          </div>
        )}
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.original[columnId]?.toString().toLowerCase() || "";
    return cellValue.includes(filterValue.toLowerCase());
  },
  filterVariant: "select",
});

export default createTargetColumn;


