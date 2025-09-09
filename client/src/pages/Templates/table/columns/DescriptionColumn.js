import React, { useEffect, useState } from "react";

export const createDescriptionColumn = ({ setTemplate, setShowTemplate }) => ({
  accessorKey: "description",
  header: "Description",
  Header: ({ column }) => {
    return (
      <div className=" w-[480px] flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
          }}
        >
          Description
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
    const description = row.original.description;
    const [allocateDescription, setAllocateDescription] = useState(description);
    const [showEdit, setShowEdit] = useState(false);
    useEffect(() => {
      setAllocateDescription(row.original.description);
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
            value={allocateDescription}
            onChange={(e) => setAllocateDescription(e.target.value)}
            onBlur={() => updateAllocateTask()}
            className="w-full h-[2.3rem] focus:border border-gray-300 px-1 outline-none rounded"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-start "
            onDoubleClick={() => setShowEdit(true)}
            title={allocateDescription}
          >
            <p
              className="text-blue-600 hover:text-blue-700 cursor-pointer text-start  "
              onDoubleClick={() => setShowEdit(true)}
              onClick={() => {
                setTemplate(row.original.template);
                setShowTemplate(true);
              }}
            >
              {allocateDescription}
            </p>
          </div>
        )}
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const cellValue = row.original[columnId]?.toString().toLowerCase() || "";
    const keywords = filterValue.toLowerCase().split(" ").filter(Boolean);
    return keywords.every((keyword) => cellValue.includes(keyword));
  },
  size: 500,
  minSize: 350,
  maxSize: 560,
  grow: false,
});

export default createDescriptionColumn;


