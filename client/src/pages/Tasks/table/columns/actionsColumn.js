import { useEffect } from "react";
import { AiTwotoneDelete } from "react-icons/ai";
import { GrCopy } from "react-icons/gr";
import { MdCheckCircle } from "react-icons/md";

export const actionsColumn = (ctx) => {


    return       {
      accessorKey: "actions",
      header: "Actions",
      Cell: ({ cell, row }) => {
        return (
          <div className="flex items-center justify-center gap-3 w-full h-full">
            <span
              className="text-[1rem] cursor-pointer"
              onClick={() => ctx.copyTask(row.original)}
              title="Copy this task"
            >
              <GrCopy className="h-5 w-5 text-cyan-600 " />
            </span>

            <span
              className=""
              title="Complete Task"
              onClick={() => {
                ctx.handleCompleteStatus(row.original._id);
              }}
            >
              <MdCheckCircle className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
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
              title="Delete Task!"
            >
              <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600" />
            </button>
          </div>
        );
      },
      size: 130,
    }
}