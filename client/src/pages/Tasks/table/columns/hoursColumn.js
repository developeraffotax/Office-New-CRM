import axios from "axios";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import TimeEditor from "../../../../utlis/TimeSelector";

export const hoursColumn = (ctx) => {


    return     {
      accessorKey: "hours",

      Header: ({ column }) => {
        return (
          <div className=" flex flex-col items-center justify-center  w-[4rem] pr-2  gap-[2px]">
            <span
              className="cursor-pointer w-full text-center"
              title="Clear Filter"
              onClick={() => {
                column.setFilterValue("");
              }}
            >
              Hrs
            </span>
            <span className="font-medium w-full text-center px-1 py-1 ml-1 rounded-md bg-gray-50 text-black">
              {ctx.totalHours}
            </span>
          </div>
        );
      },
      Cell: ({ cell, row }) => {
        const [showEditor, setShowEditor] = useState(false);
        const [value, setValue] = useState(cell.getValue());
        const anchorRef = useRef(null);

        // const formatDuration = (val) => {
        //   const h = Math.floor(val);
        //   const m = Math.round((val % 1) * 60);
        //   return `${h}h${m > 0 ? ` ${m}m` : ""}`;
        // };

        const formatDuration = (val) => {
          const h = Math.floor(val);
          const m = Math.round((val % 1) * 60);

          if (h > 0 && m > 0) return `${h}h ${m}m`;
          if (h > 0) return `${h}h`;
          if (m > 0) return `${m}m`;
          return "0m";
        };

        const handleApply = async (newHours) => {
          try {
            const { data } = await axios.put(
              `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/hours/${row.original._id}`,
              { hours: newHours }
            );
            if (data) {
              // const savedTaskTimer =JSON.parse(localStorage.getItem("task-timer"));
              // if (savedTaskTimer && savedTaskTimer.taskId === row.original._id) {
              //    dispatch(updateCountdown(newHours))
              // }

              setValue(newHours);
              toast.success("Hours updated");
              if (ctx.filterId || ctx.active || ctx.active1) {
                ctx.setFilterData((prevData) =>
                  Array.isArray(prevData)
                    ? prevData.map((item) =>
                        item._id === data?.task?._id
                          ? { ...item, hours: newHours }
                          : item
                      )
                    : []
                );
              }
              ctx.setTasksData((prevData) =>
                Array.isArray(prevData)
                  ? prevData.map((item) =>
                      item._id === data?.task?._id
                        ? { ...item, hours: newHours }
                        : item
                    )
                  : []
              );
            }
          } catch (err) {
            toast.error("Update failed");
            console.error(err);
          }
        };

        return (
          <div ref={anchorRef} className="relative flex items-center gap-1">
            <span onDoubleClick={() => setShowEditor(true)}>
              {formatDuration(value)}
            </span>
            
            {showEditor && (
              <TimeEditor
                anchorRef={anchorRef}
                initialValue={value}
                onApply={handleApply}
                onClose={() => setShowEditor(false)}
              />
            )}
          </div>
        );
      },

      size: 70,
    }
}