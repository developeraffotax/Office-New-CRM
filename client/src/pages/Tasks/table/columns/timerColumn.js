import { useState } from "react";
import { Timer } from "../../../../utlis/Timer";

export const timerColumn = (ctx) => {


    return     {
      accessorKey: "timertracker",
      header: "Timer",
      Header: ({ column }) => {
        const [isRunning, setIsRunning] = useState(false);

        const handleCheckboxChange = () => {
          const newIsRunning = !isRunning;
          setIsRunning(newIsRunning);

          if (newIsRunning) {
            column.setFilterValue(ctx.timerId || ctx.jid);
          } else {
            column.setFilterValue(undefined);
          }
          ctx.setReload((prev) => !prev);
        };
        return (
          <div className=" flex flex-col gap-[2px] w-[5rem]">
            <span className="ml-1 cursor-pointer w-full text-center">
              Timer
            </span>
            <div className="w-full flex items-center justify-center">
              <input
                type="checkbox"
                className="cursor-pointer h-5 w-5 ml-3 accent-orange-600 "
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
              />
            </span>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.original._id;

        return cellValue === filterValue;
      },
      filterVariant: "select",
      size: 90,
    }
}