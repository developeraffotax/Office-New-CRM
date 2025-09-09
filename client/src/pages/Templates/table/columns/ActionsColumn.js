import React from "react";
import { GrCopy } from "react-icons/gr";
import { RiEdit2Line } from "react-icons/ri";
import { AiTwotoneDelete } from "react-icons/ai";

export const createActionsColumn = ({
  duplicateTemplate,
  setTemplateId,
  setAddTemplate,
  handleDeleteTemplateConfirmation,
}) => ({
  accessorKey: "actions",
  header: "Actions",
  Cell: ({ row }) => {
    return (
      <div className="flex items-center justify-center gap-4 w-full h-full">
        <span
          className="text-[1rem] cursor-pointer"
          onClick={() => duplicateTemplate(row.original)}
          title="Copy Template"
        >
          <GrCopy className="h-5 w-5 text-cyan-500 hover:text-cyan-600 " />
        </span>
        <span
          className=""
          title="Edit Template"
          onClick={() => {
            setTemplateId(row.original._id);
            setAddTemplate(true);
          }}
        >
          <RiEdit2Line className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
        </span>
        <span
          className="text-[1rem] cursor-pointer"
          onClick={() => handleDeleteTemplateConfirmation(row.original._id)}
          title="Delete Template!"
        >
          <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600 " />
        </span>
      </div>
    );
  },
  size: 140,
});

export default createActionsColumn;


