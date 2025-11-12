import { useState } from "react";
import { Timer } from "../../../../utlis/Timer";

export const timerColumn = ({auth, timerRef, timerId ,jid, play, setPlay, setIsShow, note, currentPath, setNote, activity, setActivity, setIsNonChargeable}) => {


    return         {
          id: "Timer",
          accessorKey: "timertracker",
          Header: ({ column }) => {
            const [isRunning, setIsRunning] = useState(false);

            const handleCheckboxChange = () => {
              const newIsRunning = !isRunning;
              setIsRunning(newIsRunning);

              if (newIsRunning) {
                column.setFilterValue(timerId || jid);
              } else {
                column.setFilterValue(undefined);
              }
            };
            return (
              <div className=" flex flex-col gap-[2px]  ml w-[5rem]">
                <span className="w-full text-center ">Timer</span>
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
            // const statusValue = cell.getValue();
            // console.log("row", row.original, row.original.job.jobName);

            return (
              <div
                className="flex items-center justify-center gap-1 w-full h-full "
                onClick={() => setPlay(!play)}
              >
                <span className="text-[1rem] cursor-pointer  ">
                  <Timer
                    ref={timerRef}
                    clientId={auth.user.id}
                    jobId={row.original._id}
                    setIsShow={setIsShow}
                    reload={true}
                    note={note}
                    taskLink={currentPath}
                    pageName={"Jobs"}
                    taskName={row.original.companyName}
                    setNote={setNote}
                    department={row.original.job.jobName}
                    clientName={row.original.clientName}
                    JobHolderName={row.original.job.jobHolder}
                    projectName={""}
                    task={""}
                    companyName={row.original.companyName}
                    activity={activity}
                    setActivity={setActivity}

                    setIsNonChargeable={setIsNonChargeable}
                   
                  />
                </span>
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            const cellValue = row.original._id;
            // console.log("T_ID:", filterValue, cellValue);
            return cellValue === filterValue;
          },
          filterVariant: "select",
          size: 90,
        }
}