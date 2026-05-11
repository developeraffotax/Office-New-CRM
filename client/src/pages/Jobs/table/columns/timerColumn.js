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
        <div className="flex flex-col gap-[2px] w-[5rem]">
          <span className="w-full text-center">Timer</span>

          <div className="w-full flex items-center justify-center">
            <input
              type="checkbox"
              className="cursor-pointer h-5 w-5 ml-3 accent-orange-600"
              checked={isRunning}
              onChange={handleCheckboxChange}
            />

            <label className="ml-2 text-sm cursor-pointer"></label>
          </div>
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

    size: 90,
  };
};
