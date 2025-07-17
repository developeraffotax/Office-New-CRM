import React, { useEffect, useMemo, useRef, useState } from "react";
import { style } from "../../utlis/CommonStyle";
import axios from "axios";
import AddProjectModal from "../../components/Tasks/AddProjectModal";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { IoBriefcaseOutline, IoClose } from "react-icons/io5";
import {
  MdAutoGraph,
  MdInsertComment,
  MdOutlineEdit,
  MdOutlineKeyboardBackspace,
} from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { TbCalendarDue } from "react-icons/tb";
import AddTaskModal from "../../components/Tasks/AddTaskModal";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import { mkConfig, generateCsv, download } from "export-to-csv";
import JobCommentModal from "../Jobs/JobCommentModal";
import TaskDetail from "./TaskDetail";
import { MdBackspace } from "react-icons/md";
import TimeEditor from "../../utlis/TimeSelector";
import Subtasks from "./Subtasks";
import AssignmentIcon from '@mui/icons-material/Assignment';

// CSV Configuration
const csvConfig = mkConfig({
  filename: "full_table_data",
  fieldSeparator: ",",
  quoteStrings: '"',
  decimalSeparator: ".",
  showLabels: true,
  showTitle: true,
  title: "Exported Tasks Table Data",
  useTextFile: false,
  useBom: true,
  useKeysAsHeaders: true,
});

const CompletedTasks = ({
  setShowCompleted,
  setActive2,
  getTasks,
  getAllProj1,
}) => {
  const { auth, filterId, setFilterId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [openAddProject, setOpenAddProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [showProject, setShowProject] = useState(false);
  const [active, setActive] = useState("All");
  const [activeBtn, setActiveBtn] = useState("");
  const [taskId, setTaskId] = useState("");
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  // Timer
  const [play, setPlay] = useState(false);
  const timerRef = useRef();
  const [isShow, setIsShow] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  // Filters
  const [showJobHolder, setShowJobHolder] = useState(false);
  const [showDue, setShowDue] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [active1, setActive1] = useState("");
  const [filterData, setFilterData] = useState([]);
  const [isComment, setIsComment] = useState(false);
  const [commentTaskId, setCommentTaskId] = useState("");
  const [userName, setUserName] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [taskID, setTaskID] = useState("");
  const [projectName, setProjectName] = useState("");
  const [labelData, setLabelData] = useState([]);
  const [totalHours, setTotalHours] = useState("0");

  const dateStatus = ["Due", "Overdue"];

  const status = ["Todo", "Progress", "Review", "Onhold"];

  console.log("projects:", projects);

  // -------Get All Tasks----->
  const getAllTasks = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/completed`
      );
      setTasksData(data?.tasks);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTasks();
    // eslint-disable-next-line
  }, []);

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );

      // setUsers(data?.users);
      setUserName(data?.users.map((user) => user.name));
      setUsers(
        data?.users?.filter((user) =>
          user?.role?.access?.some((item) =>
            item?.permission?.includes("Tasks")
          )
        ) || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  //---------- Get All Projects-----------
  const getAllProjects = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/projects/get_all/project`
      );
      setProjects(data?.projects);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllProjects();
    // eslint-disable-next-line
  }, []);

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

  // ---------Delete Project-------->
  const handleDeleteConfirmation = (projectId) => {
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
        deleteProject(projectId);
        Swal.fire("Deleted!", "Your job has been deleted.", "success");
      }
    });
  };
  const deleteProject = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/projects/delete/project/${id}`
      );
      if (data) {
        getAllProjects();
        // toast.success("Project Deleted!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    const totalHours = tasksData.reduce(
      (sum, client) => sum + Number(client.hours),
      0
    );
    setTotalHours(totalHours.toFixed(0));
    if (active === "All" && !active1) {
      if (filterData) {
        const totalHours = tasksData.reduce(
          (sum, client) => sum + Number(client.hours),
          0
        );
        setTotalHours(totalHours.toFixed(0));
      }
    } else {
      if (filterData) {
        const totalHours = filterData.reduce(
          (sum, client) => sum + Number(client.hours),
          0
        );
        setTotalHours(totalHours.toFixed(0));
      }
    }
  }, [tasksData, filterData, active, active1, activeBtn]);

  const handleUpdateStatus = (projectId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this project!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        updateProjectStatus(projectId);
        Swal.fire(
          "Project Completed!",
          "Your project has been updated.",
          "success"
        );
      }
    });
  };

  const updateProjectStatus = async (id) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/projects/update/status/${id}`
      );
      if (data) {
        getAllProjects();
        setShowProject(false);
        getAllProj1();
        // toast.success("Project completed!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  // ------------------------------Tasks----------------->

  // ------------Filter By Projects---------->
  const getProjectsCount = (project) => {
    if (project === "All") {
      return tasksData?.length;
    }
    return tasksData.filter((item) => item?.project?.projectName === project)
      ?.length;
  };

  // --------------Job_Holder Length---------->

  const getJobHolderCount = (user, project) => {
    return tasksData.filter((item) =>
      project === "All"
        ? item?.jobHolder === user
        : item?.jobHolder === user && item?.project?.projectName === project
    )?.length;
  };

  // -------Due & Overdue count------->
  const getDueAndOverdueCountByDepartment = (project) => {
    const filteredData = tasksData.filter(
      (item) => item.project?.projectName === project || project === "All"
    );

    const dueCount = filteredData.filter(
      (item) => getStatus(item.deadline, item.startDate) === "Due"
    ).length;
    const overdueCount = filteredData.filter(
      (item) => getStatus(item.deadline, item.startDate) === "Overdue"
    ).length;

    return { due: dueCount, overdue: overdueCount };
  };

  // --------------Status Length---------->
  const getStatusCount = (status, projectName) => {
    return tasksData.filter((item) =>
      projectName === "All"
        ? item?.status === status
        : item?.status === status && item?.project?.projectName === projectName
    )?.length;
  };

  // --------------Filter Data By Department ----------->

  const filterByDep = (value) => {
    const filteredData = tasksData.filter(
      (item) =>
        item.project?.projectName === value ||
        item.status === value ||
        item.jobHolder === value ||
        item._id === value
    );

    console.log("FilterData", filteredData);

    setFilterData([...filteredData]);
  };

  useEffect(() => {
    if (tasksData && filterId) {
      filterByDep(filterId);
    }
    // eslint-disable-next-line
  }, [tasksData, filterId]);

  // -------------- Filter Data By Department || Status || Placeholder ----------->

  const filterByProjStat = (value, proj) => {
    let filteredData = [];

    if (proj === "All") {
      filteredData = tasksData.filter(
        (item) =>
          item.status === value ||
          item.jobHolder === value ||
          getStatus(item.deadline, item.startDate) === value ||
          getStatus(item.deadline, item.startDate) === value
      );
    } else {
      filteredData = tasksData.filter((item) => {
        const jobMatches = item.project?.projectName === proj;
        const statusMatches = item.status === value;
        const holderMatches = item.jobHolder === value;

        return (
          (holderMatches && jobMatches) ||
          (statusMatches && jobMatches) ||
          (jobMatches && getStatus(item.deadline, item.startDate) === value) ||
          (jobMatches && getStatus(item.deadline, item.startDate) === value)
        );
      });
    }

    setFilterData([...filteredData]);
  };

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
        setTasksData((prevData) =>
          prevData.map((item) =>
            item._id === updateTask._id ? updateTask : item
          )
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // -----------Update JobHolder -/- Lead | Status-------->
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
      if (data?.success) {
        const updateTask = data?.task;
        toast.success("Task updated successfully!");
        if (filterId || active || active1) {
          setFilterData((prevData) =>
            prevData.map((item) =>
              item._id === updateTask._id ? updateTask : item
            )
          );
        }

        setTasksData((prevData) =>
          prevData.map((item) =>
            item._id === updateTask._id ? updateTask : item
          )
        );

        getTasks();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
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
        // toast.success("Task updated successfully!");
        setTasksData((prevData) =>
          prevData.map((item) =>
            item._id === updateTask._id ? updateTask : item
          )
        );
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

  // <-----------Task Status------------->
  const getStatus = (jobDeadline, yearEnd) => {
    const deadline = new Date(jobDeadline);
    const yearEndDate = new Date(yearEnd);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    const yearEndDateOnly = new Date(yearEndDate);
    yearEndDateOnly.setHours(0, 0, 0, 0);

    if (deadlineDate < today || yearEndDateOnly < today) {
      return "Overdue";
    } else if (
      deadlineDate.getTime() === today.getTime() ||
      yearEndDateOnly.getTime() === today.getTime()
    ) {
      return "Due";
    }
    return "";
  };

  // -----------Copy Task------->

  const copyTask = async (originalTask) => {
    const taskCopy = { ...originalTask };
    taskCopy.task = "";

    // delete taskCopy._id;
    // setTasksData((prevData) => [...prevData, taskCopy]);

    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/v1/tasks/create/task`,
      {
        projectId: taskCopy.project._id,
        jobHolder: taskCopy.jobHolder,
        task: taskCopy.task,
        hours: taskCopy.hours,
        startDate: taskCopy.startDate,
        deadline: taskCopy.deadline,
        lead: taskCopy.lead,
        label: taskCopy.label,
      }
    );
    if (data) {
      console.log("Copied Task:", data.task);

      setTasksData((prevData) => [...prevData, data.task]);
    }
  };

  // ---------Stop Timer ----------->
  const handleStopTimer = () => {
    if (timerRef.current) {
      timerRef.current.stopTimer();
    }
  };

  // -----------Download in CSV------>
  const flattenData = (data) => {
    return data.map((row) => ({
      projectName: row.project.projectName,
      projectId: row.project._id,
      jobHolder: row.jobHolder,
      task: row.task,
      hours: row.hours,
      startDate: row.startDate,
      deadline: row.deadline || "",
      status: row.status || "",
      lead: row.lead || "",
      estimate_Time: row.estimate_Time || "",
    }));
  };

  const handleExportData = () => {
    const csvData = flattenData(tasksData);
    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
  };
  // ---------Handle Delete Task-------------
  const handleDeleteTask = async (id) => {
    const filterData = tasksData.filter((item) => item._id !== id);
    setTasksData(filterData);
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/delete/task/${id}`
      );
      if (data) {
        setShowDetail(false);
        toast.success("Task deleted successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
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
                className="font-normal h-[1.8rem] w-full cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {projects?.map((proj) => (
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
            <div className="flex">
              <span>{row.original.project.projectName}</span>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: projects?.map((project) => project?.projectName),
        filterVariant: "select",
      },
      {
        accessorKey: "jobHolder",
        header: "Job Holder",
        Header: ({ column }) => {
          const user = auth?.user?.name;

          useEffect(() => {
            column.setFilterValue(user);

            // eslint-disable-next-line
          }, []);

          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Job Holder
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
        filterSelectOptions: users.map((jobhold) => jobhold.name),
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
          const [showEdit, setShowEdit] = useState(false);

          
          const [showSubtasks, setShowSubtasks] = useState(false);
            const [showSubtaskId, setShowSubtaskId] = useState("");

          const handleShowSubtasks = () => {
             
            console.log("row.original._id:", row.original._id);
            console.log("showSubtaskId:", showSubtaskId);

            if(showSubtaskId === row.original._id){
              console.log("hide");
              setShowSubtaskId("");
            }else{
              setShowSubtaskId(row.original._id);
            }
          }
           
          useEffect(() => {
            setAllocateTask(row.original.task);
          }, [row.original]);

          const updateAllocateTask = (task) => {
            updateAlocateTask(row.original._id, allocateTask, "", "");
            setShowEdit(false);
          };
          return (
            <div className="w-full flex items-start justify-start gap-1 flex-col "  >

              <div  className="w-full   flex items-start justify-between gap-2 flex-row ">
              
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
                            setTaskID(row.original._id);
                            setProjectName(row.original.project.projectName);
                            setShowDetail(true);
                          }}
                        >
                          {allocateTask}
                        </p>
                      </div>
              )}
            

                  <div className=" ">
                    <span className={`${showSubtaskId === row.original._id ? "text-orange-500 " : row.original?.subtasks?.length > 0 ? "text-blue-400" : "text-gray-500"} cursor-pointer hover:text-orange-500 transition-all `} onClick={() => {
                            setTaskID(row.original._id);
                            setProjectName(row.original.project.projectName);
                            handleShowSubtasks()
                          }}>
                      <AssignmentIcon />
                    </span>

                  </div>


            </div>



             {
                 showSubtaskId === row.original._id && <div className={`  w-full h-full bg-gradient-to-br from-orange-200  rounded-lg shadow-md text-black `}>
                <Subtasks taskId={showSubtaskId} />
                </div>
              }




            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.startsWith(filterValue.toLowerCase());
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







        Cell: ({ cell, row }) => {
          const [showEditor, setShowEditor] = useState(false);
          const [value, setValue] = useState(cell.getValue());
          const anchorRef = useRef(null);
        
          const formatDuration = (val) => {
            const h = Math.floor(val);
            const m = Math.round((val % 1) * 60);
            return `${h}h${m > 0 ? ` ${m}m` : ""}`;
          };
        
          const handleApply = async (newHours) => {
           
            try {
              const { data } = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/hours/${row.original._id}`,
                { hours: newHours }
              );
               if(data) {
                
        
                // const savedTaskTimer =JSON.parse(localStorage.getItem("task-timer"));
                // if (savedTaskTimer && savedTaskTimer.taskId === row.original._id) {
                //     updateCountdown(newHours)
                // }
        
        
        
                setValue(newHours);
                toast.success("Hours updated");
                if (filterId || active || active1) {
                          setFilterData((prevData) =>
                            prevData?.map((item) =>
                              item._id === data?.task?._id
                                ? { ...item, hours: newHours }
                                : item
                            )
                          );
                        }
                        setTasksData((prevData) =>
                          prevData?.map((item) =>
                            item._id === data?.task?._id
                              ? { ...item, hours: newHours }
                              : item
                          )
                        );
               }
            } catch (err) {
              toast.error("Update failed");
              console.error(err);
            }
          };
        
           return (
            <div ref={anchorRef} className="relative flex items-center gap-1">
              <span onDoubleClick={() => setShowEditor(true)}>{formatDuration(value)}</span>
              {/* <button onClick={() => setShowEditor(true)} className="text-gray-400 hover:text-black"> <BiPencil  /> </button> */}
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
                  {column.columnDef.filterSelectOptions.map((option, idx) => (
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
          const [date, setDate] = useState(() => {
            const cellDate = new Date(cell.getValue());
            return cellDate.toISOString().split("T")[0];
          });

          const [showStartDate, setShowStartDate] = useState(false);

          const handleDateChange = (newDate) => {
            setDate(newDate);
            updateAlocateTask(row.original._id, "", date, "");
            setShowStartDate(false);
          };

          return (
            <div className="w-full flex  ">
              {!showStartDate ? (
                <p onDoubleClick={() => setShowStartDate(true)}>
                  {format(new Date(date), "dd-MMM-yyyy")}
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
          const today = new Date();

          const startOfToday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );

          // Handle "Custom date" filter (if it includes a specific month-year)
          if (filterValue.includes("-")) {
            const [year, month] = filterValue.split("-");
            const cellYear = cellDate.getFullYear().toString();
            const cellMonth = (cellDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");

            return year === cellYear && month === cellMonth;
          }

          // Other filter cases
          switch (filterValue) {
            case "Expired":
              return cellDate < startOfToday;
            case "Today":
              return cellDate.toDateString() === today.toDateString();
            case "Yesterday":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() - 1);
              return cellDate.toDateString() === tomorrow.toDateString();
            case "Last 7 days":
              const last7Days = new Date(today);
              last7Days.setDate(today.getDate() - 7);
              return cellDate >= last7Days && cellDate < startOfToday;
            case "Last 15 days":
              const last15Days = new Date(today);
              last15Days.setDate(today.getDate() - 15);
              return cellDate >= last15Days && cellDate < startOfToday;
            case "Last 30 Days":
              const last30Days = new Date(today);
              last30Days.setDate(today.getDate() - 30);
              return cellDate >= last30Days && cellDate < startOfToday;
            case "Last 60 Days":
              const last60Days = new Date(today);
              last60Days.setDate(today.getDate() - 60);
              return cellDate >= last60Days && cellDate < startOfToday;
            default:
              return false;
          }
        },
        filterSelectOptions: [
          "Today",
          "Yesterday",
          "Last 7 days",
          "Last 15 days",
          "Last 30 Days",
          "Last 60 Days",
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
                  {column.columnDef.filterSelectOptions.map((option, idx) => (
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
                  {format(new Date(allocateDate), "dd-MMM-yyyy")}
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
            case "Yesterday":
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() - 1);
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
          "Today",
          "Yesterday",
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
          const statusData = [
            "To do",
            "Progress",
            "Review",
            "On hold",
            "Completed",
          ];
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className=" text-center"
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
                <option value="completed">Completed</option>
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
          "completed",
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
                Lead
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
                {users.map((lead, i) => (
                  <option value={lead?.name} key={i}>
                    {lead?.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: users.map((lead) => lead),
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

          return (
            <div className="w-full flex items-center justify-center">
              {show ? (
                <select
                  value={name || ""}
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
                  // onDoubleClick={() => setShow(true)}
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
        filterSelectOptions: labelData.map((label) => label.name),
        size: 160,
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
    [users, play, note, auth, currentPath, projects, filterData, totalHours]
  );

  const table = useMaterialReactTable({
    columns,
    // data: active === "All" && !active1 && !filterId ? tasksData : filterData,
    data:
      (active === "All" && !active1 && !filterId ? tasksData : filterData) ||
      [],
    enableStickyHeader: true,
    enableStickyFooter: true,
    // columnFilterDisplayMode: "popover",
    muiTableContainerProps: { sx: { maxHeight: "850px" } },
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableGlobalFilter: true,
    enableRowNumbers: true,
    enableColumnResizing: true,
    enableTopToolbar: true,
    enableBottomToolbar: true,
    // enableEditing: true,
    // state: { isLoading: loading },

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
        backgroundColor: "#E5E7EB",
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

  return (
    <div className=" relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4">
      <button
        className=" absolute top-1  p-[2px] rounded-full left-2 bg-gray-300/30 hover:bg-gray-300/50"
        onClick={() => {
          setActive2("All");
          setShowCompleted(false);
        }}
      >
        <MdOutlineKeyboardBackspace className="h-6 w-6 cursor-pointer text-orange-500" />
      </button>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <h1 className=" text-xl sm:text-2xl font-semibold ">
            Completed Tasks
          </h1>
        </div>

        {/* Project Buttons */}
        <div className="flex items-center gap-4">
          {auth?.user?.role === "Admin" && (
            <div
              className=" relative w-[8rem]  border-2 border-gray-200 rounded-md py-1 px-2 flex items-center justify-between gap-1"
              onClick={() => setShowProject(!showProject)}
            >
              <span className="text-[15px] text-gray-900 cursor-pointer">
                Projects
              </span>
              <span
                onClick={() => setShowProject(!showProject)}
                className="cursor-pointer"
              >
                {!showProject ? (
                  <IoIosArrowDown className="h-5 w-5 text-black cursor-pointer" />
                ) : (
                  <IoIosArrowUp className="h-5 w-5 text-black cursor-pointer" />
                )}
              </span>
              {/* -----------Projects------- */}
              {showProject && (
                <div className="absolute top-9 right-[-3.5rem] flex flex-col gap-2 max-h-[16rem] overflow-y-auto hidden1 z-[99] border rounded-sm shadow-sm bg-gray-50 py-2 px-2 w-[14rem]">
                  {projects?.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {projects?.map((project) => (
                        <div
                          key={project._id}
                          className="w-full flex items-center justify-between gap-1 rounded-md bg-white border py-1 px-1 hover:bg-gray-100"
                        >
                          <p className="text-[13px] w-[8rem] ">
                            {project?.projectName}
                          </p>
                          <div className="flex items-center gap-1">
                            <span
                              title="Uncomplete this Project"
                              onClick={() => handleUpdateStatus(project._id)}
                            >
                              <MdBackspace className="h-5 w-5 cursor-pointer text-pink-500 hover:text-pink-600 transition-all duration-200" />
                            </span>
                            <span
                              onClick={() => {
                                setProjectId(project._id);
                                setOpenAddProject(true);
                              }}
                              title="Edit Project"
                            >
                              <MdOutlineEdit className="h-5 w-5 cursor-pointer hover:text-sky-500 transition-all duration-200" />
                            </span>
                            <span
                              title="Delete Project"
                              onClick={() =>
                                handleDeleteConfirmation(project._id)
                              }
                            >
                              <AiTwotoneDelete className="h-5 w-5 cursor-pointer hover:text-red-500 transition-all duration-200" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-[8rem]   flex items-center flex-col gap-1 justify-center text-center">
                      <span className="text-[2rem] text-center">🤯</span>
                      <span className=" text-center text-[15px] text-gray-500">
                        Completed Projects not available!
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <button
            className={`${style.button1} text-[15px] `}
            onClick={() => setOpenAddProject(true)}
            style={{ padding: ".4rem 1rem" }}
          >
            Add Project
          </button>
          <button
            className={`${style.button1} text-[15px] `}
            onClick={() => setIsOpen(true)}
            style={{ padding: ".4rem 1rem" }}
          >
            Add Task
          </button>
        </div>
      </div>
      {/*  */}
      <div className="flex flex-col gap-2">
        {/* -----------Filters By Projects--------- */}
        <div className="flex items-center flex-wrap gap-2 mt-3">
          <div
            className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
              active === "All" &&
              " border-2 border-b-0 text-orange-600 border-gray-300"
            }`}
            onClick={() => {
              setActive("All");
              filterByDep("All");
              setActive1("");
              setFilterId("");
            }}
          >
            All ({getProjectsCount("All")})
          </div>
          {projects?.map((proj, i) => {
            getDueAndOverdueCountByDepartment(proj?.projectName);
            return (
              <div
                className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                  active === proj?.projectName &&
                  " border-2 border-b-0 text-orange-600 border-gray-300"
                }`}
                key={i}
                onClick={() => {
                  setActive(proj?.projectName);
                  filterByDep(proj?.projectName);
                  setActive1("");
                  setFilterId("");
                }}
              >
                {proj?.projectName} ({getProjectsCount(proj?.projectName)})
              </div>
            );
          })}

          {/*  */}
          {/* -------------Filter Open Buttons-------- */}
          <span
            className={` p-1 rounded-md hover:shadow-md bg-gray-50 mb-1  cursor-pointer border  ${
              activeBtn === "jobHolder" && "bg-orange-500 text-white"
            }`}
            onClick={() => {
              setActiveBtn("jobHolder");
              setShowJobHolder(!showJobHolder);
            }}
            title="Filter by Job Holder"
          >
            <IoBriefcaseOutline className="h-6 w-6  cursor-pointer " />
          </span>
          <span
            className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
              activeBtn === "due" && "bg-orange-500 text-white"
            }`}
            onClick={() => {
              setActiveBtn("due");
              setShowDue(!showDue);
            }}
            title="Filter by Status"
          >
            <TbCalendarDue className="h-6 w-6  cursor-pointer" />
          </span>
          <span
            className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
              activeBtn === "status" && "bg-orange-500 text-white"
            }`}
            onClick={() => {
              setActiveBtn("status");
              setShowStatus(!showStatus);
            }}
            title="Filter by Job Status"
          >
            <MdAutoGraph className="h-6 w-6  cursor-pointer" />
          </span>
          <span
            className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
            onClick={() => {
              setActive("All");
              setActiveBtn("");
              setShowStatus(false);
              setShowJobHolder(false);
              setShowDue(false);
              setActive1("");
              setFilterId("");
            }}
            title="Clear filters"
          >
            <IoClose className="h-6 w-6  cursor-pointer" />
          </span>
        </div>
        {/*  */}
        <hr className="mb-1 bg-gray-300 w-full h-[1px]" />

        {/* ----------Job_Holder Summery Filters---------- */}
        {showJobHolder && activeBtn === "jobHolder" && (
          <>
            <div className="w-full  py-2 ">
              <h3 className="text-[19px] font-semibold text-black">
                Job Holder Summary
              </h3>
              <div className="flex items-center flex-wrap gap-4">
                {users?.map((user, i) => (
                  <div
                    className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                      active1 === user.name &&
                      "  border-b-2 text-orange-600 border-orange-600"
                    }`}
                    key={i}
                    onClick={() => {
                      setActive1(user?.name);
                      filterByProjStat(user?.name, active);
                    }}
                  >
                    {user.name} ({getJobHolderCount(user?.name, active)})
                  </div>
                ))}
              </div>
            </div>
            <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
          </>
        )}

        {/* ----------Date Status Summery Filters---------- */}
        {showDue && activeBtn === "due" && (
          <>
            <div className="w-full py-2">
              <h3 className="text-[19px] font-semibold text-black">
                Date Status Summary
              </h3>
              <div className="flex items-center flex-wrap gap-4">
                {dateStatus?.map((stat, i) => {
                  const { due, overdue } =
                    getDueAndOverdueCountByDepartment(active);
                  return (
                    <div
                      className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                        active1 === stat &&
                        " border-b-2 text-orange-600 border-orange-600"
                      }`}
                      key={i}
                      onClick={() => {
                        setActive1(stat);
                        filterByProjStat(stat, active);
                      }}
                    >
                      {stat === "Due" ? (
                        <span>Due {due}</span>
                      ) : (
                        <span>Overdue {overdue}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
          </>
        )}

        {/* ----------Status Summery Filters---------- */}
        {showStatus && activeBtn === "status" && (
          <>
            <div className="w-full  py-2 ">
              <h3 className="text-[19px] font-semibold text-black">
                Status Summary
              </h3>
              <div className="flex items-center flex-wrap gap-4">
                {status?.map((stat, i) => (
                  <div
                    className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                      active1 === stat &&
                      "  border-b-2 text-orange-600 border-orange-600"
                    }`}
                    key={i}
                    onClick={() => {
                      setActive1(stat);
                      filterByProjStat(stat, active);
                    }}
                  >
                    {stat} ({getStatusCount(stat, active)})
                  </div>
                ))}
              </div>
            </div>
            <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
          </>
        )}
        {/*  */}
        {/* <hr className="mb-1 bg-gray-300 w-full h-[1px]" /> */}
        {loading ? (
          <div className="flex items-center justify-center w-full h-screen px-4 py-4">
            <Loader />
          </div>
        ) : (
          <div className="w-full min-h-[70vh] relative">
            <div className="h-full hidden1 overflow-y-scroll relative">
              <MaterialReactTable table={table} />
            </div>
            {/* <span className="absolute bottom-4 left-[32%] z-10 font-semibold text-[15px] text-gray-900">
                  Total Hrs: {0}
                </span> */}
          </div>
        )}
      </div>

      {/* ----------------Add Project-------- */}
      {openAddProject && (
        <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
          <AddProjectModal
            users={users}
            setOpenAddProject={setOpenAddProject}
            getAllProjects={getAllProjects}
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
            getAllTasks={getAllTasks}
            taskDetal={null}
          />
        </div>
      )}

      {/* ------------Comment Modal---------*/}

      {isComment && (
        <div className="fixed bottom-4 right-4 w-[30rem] max-h-screen z-[999]  flex items-center justify-center">
          <JobCommentModal
            setIsComment={setIsComment}
            jobId={commentTaskId}
            setJobId={setCommentTaskId}
            users={userName}
            type={"Task"}
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
                  Enter your note here
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
              <div className=" w-full px-4 py-2 flex-col gap-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add note here..."
                  className="w-full h-[6rem] rounded-md resize-none py-1 px-2 shadow border-2 border-gray-700"
                />
                <div className="flex items-center justify-end mt-4">
                  <button className={`${style.btn}`} onClick={handleStopTimer}>
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
        <div className="fixed right-0 top-[3.8rem] z-[999] bg-gray-100 w-[35%] h-[calc(100vh-3.8rem)] py-3 px-3 ">
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
            getAllTasks={getAllTasks}
            handleDeleteTask={handleDeleteTask}
            setTasksData={setTasksData}
            setShowDetail={setShowDetail}
            users={users}
            projects={projects}
          />
        </div>
      )}

      {/* ---- */}
    </div>
  );
};

export default CompletedTasks;
