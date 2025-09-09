import React, { useEffect, useState } from "react";

export const createNameColumn = () => ({
  accessorKey: "name",
  header: "Template Name",
  Header: ({ column }) => {
    return (
      <div className=" w-[130px] flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
          }}
        >
          Template Name
        </span>
        <input
          type="search"
          value={column.getFilterValue() || ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        />
      </div>
    );
  },
  Cell: ({ row }) => {
    const name = row.original.name;
    const [allocateName, setAllocateName] = useState(name);
    const [showEdit, setShowEdit] = useState(false);
    useEffect(() => {
      setAllocateName(row.original.name);
    }, [row.original]);
    const updateAllocateTask = () => {
      setShowEdit(false);
    };
    return (
      <div className="w-full h-full ">
        {showEdit ? (
          <input
            type="text"
            placeholder="Enter Task..."
            value={allocateName}
            onChange={(e) => setAllocateName(e.target.value)}
            onBlur={() => updateAllocateTask()}
            className="w-full h-[2.3rem] focus:border border-gray-300 px-1 outline-none rounded"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-start "
            onDoubleClick={() => setShowEdit(true)}
            title={allocateName}
          >
            <p
              className="cursor-pointer text-start  "
              onDoubleClick={() => setShowEdit(true)}
            >
              {allocateName}
            </p>
          </div>
        )}
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.original[columnId]?.toString().toLowerCase() || "";
    return cellValue.includes(filterValue.toLowerCase());
  },
  size: 180,
  minSize: 120,
  maxSize: 200,
  grow: false,
});

export default createNameColumn;


