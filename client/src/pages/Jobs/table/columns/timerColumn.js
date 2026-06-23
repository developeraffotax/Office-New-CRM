import { useState } from "react";
import { Timer } from "../../../../utlis/Timer";
import { useSelector } from "react-redux";

export const timerColumn = ({
  auth,

  columnFilters,

  currentPath,

  setColumnFilters,
}) => {
  return {
    id: "Timer",
    // accessorKey: "timertracker",
    Header: ({ column }) => {
      const { timer } = useSelector((state) => state.globalTimer);

      // derive from table filters
      const isRunning = columnFilters.some((f) => f.id === "Timer");

      const handleCheckboxChange = () => {
        if (!isRunning) {
          setColumnFilters((old) => [
            ...old.filter((f) => f.id !== "Timer"),
            {
              id: "Timer",
              value: timer?.jobId,
            },
          ]);
        } else {
          setColumnFilters((old) => old.filter((f) => f.id !== "Timer"));
        }
      };

      return (
        <div className="flex flex-col items-center gap-[2px] w-[2rem]">
          <span className="w-full text-center">Timer</span>
            <input
              type="checkbox"
              className="cursor-pointer h-4 w-4  accent-orange-600"
              checked={isRunning}
              onChange={handleCheckboxChange}
            />
 
        </div>
      );
    },
    Cell: ({ cell, row }) => {
      return (
        <div className="flex items-center justify-center gap-1 w-full h-full ">
          <span className="text-[1rem] cursor-pointer  ">
            <Timer
              clientId={auth.user.id}
              jobId={row.original._id}
              taskLink={currentPath}
              pageName={"Jobs"}
              department={row.original?.job?.jobName || ""}
              clientName={row.original?.clientName || ""}
              task={""}
              companyName={row.original?.companyName}
              entityType={"job"}
            />
          </span>
        </div>
      );
    },

    size: 50,
  };
};
