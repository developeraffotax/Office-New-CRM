import React, { useEffect, useMemo, useRef, useState } from "react";
import { style } from "../../utlis/CommonStyle";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { MdCheckCircle, MdInsertComment } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import { GrCopy } from "react-icons/gr";

import socketIO from "socket.io-client";
import { useAuth } from "../../context/authContext";
import { Timer } from "../../utlis/Timer";
import CompletedTasks from "../../pages/Tasks/CompletedTasks";
import AddLabel from "../Modals/AddLabel";
import AddProjectModal from "../Tasks/AddProjectModal";
import AddTaskModal from "../Tasks/AddTaskModal";
import JobCommentModal from "../../pages/Jobs/JobCommentModal";
import Loader from "../../utlis/Loader";
import TaskDetail from "../../pages/Tasks/TaskDetail";
const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

const Tasks = ({ tasksData, loading, projects, setTasksData }) => {
  const { auth, filterId, anyTimerRunning } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [openAddProject, setOpenAddProject] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [showProject, setShowProject] = useState(false);
  const [active, setActive] = useState("All");
  const [showCompleted, setShowCompleted] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [note, setNote] = useState("");
  // Timer
  const [play, setPlay] = useState(false);
  const timerRef = useRef();
  const [isShow, setIsShow] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  // Filters
  const [active1, setActive1] = useState("");
  const [filterData, setFilterData] = useState([]);
  const [isComment, setIsComment] = useState(false);
  const [commentTaskId, setCommentTaskId] = useState("");
  const [userName, setUserName] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [taskID, setTaskID] = useState("");
  const [projectName, setProjectName] = useState("");
  const [totalHours, setTotalHours] = useState("0");
  const [allProjects, setAllProjects] = useState(projects);
  const [labelData, setLabelData] = useState([]);
  const commentStatusRef = useRef(null);
  const [showlabel, setShowlabel] = useState(false);
  const [timerId, setTimerId] = useState("");
  const closeProject = useRef(null);
  const [activity, setActivity] = useState("Chargeable");
  const [access, setAccess] = useState([]);

  console.log("filterData", filterData);

  console.log("tasksData:", tasksData);

  useEffect(() => {
    const timeId = localStorage.getItem("jobId");
    setTimerId(JSON.parse(timeId));
  }, [anyTimerRunning]);

  // Get Auth Access
  useEffect(() => {
    if (auth.user) {
      const filterAccess = auth.user.role.access
        .filter((role) => role.permission === "Tasks")
        .flatMap((jobRole) => jobRole.subRoles);

      setAccess(filterAccess);
    }
  }, [auth]);

  const getAllTasks = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/all`
      );

      setTasksData(data?.tasks);
    } catch (error) {
      console.log(error);
    }
  };

  //   Get All Labels
  const getlabel = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/label/get/labels/task`
      );
      if (data.success) {
        setLabelData(data.labels);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getlabel();
  }, []);

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(
        data?.users?.filter((user) =>
          user?.role?.access?.some((item) =>
            item?.permission?.includes("Tasks")
          )
        ) || []
      );

      setUserName(
        data?.users
          ?.filter((user) =>
            user?.role?.access?.map((item) => item.permission.includes("Tasks"))
          )
          ?.map((user) => user.name)
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  // ------------------------------Tasks----------------->

  // ---------Total Hours-------->

  useEffect(() => {
    const calculateTotalHours = (data) => {
      return data.reduce((sum, client) => sum + Number(client.hours), 0);
    };

    setTotalHours(calculateTotalHours(filterData).toFixed(0));
  }, [tasksData, filterData]);

  // -----------Update Task-Project-------->
  const updateTaskProject = async (taskId, projectId) => {
    if (!taskId || !projectId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/project/${taskId}`,
        { projectId: projectId }
      );
      if (data?.success) {
        const updateTask = data?.task;
        toast.success("Project updated!");
        getAllTasks();

        if (active !== "All") {
          setFilterData((prevData) =>
            prevData?.map((item) =>
              item._id === updateTask._id ? updateTask : item
            )
          );
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // -----------Update Job Holder, Lead, Status------->

  const updateTaskJLS = async (taskId, jobHolder, lead, status) => {
    if (!taskId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/task/JLS/${taskId}`,
        { jobHolder, lead, status }
      );
      if (data) {
        getAllTasks();

        const updateTask = data?.task;
        toast.success("Task updated successfully!");

        if (filterId || active || active1) {
          setFilterData((prevData) => {
            if (Array?.isArray(prevData)) {
              return prevData?.map((item) =>
                item?._id === updateTask?._id ? updateTask : item
              );
            } else {
              return [updateTask];
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  // -----------Update Alocate Task-------->
  const updateAlocateTask = async (
    taskId,
    allocateTask,
    startDate,
    deadline
  ) => {
    if (!taskId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/allocate/task/${taskId}`,
        { allocateTask, startDate, deadline }
      );
      if (data?.success) {
        const updateTask = data?.task;
        toast.success("Task updated successfully!");

        if (filterData) {
          getAllTasks();
          setFilterData((prevData) =>
            prevData?.map((item) =>
              item?._id === updateTask?._id ? updateTask : item
            )
          );
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // -----------Handle Custom date filter------
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

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

  // Filter by Header Search
  // useEffect(() => {
  //   const filteredData = searchValue
  //     ? tasksData.filter(
  //         (item) =>
  //           item?.task.toLowerCase().includes(searchValue.toLowerCase()) ||
  //           item?.jobHolder.toLowerCase().includes(searchValue.toLowerCase())
  //       )
  //     : tasksData;

  //   if (filteredData !== filterData) {
  //     setFilterData(filteredData);
  //   }

  //   // eslint-disable-next-line
  // }, [searchValue, tasksData]);

  // -----------Copy Task------->

  const copyTask = async (originalTask) => {
    const taskCopy = { ...originalTask };
    taskCopy.task = "";
    console.log("taskCopy", taskCopy);

    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/v1/tasks/create/task`,
      {
        projectId: taskCopy?.project._id,
        jobHolder: taskCopy?.jobHolder,
        task: taskCopy?.task,
        hours: taskCopy?.hours,
        startDate: taskCopy?.startDate,
        deadline: taskCopy?.deadline,
        lead: taskCopy?.lead,
        label: taskCopy?.label,
        status: "Progress",
      }
    );
    if (data) {
      // Send Socket Timer
      getAllTasks();
      socketId.emit("addTask", {
        note: "New Task Added",
      });
    }
  };

  // ---------Stop Timer ----------->
  const handleStopTimer = () => {
    if (timerRef.current) {
      timerRef.current.stopTimer();
    }
  };

  // ---------Handle Delete Task-------------

  const handleDeleteTaskConfirmation = (taskId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteTask(taskId);
        Swal.fire("Deleted!", "Your task has been deleted.", "success");
      }
    });
  };

  const handleDeleteTask = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/delete/task/${id}`
      );
      if (data) {
        getAllTasks();
        setShowDetail(false);
        toast.success("Task deleted successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // Close Comment Box to click anywhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        commentStatusRef.current &&
        !commentStatusRef.current.contains(event.target)
      ) {
        setIsComment(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add label in Task
  const addlabelTask = async (id, name, color) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/add/label/${id}`,
        { name, color }
      );
      if (data) {
        getAllTasks();
        if (filterData) {
          setFilterData((prevData = []) =>
            prevData?.map((item) =>
              item._id === id ? { ...item, label: { name, color } } : item
            )
          );
        }

        if (name) {
          toast.success("label added!");
        } else {
          toast.success("label Updated!");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Error while add label");
    }
  };

  // Update Job Status(Completed)
  const handleStatusComplete = async (taskId) => {
    if (!taskId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/task/JLS/${taskId}`,
        { status: "completed" }
      );
      if (data?.success) {
        getAllTasks();
        const updateTask = data?.task;
        setShowDetail(false);
        toast.success("Status completed successfully!");

        setFilterData((prevData) =>
          prevData.filter((item) => item._id !== updateTask._id)
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const handleCompleteStatus = (taskId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this job!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, complete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleStatusComplete(taskId);
        Swal.fire("Updated!", "Your task completed successfully!.", "success");
      }
    });
  };

  // ----------------------Table Data--------->

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
                {allProjects?.map((proj) => (
                  <option key={proj._id} value={proj.projectName}>
                    {proj.projectName}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const projectId = row.original.project._id;

          return (
            <select
              value={projectId}
              onChange={(e) => {
                const selectedProjectId = e.target.value;
                updateTaskProject(row.original._id, selectedProjectId);
              }}
              className="w-full h-[2rem] rounded-md bg-transparent border-none outline-none"
            >
              <option value="">Select</option>
              {allProjects &&
                allProjects?.map((proj) => (
                  <option value={proj._id} key={proj._id}>
                    {proj?.projectName}
                  </option>
                ))}
            </select>
          );
        },
        filterFn: "equals",
        filterSelectOptions: allProjects?.map(
          (project) => project?.projectName
        ),
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
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {users?.map((jobhold, i) => (
                  <option key={i} value={jobhold?.name}>
                    {jobhold?.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const jobholder = cell.getValue();

          return (
            <select
              value={jobholder || ""}
              className="w-full h-[2rem] rounded-md border-none  outline-none"
              onChange={(e) =>
                updateTaskJLS(row.original?._id, e.target.value, "", "")
              }
            >
              <option value="empty"></option>
              {users?.map((jobHold, i) => (
                <option value={jobHold?.name} key={i}>
                  {jobHold.name}
                </option>
              ))}
            </select>
          );
        },
        filterFn: "equals",
        filterSelectOptions: users?.map((jobhold) => jobhold.name),
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
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-white rounded-md border border-gray-300 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const task = row.original.task;
          const [allocateTask, setAllocateTask] = useState(task);
          const [showEdit, setShowEdit] = useState(false);

          useEffect(() => {
            setAllocateTask(row.original.task);
          }, [row.original]);

          const updateAllocateTask = (task) => {
            updateAlocateTask(row.original._id, allocateTask, "", "");
            setShowEdit(false);
          };
          return (
            <div className="w-full h-full ">
              {showEdit ? (
                <input
                  type="text"
                  placeholder="Enter Task..."
                  value={allocateTask}
                  onChange={(e) => setAllocateTask(e.target.value)}
                  onBlur={(e) => updateAllocateTask(e.target.value)}
                  className="w-full h-[2.3rem] focus:border border-gray-300 px-1 outline-none rounded"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-start "
                  onDoubleClick={() => setShowEdit(true)}
                  title={allocateTask}
                >
                  <p
                    className="text-[#0078c8] hover:text-[#0053c8] cursor-pointer text-start  "
                    onDoubleClick={() => setShowEdit(true)}
                    onClick={() => {
                      setTaskID(row.original._id);
                      setProjectName(row.original.project.projectName);
                      setShowDetail(true);
                    }}
                  >
                    {allocateTask}
                  </p>
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
              <span className="font-medium w-full text-center px-1 py-1 ml-1 rounded-md bg-gray-300/30 text-black">
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
                getAllTasks();
                if (filterData) {
                  setFilterData((prevData) =>
                    prevData?.map((item) =>
                      item._id === data?.task?._id
                        ? { ...item, hours: hour }
                        : item
                    )
                  );
                }

                setTasksData((prevData) =>
                  prevData?.map((item) =>
                    item._id === data?.task?._id
                      ? { ...item, hours: hour }
                      : item
                  )
                );

                setHour("");
                setShow(false);

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
            updateAlocateTask(row.original._id, "", date, "");
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
          // console.log(
          //   "Deadline Date:",
          //   format(new Date(date), "dd-MMM-yyyy"),
          //   format(new Date(deadline), "dd-MMM-yyyy")
          // );
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
            updateAlocateTask(row.original._id, "", "", date);
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

          useEffect(() => {
            column.setFilterValue("Progress");

            // eslint-disable-next-line
          }, []);
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
              <select
                value={statusValue}
                onChange={(e) =>
                  updateTaskJLS(row.original?._id, "", "", e.target.value)
                }
                className="w-[6rem] h-[2rem] rounded-md border border-sky-300 outline-none"
              >
                <option value="empty"></option>
                <option value="To do">To do</option>
                <option value="Progress">Progress</option>
                <option value="Review">Review</option>
                <option value="On hold">On hold</option>
              </select>
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
                {users?.map((lead, i) => (
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
              <select
                value={leadValue || ""}
                onChange={(e) =>
                  updateTaskJLS(row.original?._id, "", e.target.value, "")
                }
                className="w-full h-[2rem] rounded-md border-none bg-transparent outline-none"
              >
                <option value="empty"></option>
                {users?.map((lead, i) => (
                  <option value={lead?.name} key={i}>
                    {lead?.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: users?.map((lead) => lead),
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
      {
        accessorKey: "timertracker",
        header: "Timer",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px] w-[5rem]">
              <span className="ml-1 cursor-pointer w-full text-center">
                Timer
              </span>
            </div>
          );
        },

        Cell: ({ cell, row }) => {
          // console.log("rowTask", row.original);
          return (
            <div
              className="flex items-center justify-center gap-1 w-full h-full "
              onClick={() => setPlay(!play)}
            >
              <span className="text-[1rem] cursor-pointer  ">
                <Timer
                  ref={timerRef}
                  clientId={auth?.user?.id}
                  jobId={row?.original?._id}
                  setIsShow={setIsShow}
                  note={note}
                  taskLink={currentPath}
                  pageName={"Tasks"}
                  taskName={row.original.project.projectName}
                  setNote={setNote}
                  department={row.original.project.projectName}
                  clientName={row.original.project.projectName}
                  companyName={row.original.project.projectName}
                  JobHolderName={row.original.jobHolder}
                  projectName={""}
                  task={row.original.task}
                  activity={activity}
                  setActivity={setActivity}
                />
              </span>
            </div>
          );
        },
        size: 90,
      },
      {
        accessorKey: "comments",
        header: "Comments",
        Cell: ({ cell, row }) => {
          const comments = cell.getValue();
          const [readComments, setReadComments] = useState([]);

          useEffect(() => {
            const filterComments = comments.filter(
              (item) => item.status === "unread"
            );
            setReadComments(filterComments);
            // eslint-disable-next-line
          }, [comments]);

          return (
            <div
              className="flex items-center justify-center gap-1 relative w-full h-full"
              onClick={() => {
                setCommentTaskId(row.original._id);
                setIsComment(true);
              }}
            >
              <div className="relative">
                <span className="text-[1rem] cursor-pointer relative">
                  <MdInsertComment className="h-5 w-5 text-orange-600 " />
                </span>
                {/* {readComments?.length > 0 && (
                  <span className="absolute -top-3 -right-3 bg-green-600 rounded-full w-[20px] h-[20px] text-[12px] text-white flex items-center justify-center ">
                    {readComments?.length}
                  </span>
                )} */}
              </div>
            </div>
          );
        },
        size: 90,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ cell, row }) => {
          // console.log("Id:", row.original._id);
          return (
            <div className="flex items-center justify-center gap-3 w-full h-full">
              <span
                className="text-[1rem] cursor-pointer"
                onClick={() => copyTask(row.original)}
                title="Copy this column"
              >
                <GrCopy className="h-5 w-5 text-cyan-600 " />
              </span>

              <span
                className=""
                title="Complete Task"
                onClick={() => {
                  handleCompleteStatus(row.original._id);
                }}
              >
                <MdCheckCircle className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
              </span>
              <button
                disabled={anyTimerRunning && timerId === row.original._id}
                className={`text-[1rem] ${
                  anyTimerRunning && timerId === row.original._id
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                type="button"
                onClick={() => handleDeleteTaskConfirmation(row.original._id)}
                title="Delete Task!"
              >
                <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600" />
              </button>
            </div>
          );
        },
        size: 130,
      },
      // Label
      {
        accessorKey: "labal",

        Header: ({ column }) => {
          return (
            <div className="flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Labels
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {labelData?.map((label, i) => (
                  <option key={i} value={label?.name}>
                    {label?.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },

        Cell: ({ cell, row }) => {
          const [show, setShow] = useState(false);
          const jobLabel = row.original.labal || {};
          const { name, color } = jobLabel;

          const handleLabelChange = (labelName) => {
            const selectedLabel = labelData.find(
              (label) => label.name === labelName
            );
            if (selectedLabel) {
              addlabelTask(row.original._id, labelName, selectedLabel?.color);
            } else {
              addlabelTask(row.original._id, "", "");
            }
            setShow(false);
          };

          return (
            <div className="w-full flex items-center justify-center">
              {show ? (
                <select
                  value={name || ""}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full h-[2rem] rounded-md border-none outline-none"
                >
                  <option value="clear">Select Label</option>
                  {labelData?.map((label, i) => (
                    <option value={label?.name} key={i}>
                      {label?.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  className="cursor-pointer h-full min-w-full "
                  onDoubleClick={() => setShow(true)}
                >
                  {name ? (
                    <span
                      className={`label relative py-[4px] px-2 rounded-md hover:shadow  cursor-pointer text-white`}
                      style={{ background: `${color}` }}
                    >
                      {name}
                    </span>
                  ) : (
                    <span
                      className={`label relative py-[4px] px-2 rounded-md hover:shadow  cursor-pointer text-white`}
                    >
                      .
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        },

        filterFn: (row, columnId, filterValue) => {
          const labelName = row.original?.labal?.name || "";
          return labelName === filterValue;
        },

        filterVariant: "select",
        filterSelectOptions: labelData?.map((label) => label.name),
        size: 140,
        minSize: 100,
        maxSize: 210,
        grow: false,
      },
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
    [users, play, note, auth, projects, filterData, totalHours, tasksData]
  );

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);

    table.setGlobalFilter("");
  };

  const table = useMaterialReactTable({
    columns,
    data: (active === "All" ? tasksData : filterData) || [],
    enableStickyHeader: true,
    enableStickyFooter: true,
    getRowId: (row) => row._id,
    muiTableContainerProps: { sx: { maxHeight: "860px" } },
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableGlobalFilter: true,
    enableRowNumbers: true,
    enableColumnResizing: true,
    enableTopToolbar: true,
    enableBottomToolbar: true,

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
        background: "linear-gradient(120deg,#ff7e5f,#feb47b, #ff7e5f )",
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
        border: "1px solid rgba(81, 81, 81, .5)",
        caption: {
          captionSide: "top",
        },
      },
    },
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        closeProject.current &&
        !closeProject.current.contains(event.target)
      ) {
        setShowProject(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useMemo(() => {
    const filteredRows = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

    setFilterData(filteredRows);

    // eslint-disable-next-line
  }, [table.getFilteredRowModel().rows]);

  return (
    <>
      {!showCompleted ? (
        <div className=" relative w-full h-full overflow-auto ">
          {/*  */}
          <div className="flex flex-col gap-2">
            {loading ? (
              <div className="flex items-center justify-center w-full h-screen px-4 py-4">
                <Loader />
              </div>
            ) : (
              <div className="w-full min-h-[10vh] relative -mt-[10px] ">
                <div className="h-full hidden1 overflow-y-scroll relative">
                  <MaterialReactTable table={table} />
                </div>
              </div>
            )}
          </div>

          {/* ----------------Add Project-------- */}
          {openAddProject && (
            <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
              <AddProjectModal
                users={users}
                setOpenAddProject={setOpenAddProject}
                projectId={projectId}
                setProjectId={setProjectId}
              />
            </div>
          )}

          {/* -----------Add Task-------------- */}
          {isOpen && (
            <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
              <AddTaskModal
                users={users}
                setIsOpen={setIsOpen}
                projects={projects}
                taskId={""}
                setTaskId={setTaskId}
                taskDetal={null}
              />
            </div>
          )}

          {/* ------------Comment Modal---------*/}

          {isComment && (
            <div
              ref={commentStatusRef}
              className="fixed bottom-4 right-4 w-[30rem] max-h-screen z-[999]  flex items-center justify-center"
            >
              <JobCommentModal
                setIsComment={setIsComment}
                jobId={commentTaskId}
                setJobId={setCommentTaskId}
                users={userName}
                type={"Task"}
                page={"task"}
              />
            </div>
          )}

          {/* -------------Stop Timer Btn-----------*/}
          {isShow && (
            <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/80 flex items-center justify-center">
              <div className="w-[32rem] rounded-md bg-white shadow-md">
                <div className="flex  flex-col gap-3 ">
                  <div className=" w-full flex items-center justify-between py-2 mt-1 px-4">
                    <h3 className="text-[19px] font-semibold text-gray-800">
                      Enter End Note
                    </h3>
                    <span
                      onClick={() => {
                        setIsShow(false);
                      }}
                    >
                      <IoClose className="text-black cursor-pointer h-6 w-6 " />
                    </span>
                  </div>
                  <hr className="w-full h-[1px] bg-gray-500 " />
                  <div className="flex items-start px-4 py-2 ">
                    {activity === "Chargeable" ? (
                      <button
                        className={`px-4 h-[2.6rem] min-w-[5rem] flex items-center justify-center  rounded-md cursor-pointer shadow-md  text-white border-none outline-none bg-green-500 hover:bg-green-600`}
                        onClick={() => setActivity("Non-Chargeable")}
                        style={{ width: "8rem", fontSize: "14px" }}
                      >
                        Chargeable
                      </button>
                    ) : (
                      <button
                        className={`px-4 h-[2.6rem] min-w-[5rem] flex items-center justify-center  rounded-md cursor-pointer shadow-md  text-white border-none outline-none bg-red-500 hover:bg-red-600`}
                        onClick={() => setActivity("Chargeable")}
                        style={{ width: "9rem", fontSize: "14px" }}
                      >
                        Non-Chargeable
                      </button>
                    )}
                  </div>
                  <div className=" w-full px-4 py-2 flex-col gap-4">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add note here..."
                      className="w-full h-[6rem] rounded-md resize-none py-1 px-2 shadow border-2 border-gray-700"
                    />
                    <div className="flex items-center justify-end mt-4">
                      <button
                        className={`${style.btn}`}
                        onClick={handleStopTimer}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/*---------------Task Details---------------*/}

          {showDetail && (
            <div className="fixed right-0 top-[3.8rem] z-[999] bg-gray-100 w-[35%] 2xl:w-[27%]  h-[calc(103vh-0rem)] py-3 px-3 ">
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
                handleDeleteTask={handleDeleteTask}
                setShowDetail={setShowDetail}
                users={users}
                projects={projects}
                setFilterData={setFilterData}
              />
            </div>
          )}

          {/* ---- */}
        </div>
      ) : (
        <CompletedTasks
          setShowCompleted={setShowCompleted}
          setActive2={setActive}
        />
      )}

      {/* ---------------Add label------------- */}
      {showlabel && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
          <AddLabel
            setShowlabel={setShowlabel}
            type={"task"}
            getLabels={getlabel}
          />
        </div>
      )}
    </>
  );
};

export default Tasks;
