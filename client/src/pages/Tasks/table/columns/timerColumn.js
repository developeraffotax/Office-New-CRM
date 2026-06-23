import { useState } from "react";
import { Timer } from "../../../../utlis/Timer";
import { useSelector } from "react-redux";

export const timerColumn = (ctx) => {


    return     {
      accessorKey: "timertracker",
      header: "Timer",
      Header: ({ column }) => {
        const { timer } = useSelector((state) => state.globalTimer);

      // derive from table filters
      const isRunning = ctx?.columnFilters.some((f) => f.id === "Timer");

      const handleCheckboxChange = () => {
        if (!isRunning) {
          ctx?.setColumnFilters((old) => [
            ...old.filter((f) => f.id !== "Timer"),
            {
              id: "Timer",
              value: timer?.jobId,
            },
          ]);
        } else {
          ctx?.setColumnFilters((old) => old.filter((f) => f.id !== "Timer"));
        }
      };
        return (
           <div className="flex flex-col  items-center gap-[2px] w-[2rem]">
          <span className="w-full text-center">Timer</span>

            <input
              type="checkbox"
              className="cursor-pointer h-4 w-4   accent-orange-600"
              checked={isRunning}
              onChange={handleCheckboxChange}
            />
           
        </div>
        );
      },

      Cell: ({ cell, row }) => {
        return (
          <div
            className="flex items-center justify-center gap-1 w-full h-full "
            onClick={() => ctx.setPlay(!ctx.play)}
          >
            <span className="text-[1rem] cursor-pointer  ">
              <Timer
                ref={ctx.timerRef}
                clientId={ctx.auth?.user?.id}
                jobId={row?.original?._id}
                setIsShow={ctx.setIsShow}
                reload={ctx.reload}
                note={ctx.note}
                taskLink={ctx.currentPath}
                pageName={"Tasks"}
                taskName={row.original.project.projectName}
                setNote={ctx.setNote}
                department={row.original.project.projectName}
                clientName={row.original.project.projectName}
                companyName={row.original.project.projectName}
                JobHolderName={row.original.jobHolder}
                projectName={""}
                task={row.original.task}
                activity={ctx.activity}
                setActivity={ctx.setActivity}
                allocatedTime={row.original.hours}
                setTaskIdForNote={ctx.setTaskIdForNote}
                taskIdForNote={ctx.taskIdForNote}
                setIsSubmitting={ctx.setIsSubmitting}
                stateSetter={ctx.setTasksData}
                entityType={"task"}
              />
            </span>
          </div>
        );
      },
      // filterFn: (row, columnId, filterValue) => {
      //   const cellValue = row.original._id;

      //   return cellValue === filterValue;
      // },
 
      size: 50,
    }
}