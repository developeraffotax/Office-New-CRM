import React from "react";
import { GoEye } from "react-icons/go";
import { GrCopy } from "react-icons/gr";
import { MdOutlineModeEdit, MdCheckCircle } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";

export const createActionsColumn = ({
  setShowGoalDetail,
  setNote,
  handleCopyGoal,
  setGoalId,
  setShow,
  handleupdateConfirmation,
  handleDeleteGoalConfirmation,
}) => ({
  accessorKey: "actions",
  header: "Actions",
  Cell: ({ row }) => {
    return (
      <div className="flex items-center justify-center gap-2 w-full h-full">
        <span
          className=""
          title="See Detail"
          onClick={() => {
            setShowGoalDetail(true);
            setNote(row.original.note);
          }}
        >
          <GoEye className="h-5 w-5 cursor-pointer text-sky-500 hover:text-sky-600" />
        </span>
        <span
          className="text-[1rem] cursor-pointer"
          onClick={() => {
            handleCopyGoal(row.original._id);
          }}
          title="Copy Goal"
        >
          <GrCopy className="h-6 w-6 text-lime-600 " />
        </span>
        <span
          className="text-[1rem] cursor-pointer"
          onClick={() => {
            setGoalId(row.original._id);
            setShow(true);
          }}
          title="Edit Goal"
        >
          <MdOutlineModeEdit className="h-6 w-6 text-sky-600 " />
        </span>
        <span
          className=""
          title="Complete Goal"
          onClick={() => {
            handleupdateConfirmation(row.original._id);
          }}
        >
          <MdCheckCircle className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
        </span>
        <button
          type="button"
          onClick={() => handleDeleteGoalConfirmation(row.original._id)}
          title="Delete Goal!"
        >
          <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600" />
        </button>
      </div>
    );
  },
  size: 160,
});

export default createActionsColumn;


