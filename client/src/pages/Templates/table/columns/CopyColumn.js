import React from "react";
import { IoMdCopy } from "react-icons/io";

export const createCopyColumn = ({ copyTemplate }) => ({
  accessorKey: "template",
  header: "Copy",
  Cell: ({ row }) => {
    const template = row.original.template;

    return (
      <div className="flex items-center justify-center w-full h-full">
        <span
          className=" cursor-pointer"
          onClick={() => copyTemplate(template)}
          title="Copy Template"
        >
          <IoMdCopy className="h-7 w-7 text-cyan-500 hover:text-cyan-600 " />
        </span>
      </div>
    );
  },
  size: 60,
});

export default createCopyColumn;


