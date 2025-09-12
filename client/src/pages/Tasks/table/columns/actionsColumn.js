import { useEffect, useState } from "react";
import { AiTwotoneDelete } from "react-icons/ai";
import { GrCopy } from "react-icons/gr";
import { MdCheckCircle, MdInsertComment } from "react-icons/md";

export const actionsColumn = (ctx) => {
  return {
    accessorKey: "actions",
    header: "Actions",
    Cell: ({ cell, row }) => {
      const comments = row.original.comments;
      const [unreadComments, setUnreadComments] = useState([]);

      useEffect(() => {
        const filterComments = comments.filter(
          (item) => item.status === "unread"
        );
        setUnreadComments(filterComments);
      }, [comments]);

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
              {/* {unreadComments?.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-sky-600 rounded-full w-[20px] h-[20px] text-[12px] text-white flex items-center justify-center ">
                  {" "}
                  {unreadComments?.length}{" "}
                </span>
              )}{" "} */}
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
        </div>
      );
    },
    size: 140,
  };
};
