import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useState } from "react";
import TaskDetail from "../../pages/Tasks/TaskDetail";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";

const status = ["To do", "Progress", "Review", "Onhold"];
export default function TaskSummary({ projects, tasksData, userData }) {
  const [active, setActive] = useState("");
  const [projectLength, setProjectLength] = useState([]);
  const [userLength, setUserLength] = useState([]);
  const [statusLength, setStatusLength] = useState([]);
  const [filterTasks, setFilterTasks] = useState([]);
  const [totalHours, setTotalHours] = useState("0");
  const [taskID, setTaskID] = useState("");
  const [projectName, setProjectName] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    project: "",
    jobHolder: "",
    jobStatus: "",
  });

  // console.log("filterTasks:", filterTasks);

  // ---------Total Hours-------->

  useEffect(() => {
    const calculateTotalHours = (data) => {
      return data?.reduce((sum, client) => sum + Number(client.hours), 0);
    };

    setTotalHours(calculateTotalHours(filterTasks).toFixed(0));
  }, [filterTasks, active]);

  //   Filter By Projects
  useEffect(() => {
    const projectCounts = projects?.map((project) => {
      return {
        project: project.projectName,
        count: tasksData.filter((task) => task.project._id === project._id)
          .length,
      };
    });
    setProjectLength(projectCounts);
  }, [tasksData, projects]);

  //   User Length Count
  useEffect(() => {
    const calculateUserJobs = () => {
      if (!userData || !tasksData) return;

      const userJobs = userData.map((user) => {
        const taskCount = tasksData.filter(
          (task) => task.jobHolder === user?.name
        ).length;

        return {
          name: user.name,
          count: taskCount,
        };
      });

      const filteredUsers = userJobs.filter((user) => user.count > 0);

      setUserLength(filteredUsers);
    };

    calculateUserJobs();
  }, [tasksData, userData]);

  //   Status Length
  useEffect(() => {
    const departmentCounts = status?.map((state) => {
      return {
        state,
        count: tasksData.filter((job) => job.status === state).length,
      };
    });
    setStatusLength(departmentCounts);
  }, [tasksData]);

  // Filter Client Based on Active Client or Status
  useEffect(() => {
    const filtered = tasksData.filter((task) => {
      const { project, jobHolder, jobStatus } = selectedFilters;

      return (
        (!project || task.project.projectName === project) &&
        (!jobHolder || task.jobHolder === jobHolder) &&
        (!jobStatus || task.status === jobStatus)
      );
    });

    setFilterTasks(filtered);
  }, [selectedFilters, tasksData]);

  //   Get Status
  const getStatus = (startDate, deadline) => {
    const startDates = new Date(startDate);
    const deadlines = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadlines.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
      return "Overdue";
    } else if (
      startDates.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0) &&
      !(deadlines.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0))
    ) {
      return "Due";
    } else if (deadlines.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
      return "Due";
    } else {
      return "";
    }
  };

  // ----------------------Table Data--------->
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "project.projectName",
        header: "Project",
        minSize: 150,
        maxSize: 200,
        size: 160,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Project
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {projects?.map((proj) => (
                  <option key={proj._id} value={proj.projectName}>
                    {proj?.projectName}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const project = row.original.project.projectName;

          return (
            <div className="w-full h-[2rem] rounded-md bg-transparent border-none outline-none">
              {project}
            </div>
          );
        },
        filterFn: "equals",
        filterVariant: "select",
      },
      {
        accessorKey: "jobHolder",
        header: "Job Holder",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Assign
              </span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const jobholder = cell.getValue();

          return (
            <div className="w-full h-[2rem] rounded-md border-none  outline-none">
              {jobholder}
            </div>
          );
        },
        filterFn: "equals",
        filterVariant: "select",
        size: 100,
        minSize: 80,
        maxSize: 130,
        grow: false,
      },
      // Task
      {
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

          useEffect(() => {
            setAllocateTask(row.original.task);
          }, [row.original]);

          return (
            <div className="w-full h-full ">
              <div
                className="w-full h-full flex items-center justify-start "
                title={allocateTask}
              >
                <p
                  className="text-[#0078c8] hover:text-[#0053c8] cursor-pointer text-start  "
                  onClick={() => {
                    setTaskID(row.original._id);
                    setProjectName(row.original.project.projectName);
                    setShowDetail(true);
                  }}
                >
                  {allocateTask}
                </p>
              </div>
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
      },
      // Hours
      {
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
                {totalHours}
              </span>
            </div>
          );
        },
        Cell: ({ cell, row, data }) => {
          const hours = cell.getValue();
          const [show, setShow] = useState(false);
          const [hour, setHour] = useState(hours);
          const [showId, setShowId] = useState("");

          const updateHours = async (e) => {
            try {
              const { data } = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/hours/${showId}`,
                { hours: hour }
              );
              if (data) {
                setHour("");
                toast.success("Hours Updated!");
              }
            } catch (error) {
              console.log(error);
              toast.error("Error in update hours!");
            }
          };
          return (
            <div className="w-full flex items-center justify-center">
              {show && row.original._id === showId ? (
                <input
                  type="text"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  onBlur={(e) => updateHours(e.target.value)}
                  className="w-full h-[1.7rem] px-[2px] outline-none rounded-md cursor-pointer"
                />
              ) : (
                <span
                  className="text-[15px] font-medium"
                  onDoubleClick={() => {
                    setShowId(row.original._id);
                    setShow(true);
                  }}
                >
                  {hours}
                </span>
              )}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.startsWith(filterValue.toLowerCase());
        },
        size: 70,
        grow: false,
      },
      // Start Date
      {
        accessorKey: "startDate",
        Header: ({ column }) => {
          const [filterValue, setFilterValue] = useState("");
          const [customDate, setCustomDate] = useState(getCurrentMonthYear());

          useEffect(() => {
            if (filterValue === "Custom date") {
              column.setFilterValue(customDate);
            }
            //eslint-disable-next-line
          }, [customDate, filterValue]);

          const handleFilterChange = (e) => {
            setFilterValue(e.target.value);
            column.setFilterValue(e.target.value);
          };

          const handleCustomDateChange = (e) => {
            setCustomDate(e.target.value);
            column.setFilterValue(e.target.value);
          };
          return (
            <div className="w-full flex flex-col gap-[2px]">
              <span
                className="cursor-pointer "
                title="Clear Filter"
                onClick={() => {
                  setFilterValue("");
                  column.setFilterValue("");
                }}
              >
                Start Date
              </span>

              {filterValue === "Custom date" ? (
                <input
                  type="month"
                  value={customDate}
                  onChange={handleCustomDateChange}
                  className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {column.columnDef.filterSelectOptions?.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const startDate = row.original.startDate;
          const [date, setDate] = useState(() => {
            const cellDate = new Date(cell.getValue());
            return cellDate.toISOString().split("T")[0];
          });

          const [showStartDate, setShowStartDate] = useState(false);

          const handleDateChange = (newDate) => {
            const date = new Date(newDate);
            // Check if the date is valid
            if (isNaN(date.getTime())) {
              toast.error("Please enter a valid date.");
              return;
            }

            setDate(newDate);
            // updateAlocateTask(row.original._id, "", date, "");
            setShowStartDate(false);
          };

          return (
            <div className="w-full flex  ">
              {!showStartDate ? (
                <p onDoubleClick={() => setShowStartDate(true)}>
                  {format(new Date(startDate), "dd-MMM-yyyy")}
                </p>
              ) : (
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onBlur={(e) => handleDateChange(e.target.value)}
                  className={`h-[2rem] w-full cursor-pointer rounded-md border border-gray-200 outline-none `}
                />
              )}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          if (!cellValue) return false;

          const cellDate = new Date(cellValue);

          if (filterValue.includes("-")) {
            const [year, month] = filterValue.split("-");
            const cellYear = cellDate.getFullYear().toString();
            const cellMonth = (cellDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");

            return year === cellYear && month === cellMonth;
          }

          // Other filter cases
          const today = new Date();

          const startOfToday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );

          switch (filterValue) {
            case "Expired":
              return cellDate < startOfToday;
            case "Today":
              return cellDate.toDateString() === today.toDateString();
            case "Tomorrow":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              return cellDate.toDateString() === tomorrow.toDateString();
            case "In 7 days":
              const in7Days = new Date(today);
              in7Days.setDate(today.getDate() + 7);
              return cellDate <= in7Days && cellDate > today;
            case "In 15 days":
              const in15Days = new Date(today);
              in15Days.setDate(today.getDate() + 15);
              return cellDate <= in15Days && cellDate > today;
            case "30 Days":
              const in30Days = new Date(today);
              in30Days.setDate(today.getDate() + 30);
              return cellDate <= in30Days && cellDate > today;
            case "60 Days":
              const in60Days = new Date(today);
              in60Days.setDate(today.getDate() + 60);
              return cellDate <= in60Days && cellDate > today;
            case "Last 12 months":
              const lastYear = new Date(today);
              lastYear.setFullYear(today.getFullYear() - 1);
              return cellDate >= lastYear && cellDate <= today;
            default:
              return false;
          }
        },
        filterSelectOptions: [
          "Expired",
          "Today",
          "Tomorrow",
          "In 7 days",
          "In 15 days",
          "30 Days",
          "60 Days",
          "Custom date",
        ],
        filterVariant: "custom",
        size: 100,
        minSize: 90,
        maxSize: 110,
        grow: false,
      },
      // Task DeadLine
      {
        accessorKey: "deadline",
        header: "Deadline",
        Header: ({ column }) => {
          const [filterValue, setFilterValue] = useState("");
          const [customDate, setCustomDate] = useState(getCurrentMonthYear());

          useEffect(() => {
            if (filterValue === "Custom date") {
              column.setFilterValue(customDate);
            }
            //eslint-disable-next-line
          }, [customDate, filterValue]);

          const handleFilterChange = (e) => {
            setFilterValue(e.target.value);
            column.setFilterValue(e.target.value);
          };

          const handleCustomDateChange = (e) => {
            setCustomDate(e.target.value);
            column.setFilterValue(e.target.value);
          };
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className=" w-full cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  setFilterValue("");
                  column.setFilterValue("");
                }}
              >
                Deadline
              </span>
              {filterValue === "Custom date" ? (
                <input
                  type="month"
                  value={customDate}
                  onChange={handleCustomDateChange}
                  className="h-[1.8rem] font-normal   cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="h-[1.8rem]  font-normal cursor-pointer rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {column.columnDef.filterSelectOptions?.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const deadline = row.original.deadline;
          const [date, setDate] = useState(() => {
            const cellDate = new Date(cell.getValue());
            return cellDate.toISOString().split("T")[0];
          });

          const [allocateDate, setAllocateDate] = useState(date);

          useEffect(() => {
            setAllocateDate(date);
          }, [date]);

          const [showDeadline, setShowDeadline] = useState(false);

          const handleDateChange = (newDate) => {
            const date = new Date(newDate);
            // Check if the date is valid
            if (isNaN(date.getTime())) {
              toast.error("Please enter a valid date.");
              return;
            }

            setDate(newDate);
            // updateAlocateTask(row.original._id, "", "", date);
            setShowDeadline(false);
          };

          const cellDate = new Date(date);
          const today = new Date();
          const isExpired = cellDate < today;

          return (
            <div className="w-full ">
              {!showDeadline ? (
                <p onDoubleClick={() => setShowDeadline(true)}>
                  {format(new Date(deadline), "dd-MMM-yyyy")}
                </p>
              ) : (
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onBlur={(e) => handleDateChange(e.target.value)}
                  className={`h-[2rem] w-full cursor-pointer rounded-md border border-gray-200 outline-none ${
                    isExpired ? "text-red-500" : ""
                  }`}
                />
              )}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          if (!cellValue) return false;

          const cellDate = new Date(cellValue);

          if (filterValue.includes("-")) {
            const [year, month] = filterValue.split("-");
            const cellYear = cellDate.getFullYear().toString();
            const cellMonth = (cellDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");

            return year === cellYear && month === cellMonth;
          }

          // Other filter cases
          const today = new Date();
          const startOfToday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );
          switch (filterValue) {
            case "Expired":
              return cellDate < startOfToday;
            case "Today":
              return cellDate.toDateString() === today.toDateString();
            case "Tomorrow":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              return cellDate.toDateString() === tomorrow.toDateString();
            case "In 7 days":
              const in7Days = new Date(today);
              in7Days.setDate(today.getDate() + 7);
              return cellDate <= in7Days && cellDate > today;
            case "In 15 days":
              const in15Days = new Date(today);
              in15Days.setDate(today.getDate() + 15);
              return cellDate <= in15Days && cellDate > today;
            case "30 Days":
              const in30Days = new Date(today);
              in30Days.setDate(today.getDate() + 30);
              return cellDate <= in30Days && cellDate > today;
            case "60 Days":
              const in60Days = new Date(today);
              in60Days.setDate(today.getDate() + 60);
              return cellDate <= in60Days && cellDate > today;
            case "Last 12 months":
              const lastYear = new Date(today);
              lastYear.setFullYear(today.getFullYear() - 1);
              return cellDate >= lastYear && cellDate <= today;
            default:
              return false;
          }
        },
        filterSelectOptions: [
          "Expired",
          "Today",
          "Tomorrow",
          "In 7 days",
          "In 15 days",
          "30 Days",
          "60 Days",
          // "Last 12 months",
          "Custom date",
        ],
        filterVariant: "custom",
        size: 100,
        minSize: 80,
        maxSize: 140,
        grow: false,
      },
      //  -----Due & Over Due Status----->
      {
        accessorKey: "datestatus",
        Header: ({ column }) => {
          const dateStatus = ["Overdue", "Due"];
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer "
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Status
              </span>
              <form className="w-full flex ">
                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] w-full  cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select </option>
                  {dateStatus?.map((status, i) => (
                    <option key={i} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </form>
            </div>
          );
        },
        Cell: ({ row }) => {
          const status = getStatus(
            row.original.startDate,
            row.original.deadline
          );

          return (
            <div className="w-full">
              <span
                className={`text-white text-[14px]  rounded-[2rem] ${
                  status === "Due"
                    ? "bg-green-500  py-[6px] px-4 "
                    : status === "Overdue"
                    ? "bg-red-500  py-[6px] px-3 "
                    : "bg-transparent"
                }`}
              >
                {status}
              </span>
            </div>
          );
        },
        filterFn: (row, id, filterValue) => {
          const status = getStatus(
            row.original.startDate,
            row.original.deadline
          );
          if (status === undefined || status === null) return false;
          return status.toString().toLowerCase() === filterValue.toLowerCase();
        },
        filterSelectOptions: ["Overdue", "Due"],
        filterVariant: "select",
        size: 100,
        minSize: 90,
        maxSize: 110,
        grow: false,
      },
      //
      {
        accessorKey: "status",
        header: "Task Status",
        Header: ({ column }) => {
          const statusData = ["To do", "Progress", "Review", "On hold"];

          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className=" text-center cursor-pointer"
                title="Clear Filter "
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Task Status
              </span>
              <div className="flex ">
                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="ml-1 font-normal w-full  h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {statusData?.map((status, i) => (
                    <option key={i} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const statusValue = cell.getValue();

          return (
            <div className="flex items-center justify-center w-full">
              {statusValue}
            </div>
          );
        },
        // filterFn: "equals",
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue(columnId);
          return (cellValue || "").toString() === filterValue.toString();
        },
        filterSelectOptions: [
          "Select",
          "To do",
          "Progress",
          "Review",
          "On hold",
        ],
        filterVariant: "select",
        minSize: 90,
        size: 100,
        maxSize: 140,
        grow: false,
      },
      {
        accessorKey: "lead",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px] ml-1">
              <span
                className="ml-1 cursor-pointer "
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Owner
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className=" font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {userLength?.map((lead, i) => (
                  <option key={i} value={lead?.name}>
                    {lead?.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const leadValue = cell.getValue();

          return (
            <div className="flex items-center justify-center w-full">
              {leadValue}
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: userLength?.map((lead) => lead.name),
        filterVariant: "select",
        size: 100,
        minSize: 60,
        maxSize: 120,
        grow: false,
      },
      {
        accessorKey: "estimate_Time",
        header: "Budget",
        Cell: ({ cell, row }) => {
          const estimateTime = cell.getValue();
          return (
            <div className="flex items-center gap-1">
              <span className="text-[1rem]">⏳</span>
              <span>{estimateTime}</span>
            </div>
          );
        },
        size: 80,
      },
      // Label
      //   {
      //     accessorKey: "labal",

      //     Header: ({ column }) => {
      //       return (
      //         <div className="flex flex-col gap-[2px]">
      //           <span
      //             className="ml-1 cursor-pointer"
      //             title="Clear Filter"
      //             onClick={() => {
      //               column.setFilterValue("");
      //             }}
      //           >
      //             Labels
      //           </span>
      //           <select
      //             value={column.getFilterValue() || ""}
      //             onChange={(e) => column.setFilterValue(e.target.value)}
      //             className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
      //           >
      //             <option value="">Select</option>
      //             {labelData?.map((label, i) => (
      //               <option key={i} value={label?.name}>
      //                 {label?.name}
      //               </option>
      //             ))}
      //           </select>
      //         </div>
      //       );
      //     },

      //     Cell: ({ cell, row }) => {
      //       const [show, setShow] = useState(false);
      //       const jobLabel = row.original.labal || {};
      //       const { name, color } = jobLabel;

      //       const handleLabelChange = (labelName) => {
      //         const selectedLabel = labelData.find(
      //           (label) => label.name === labelName
      //         );
      //         if (selectedLabel) {
      //           addlabelTask(row.original._id, labelName, selectedLabel?.color);
      //         } else {
      //           addlabelTask(row.original._id, "", "");
      //         }
      //         setShow(false);
      //       };

      //       return (
      //         <div className="w-full flex items-center justify-center">
      //           {show ? (
      //             <select
      //               value={name || ""}
      //               onChange={(e) => handleLabelChange(e.target.value)}
      //               className="w-full h-[2rem] rounded-md border-none outline-none"
      //             >
      //               <option value="clear">Select Label</option>
      //               {labelData?.map((label, i) => (
      //                 <option value={label?.name} key={i}>
      //                   {label?.name}
      //                 </option>
      //               ))}
      //             </select>
      //           ) : (
      //             <div
      //               className="cursor-pointer h-full min-w-full "
      //               onDoubleClick={() => setShow(true)}
      //             >
      //               {name ? (
      //                 <span
      //                   className={`label relative py-[4px] px-2 rounded-md hover:shadow  cursor-pointer text-white`}
      //                   style={{ background: `${color}` }}
      //                 >
      //                   {name}
      //                 </span>
      //               ) : (
      //                 <span
      //                   className={`label relative py-[4px] px-2 rounded-md hover:shadow  cursor-pointer text-white`}
      //                 >
      //                   .
      //                 </span>
      //               )}
      //             </div>
      //           )}
      //         </div>
      //       );
      //     },

      //     filterFn: (row, columnId, filterValue) => {
      //       const labelName = row.original?.labal?.name || "";
      //       return labelName === filterValue;
      //     },

      //     filterVariant: "select",
      //     filterSelectOptions: labelData?.map((label) => label.name),
      //     size: 140,
      //     minSize: 100,
      //     maxSize: 210,
      //     grow: false,
      //   },
      // Recurring
      {
        accessorKey: "recurring",
        Header: ({ column }) => {
          const recurringData = ["daily", "weekly", "monthly", "quarterly"];
          return (
            <div className=" flex flex-col items-center justify-center  w-full pr-2  gap-[2px]">
              <span
                className="cursor-pointer w-full text-center"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Recurring
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal w-full h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {recurringData?.map((recurr, i) => (
                  <option key={i} value={recurr} className="capitalize">
                    {recurr}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row, data }) => {
          const recurring = row.original.recurring;

          return (
            <div className="w-full flex items-center justify-center">
              <span
                className={`text-[15px] font-medium capitalize py-1 px-2 rounded-md  ${
                  recurring === "daily"
                    ? "bg-orange-600 text-white"
                    : recurring === "weekly"
                    ? "bg-green-600 text-white"
                    : recurring === "monthly"
                    ? "bg-sky-600 text-white"
                    : recurring === "quarterly"
                    ? "bg-pink-600 text-white"
                    : ""
                } `}
              >
                {recurring}
              </span>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.startsWith(filterValue.toLowerCase());
        },
        size: 100,
        grow: false,
      },
    ],
    // eslint-disable-next-line
    [filterTasks, userData, active, tasksData]
  );

  const table = useMaterialReactTable({
    columns,
    data: filterTasks,
    getRowId: (row) => row._id,
    enableStickyHeader: true,
    enableStickyFooter: true,
    // columnFilterDisplayMode: "popover",
    muiTableContainerProps: { sx: { maxHeight: "860px" } },
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableGlobalFilter: true,
    enableRowNumbers: true,
    enableColumnResizing: true,
    enableTopToolbar: true,
    enableBottomToolbar: true,
    enableRowSelection: false,
    enablePagination: true,
    initialState: {
      pagination: { pageSize: 20 },
      pageSize: 20,
      density: "compact",
    },

    muiTableHeadCellProps: {
      style: {
        fontWeight: "600",
        fontSize: "14px",
        backgroundColor: "rgb(193, 183, 173, 0.8)",
        color: "#000",
        padding: ".7rem 0.3rem",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        border: "1px solid rgba(203, 201, 201, 0.5)",
      },
    },
    muiTableProps: {
      sx: {
        "& .MuiTableHead-root": {
          backgroundColor: "#f0f0f0",
        },
        tableLayout: "auto",
        fontSize: "13px",
        // border: "1px solid rgba(81, 81, 81, .5)",
        caption: {
          captionSide: "top",
        },
      },
    },
  });

  return (
    <div className="relative w-full h-full flex flex-col gap-4">
      {/* Filter By Projects */}
      <div className="flex flex-col gap-2">
        <div className="w-full flex flex-col gap-4 px-2 sm:px-4 py-2 border border-green-500 rounded-lg hover:shadow-lg shadow-gray-300 bg-gradient-to-r from-green-100 to-green-50">
          <div className="flex items-center overflow-auto hidden1 gap-4 px-4 ">
            {projectLength.map((p) => (
              <div
                key={p.project}
                className={`flex flex-col min-w-[8rem] w-full items-center justify-center gap-2 px-2 sm:px-4 py-2 border rounded-md cursor-pointer transition-all transform ${
                  p.project === active
                    ? "bg-orange-100 border-orange-300  shadow-sm"
                    : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md"
                }`}
                onClick={() => {
                  setActive(p.project);
                  setSelectedFilters((prev) => ({
                    ...prev,
                    project: p.project,
                    jobHolder: "",
                    jobStatus: "",
                  }));
                }}
              >
                <span
                  className={`text-xl font-bold ${
                    p.project === active ? "text-orange-600" : "text-gray-700"
                  }`}
                >
                  {p.count}
                </span>
                <span className="text-sm text-gray-600">{p.project}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* User Length */}
      <div className="w-full flex flex-col gap-4 px-2 sm:px-4 py-2 border border-yellow-500 rounded-lg hover:shadow-lg shadow-gray-300 bg-gradient-to-r from-yellow-100 to-yellow-100">
        <div className="flex items-center overflow-auto hidden1 gap-4 px-4">
          {userLength?.map((user) => (
            <div
              key={user.name}
              className={`flex flex-col items-center justify-center min-w-[8rem] w-full   gap-2 px-2 sm:px-4 py-2 border rounded-md cursor-pointer transition-all transform ${
                user.name === active
                  ? "bg-orange-100 border-orange-300 shadow-sm"
                  : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md"
              }`}
              onClick={() => {
                setActive(user.name);
                setSelectedFilters((prev) => ({
                  ...prev,
                  project: "",
                  jobHolder: user.name,
                  jobStatus: "",
                }));
              }}
            >
              <span
                className={`text-xl font-bold ${
                  user?.name === active ? "text-orange-600" : "text-gray-700"
                }`}
              >
                {user?.count}
              </span>
              <span className="text-sm text-gray-600">{user?.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status length */}
      <div className="w-full flex flex-col gap-4 px-2 sm:px-4 py-2 border border-purple-500 rounded-lg hover:shadow-lg shadow-gray-300 bg-gradient-to-r from-purple-100 to-purple-100">
        <div className="grid grid-cols-2 sm:grid-cols-4  gap-4 px-4 w-full">
          {statusLength.map((s) => (
            <div
              key={s?.state}
              className={`flex flex-col items-center justify-center gap-2 px-2 sm:px-4 py-2 border rounded-md cursor-pointer transition-all transform ${
                s?.state === active
                  ? "bg-orange-100 border-orange-300 scale-105 shadow-sm"
                  : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md"
              }`}
              onClick={() => {
                setActive(s?.state);
                setSelectedFilters((prev) => ({
                  ...prev,
                  jobStatus: s?.state,
                  project: "",
                  jobHolder: "",
                }));
              }}
            >
              <span
                className={`text-xl font-bold ${
                  s.state === active ? "text-orange-600" : "text-gray-700"
                }`}
              >
                {s?.count}
              </span>
              <span className="text-sm text-gray-600">{s?.state}</span>
            </div>
          ))}
        </div>
      </div>

      {active ? (
        <div className="w-full min-h-[20vh] relative border-t border-gray-300">
          <div className="h-full hidden1 overflow-y-scroll relative">
            <MaterialReactTable table={table} />
          </div>
        </div>
      ) : (
        <div className="w-full min-h-[40vh] relative border-t border-gray-300 flex items-center justify-center ">
          <div className="flex flex-col gap-0">
            <img
              src="/rb_695.png"
              alt="empty"
              className="w-[16rem] h-[16rem]"
            />
            <span className="text-sm text-gray-700 -mt-9 text-center ">
              Select a client to view the job details
            </span>
          </div>
        </div>
      )}

      {/* ------------Task detail--------- */}

      {showDetail && (
        <div className="fixed right-0 top-[3.8rem] z-[999] bg-gray-100 w-[33%] 3xl:w-[22%]  h-[calc(103vh-0rem)] py-3 px-3 ">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{projectName}</h3>
            <span
              className="p-1 rounded-md bg-gray-50 border  hover:shadow-md hover:bg-gray-100"
              onClick={() => setShowDetail(false)}
            >
              <IoClose className="h-5 w-5 cursor-pointer" />
            </span>
          </div>
          <TaskDetail
            taskId={taskID}
            getAllTasks={""}
            handleDeleteTask={"handleDeleteTask"}
            setTasksData={"setTasksData"}
            setShowDetail={setShowDetail}
            users={userData}
            projects={projects}
          />
        </div>
      )}
    </div>
  );
}
