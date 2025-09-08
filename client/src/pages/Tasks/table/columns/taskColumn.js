import { useEffect, useState } from "react";
import AssignmentIcon from '@mui/icons-material/Assignment';

import Subtasks from "../../Subtasks";

export const taskColumn = (ctx) => {


    return     {
          accessorKey: "task",
          header: "Tasks",
          Header: ({ column }) => {
            return (
              <div className=" w-[380px] flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Tasks
                </span>
                <input
                  type="search"
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                />
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const task = row.original.task;
            const [allocateTask, setAllocateTask] = useState(task);
            const [showEdit, setShowEdit] = useState(false);
    
            const [showSubtasks, setShowSubtasks] = useState(false);
            const [showSubtaskId, setShowSubtaskId] = useState("");
    
            const handleShowSubtasks = () => {
              console.log("row.original._id:", row.original._id);
              console.log("showSubtaskId:", showSubtaskId);
    
              if (showSubtaskId === row.original._id) {
                console.log("hide");
                setShowSubtaskId("");
              } else {
                setShowSubtaskId(row.original._id);
              }
            };
    
            useEffect(() => {
              setAllocateTask(row.original.task);
            }, [row.original]);
    
            const updateAllocateTask = (task) => {
              ctx.updateAlocateTask(row.original._id, allocateTask, "", "");
              setShowEdit(false);
            };
            return (
              <div className="w-full flex items-start justify-start gap-1 flex-col ">
                <div className="w-full   flex items-start justify-between gap-2 flex-row ">
                  {showEdit ? (
                    <input
                      type="text"
                      placeholder="Enter Task..."
                      value={allocateTask}
                      onChange={(e) => setAllocateTask(e.target.value)}
                      onBlur={(e) => updateAllocateTask(e.target.value)}
                      className="w-full h-[2rem] focus:border border-gray-300 px-1 outline-none rounded-lg"
                    />
                  ) : (
                    <div
                      className=" w-full h-full cursor-pointer text-wrap "
                      onDoubleClick={() => setShowEdit(true)}
                      title={allocateTask}
                    >
                      <p
                        className="text-[#0078c8] hover:text-[#0053c8] text-start inline  "
                        onDoubleClick={() => setShowEdit(true)}
                        onClick={() => {
                          ctx.setTaskID(row.original._id);
                          ctx.setProjectName(row.original.project.projectName);
                          ctx.setShowDetail(true);
                        }}
                      >
                        {allocateTask}
                      </p>
                    </div>
                  )}
    
                  <div className=" ">
                    <span
                      className={`${
                        showSubtaskId === row.original._id
                          ? "text-orange-500 "
                          : row.original?.subtasksLength > 0
                          ? "text-blue-400"
                          : "text-gray-500"
                      } cursor-pointer hover:text-orange-500 transition-all `}
                      onClick={() => {
                        ctx.setTaskID(row.original._id);
                        ctx.setProjectName(row.original.project.projectName);
                        handleShowSubtasks();
                      }}
                    >
                      <AssignmentIcon />
                    </span>
                  </div>
                </div>
    
                {showSubtaskId === row.original._id && (
                  <div
                    className={`  w-full h-full bg-gradient-to-br from-orange-200  rounded-lg shadow-md text-black `}
                  >
                    <Subtasks taskId={showSubtaskId} />
                  </div>
                )}
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            const cellValue =
              row.original[columnId]?.toString().toLowerCase() || "";
    
            return cellValue.includes(filterValue.toLowerCase());
          },
          size: 390,
          minSize: 200,
          maxSize: 400,
          grow: true,
        }
}