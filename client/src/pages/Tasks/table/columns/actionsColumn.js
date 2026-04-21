import { useEffect, useState } from "react";
import { AiTwotoneDelete } from "react-icons/ai";
import { GrCopy } from "react-icons/gr";
import { MdCheckCircle, MdErrorOutline, MdInsertComment } from "react-icons/md";
import { hasSubrole } from "../../../../utlis/checkPermission";

export const actionsColumn = (ctx) => {
  return {
    accessorKey: "actions",
    header: "Actions",
    Cell: ({ cell, row }) => {
       

      const hasAddComplainPermission = hasSubrole(
        ctx.auth.user,
        "Tasks",
        "Complain",
      );

      return (
        <div className="flex items-center justify-center gap-3 w-full h-full">
          <span
            className="text-[1rem] cursor-pointer"
            onClick={() => ctx.copyTask(row.original)}
            title="Copy this task"
          >
            {" "}
            <GrCopy className="h-5 w-5 text-cyan-600 " />{" "}
          </span>

          <span
            title="View Comments"
            className="flex items-center justify-center gap-1 relative w-full h-full"
            onClick={() => {
              ctx.setCommentTaskId(row.original._id);
              ctx.setIsComment(true);
            }}
          >
            {" "}
            <div className="relative">
              {" "}
              <span className="text-[1rem] cursor-pointer relative">
                {" "}
                <MdInsertComment className="h-5 w-5 text-orange-600 " />{" "}
              </span>{" "}
 
            </div>{" "}
          </span>

          <span
            className=""
            title="Complete this Task"
            onClick={() => {
              ctx.handleCompleteStatus(row.original._id);
            }}
          >
            {" "}
            <MdCheckCircle className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />{" "}
          </span>

          <button
            disabled={ctx.anyTimerRunning && ctx.timerId === row.original._id}
            className={`text-[1rem] ${
              ctx.anyTimerRunning && ctx.timerId === row.original._id
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
            type="button"
            onClick={() => ctx.handleDeleteTaskConfirmation(row.original._id)}
            title="Delete this Task!"
          >
            {" "}
            <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600" />{" "}
          </button>

          {hasAddComplainPermission && (
            <button
              title="Create Complaint for this task"
              onClick={() => {
                ctx.createComplaint({
                  defaultEntityType: "task",
                  defaultEntityRef: `T-${row.original.taskRef}`,
                  defaultTask: row.original.task,

                  defaultLead: row.original.lead,
                  defaultAssign: row.original.jobHolder,
                });
              }}
            >
              <MdErrorOutline className="h-5 w-5 text-red-500 hover:text-red-600" />{" "}
            </button>
          )}
        </div>
      );
    },
    size: 160,
  };
};
