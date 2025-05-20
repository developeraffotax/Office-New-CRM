import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { style } from "../../utlis/CommonStyle";
import axios from "axios";
import AddProjectModal from "../../components/Tasks/AddProjectModal";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import {
  IoBriefcaseOutline,
  IoCheckmarkDoneCircleSharp,
  IoClose,
} from "react-icons/io5";
import {
  MdAutoGraph,
  MdCheckCircle,
  MdInsertComment,
  MdOutlineEdit,
  MdOutlineModeEdit,
} from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { TbCalendarDue, TbLoader, TbLoader2 } from "react-icons/tb";
import CompletedTasks from "./CompletedTasks";
import AddTaskModal from "../../components/Tasks/AddTaskModal";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import { format } from "date-fns";
import { Timer } from "../../utlis/Timer";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { GrCopy } from "react-icons/gr";
import { mkConfig, generateCsv, download } from "export-to-csv";
import JobCommentModal from "../Jobs/JobCommentModal";
import AddLabel from "../../components/Modals/AddLabel";
import TaskDetail from "./TaskDetail";
import { GrUpdate } from "react-icons/gr";
import { LuImport } from "react-icons/lu";
import AssignmentIcon from '@mui/icons-material/Assignment';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import socketIO from "socket.io-client";
import { Box, Typography } from "@mui/material";
import Subtasks from "./Subtasks";
import { ActiveTimer } from "../../utlis/ActiveTimer";

const ENDPOINT = process.env.REACT_APP_SOCKET_ENDPOINT || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

// CSV Configuration
const csvConfig = mkConfig({
  filename: "full_table_data",
  fieldSeparator: ",",
  quoteStrings: '"',
  decimalSeparator: ".",
  showLabels: true,
  showTitle: true,
  title: "",
  useTextFile: false,
  useBom: true,
  useKeysAsHeaders: true,
});

const AllTasks = () => {
  const {
    auth,
    filterId,
    setFilterId,
    anyTimerRunning,
    searchValue,
    setSearchValue,
    jid,
  } = useAuth();
  const [show, setShow] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [openAddProject, setOpenAddProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [showProject, setShowProject] = useState(false);
  const [active, setActive] = useState("All");
  const [activeBtn, setActiveBtn] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
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
  const [fLoading, setFLoading] = useState(false);
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
  const [totalHours, setTotalHours] = useState(0);
  const [allProjects, setAllProjects] = useState([]);
  const [labelData, setLabelData] = useState([]);
  const commentStatusRef = useRef(null);
  const [showlabel, setShowlabel] = useState(false);
  const [timerId, setTimerId] = useState("");
  const dateStatus = ["Due", "Overdue"];
  const status = ["To do", "Progress", "Review", "Onhold"];
  const closeProject = useRef(null);
  const [state, setState] = useState("");
  const [stateData, setStateData] = useState([]);
  const [activity, setActivity] = useState("Chargeable");
  const [access, setAccess] = useState([]);
  const [isLoad, setIsLoad] = useState(false);
  // Bulk Action
  const [showEdit, setShowEdit] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [project, setProject] = useState("");
  const [jobHolder, setJobHolder] = useState("");
  const [lead, setLead] = useState("");
  const [hours, setHours] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [tstatus, setTStatus] = useState("");
  const [isUpload, setIsUpdate] = useState(false);
  const [reload, setReload] = useState(false);

  // console.log("tasksData:", tasksData);


 
  const [showActiveTimer, setShowActiveTimer] = useState(false);


  
  const [searchParams] = useSearchParams();
  const comment_taskId = searchParams.get('comment_taskId');


  useEffect(() => {
    if (comment_taskId) {
      setCommentTaskId(comment_taskId);
      setIsComment(true);
    }

  }, [comment_taskId]);
  






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

  //---------- Get All Projects-----------
  const getAllProjects = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/projects/get_all/project`
      );
      setAllProjects(data?.projects);
      if (auth.user.role.name === "Admin") {
        setProjects(data?.projects);
      } else {
        const filteredProjects = data.projects.filter((project) =>
          project.users_list.some((user) => user._id === auth?.user?.id)
        );

        setProjects(filteredProjects);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllProjects();
    // eslint-disable-next-line
  }, [auth]);

  useEffect(() => {
    socketId.on("newProject", () => {
      getAllProjects();
    });

    return () => {
      socketId.off("newProject", getAllProjects);
    };
    // eslint-disable-next-line
  }, [socketId]);

  // -------Get All Tasks----->
  const getAllTasks = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/all`
      );

      setTasksData(data.tasks);

      // console.log("data.tasks:", data?.tasks);
      if (auth.user.role.name === "Admin") {
        setTasksData(data?.tasks);
      } else {
        const filteredTasks = data?.tasks?.filter((item) => {
          // item?.jobHolder === auth?.user?.name ||
          return item?.project?.users_list?.some(
            (user) => user?.name === auth?.user?.name
          );
        });

        setTasksData(filteredTasks || []);
      }

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

  // ---------------Get Task on WithoutLoad-----
  const getTasks1 = async () => {
    setIsLoad(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/all`
      );

      setTasksData(data.tasks);

      if (auth.user.role.name === "Admin") {
        setTasksData(data?.tasks);
      } else {
        const filteredTasks = data?.tasks?.filter((item) => {
          return item?.project?.users_list?.some(
            (user) => user?.name === auth?.user?.name
          );
        });

        setTasksData(filteredTasks || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoad(false);
    }
  };

  useEffect(() => {
    socketId.on("newtask", () => {
      getTasks1();
    });

    return () => {
      socketId.off("newtask", getTasks1);
    };
    // eslint-disable-next-line
  }, [socketId]);

  // useEffect(() => {
  //   if (auth && auth?.user) {
  //     if (auth.user.role.name === "Admin") {
  //       setTasksData(tasksData);
  //     } else {
  //       const filteredTasks = tasksData.filter((task) => {
  //         return task.project?.users_list?.some(
  //           (user) => user._id === auth.user.id
  //         );
  //       });

  //       setTasksData(filteredTasks);
  //     }
  //   }
  //   //eslint-disable-next-line
  // }, [auth]);

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
        Swal.fire("Deleted!", "Your project has been deleted.", "success");
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
        // Send Socket Timer
        socketId.emit("addTask", {
          note: "New Task Added",
        });
        socketId.emit("addproject", {
          note: "New Project Added",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

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
        getAllTasks();
        setShowProject(false);
        // Send Socket Timer
        socketId.emit("addTask", {
          note: "New Task Added",
        });
        socketId.emit("addproject", {
          note: "New Project Added",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  // ------------------------------Tasks----------------->

  // ---------Total Hours-------->

  useEffect(() => {
    const calculateTotalHours = (data) => {
      return data?.reduce((sum, client) => sum + Number(client.hours), 0);
    };

    if (active === "All" && !active1) {
      setTotalHours(calculateTotalHours(tasksData).toFixed(0));
    } else if (filterData) {
      setTotalHours(calculateTotalHours(filterData).toFixed(0));
    }
  }, [tasksData, filterData, active, active1, activeBtn]);

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
    const filteredData = tasksData?.filter(
      (item) => item.project?.projectName === project || project === "All"
    );

    const dueCount = filteredData?.filter(
      (item) => getStatus(item.startDate, item.deadline) === "Due"
    )?.length;
    const overdueCount = filteredData?.filter(
      (item) => getStatus(item.startDate, item.deadline) === "Overdue"
    )?.length;

    return { due: dueCount, overdue: overdueCount };
  };

  // --------------Status Length---------->
  const getStatusCount = (status, projectName) => {
    return tasksData?.filter((item) =>
      projectName === "All"
        ? item?.status === status
        : item?.status === status && item?.project?.projectName === projectName
    )?.length;
  };

  // --------------Filter Data By Department ----------->

  const filterByDep = (value) => {
    setFilterData("");

    if (value !== "All") {
      const filteredData = tasksData?.filter(
        (item) =>
          item.project?.projectName === value ||
          item.status === value ||
          item.jobHolder === value ||
          item._id === value
      );

      // console.log("FilterData", filteredData);

      setFilterData([...filteredData]);
    }
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
          getStatus(item.startDate, item.deadline) === value ||
          getStatus(item.startDate, item.deadline) === value
      );
    } else {
      filteredData = tasksData?.filter((item) => {
        const jobMatches = item.project?.projectName === proj;
        const statusMatches = item.status === value;
        const holderMatches = item.jobHolder === value;

        return (
          (holderMatches && jobMatches) ||
          (statusMatches && jobMatches) ||
          (jobMatches && getStatus(item.startDate, item.deadline) === value) ||
          (jobMatches && getStatus(item.startDate, item.deadline) === value)
        );
      });
    }

    setFilterData([...filteredData]);
  };

  // Update Filter
  // useEffect(() => {
  //   filterByProjStat(active1, active);

  //   // eslint-disable-next-line
  // }, [tasksData, filterData, active1, active]);

  // Filter By State
  const filterByState = (state) => {
    if (!state) {
      return;
    }
    setStateData("");

    const filteredData = tasksData?.filter((item) => item.status === state);

    setStateData([...filteredData]);
    console.log("stateData:", stateData);
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
          prevData?.map((item) =>
            item._id === updateTask._id ? updateTask : item
          )
        );

        if (active !== "All") {
          setFilterData((prevData) =>
            prevData?.map((item) =>
              item._id === updateTask._id ? updateTask : item
            )
          );
        }
      }
      // Send Socket Timer
      socketId.emit("addTask", {
        note: "New Task Added",
      });
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

        setTasksData((prevData) => {
          if (Array?.isArray(prevData)) {
            return prevData?.map((item) =>
              item?._id === updateTask?._id ? updateTask : item
            );
          } else {
            return [updateTask];
          }
        });

        getTasks1();
      }

      // Send Socket Timer
      // socketId.emit("addTask", {
      //   note: "New Task Added",
      // });
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
        setTasksData((prevData) =>
          prevData?.map((item) =>
            item._id === updateTask._id ? updateTask : item
          )
        );

        if (filterData) {
          setFilterData((prevData) =>
            prevData?.map((item) =>
              item?._id === updateTask?._id ? updateTask : item
            )
          );
        }
      }

      // Send Socket Timer
      getTasks1();
      // socketId.emit("addTask", {
      //   note: "New Task Added",
      // });
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
  useEffect(() => {
    if (searchValue) {
      const filteredData = tasksData.filter(
        (item) =>
          item?.task.toLowerCase().includes(searchValue.toLowerCase()) ||
          item?.jobHolder.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilterData(filteredData);
    } else {
      setFilterData(tasksData);
    }
  }, [searchValue, tasksData]);

  // -----------Copy Task------->

  const copyTask = async (originalTask) => {
    const taskCopy = { ...originalTask };
    taskCopy.task = "Enter Task Here";
    console.log("taskCopy", taskCopy);

    // delete taskCopy._id;
    // setTasksData((prevData) => [...prevData, taskCopy]);

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
        status: taskCopy?.status,
      }
    );
    if (data) {
      // Send Socket Timer
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

  // -----------Download in CSV------>
  const flattenData = (data) => {
    return data?.map((row) => ({
      projectName: row.project.projectName,
      jobHolder: row.jobHolder,
      task: row.task,
      hours: row.hours,
      startDate: format(new Date(row.startDate), "dd-MMM-yyyy"),
      deadline: format(new Date(row.deadline), "dd-MMM-yyyy") || "",
      status: row.status || "",
      lead: row.lead || "",
    }));
  };

  const handleExportData = () => {
    const csvData = flattenData(filterData ? filterData : tasksData);
    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
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
    const filteredData = tasksData?.filter((item) => item._id !== id);
    setTasksData(filteredData);

    if (active !== "All" && filterData) {
      const filterData1 = filterData?.filter((item) => item._id !== id);
      setFilterData(filterData1);
    }
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/delete/task/${id}`
      );
      if (data) {
        // getAllTasks();
        setShowDetail(false);
        toast.success("Task deleted successfully!");

        // Send Socket Timer
        socketId.emit("addTask", {
          note: "New Task Added",
        });
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
        if (filterId || active !== "All" || filterData || active1) {
          setFilterData((prevData = []) =>
            prevData?.map((item) =>
              item._id === id ? { ...item, label: { name, color } } : item
            )
          );
        }
        setTasksData((prevData = []) =>
          prevData?.map((item) =>
            item._id === id ? { ...item, label: { name, color } } : item
          )
        );

        if (name) {
          toast.success("label added!");
        } else {
          toast.success("label Updated!");
        }

        getTasks1();
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
        const updateTask = data?.task;
        setShowDetail(false);
        toast.success("Status completed successfully!");

        setTasksData((prevData) =>
          prevData.filter((item) => item._id !== updateTask._id)
        );
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

  // ----------------------Handle Drag & Drop Features-------->
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const updatedProjects = Array.from(projects);
    const [reorderedProject] = updatedProjects.splice(result.source.index, 1);
    updatedProjects.splice(result.destination.index, 0, reorderedProject);

    setProjects(updatedProjects);

    // Save the new order to the backend
    updateProjectOrderInDB(updatedProjects);
  };

  const updateProjectOrderInDB = async (updatedProjects) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/projects/reordering`,
        { projects: updatedProjects }
      );

      if (data) {
        toast.success("Reordering successfully!");
      }
    } catch (error) {
      console.log(error);
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
              className="w-full h-[2rem] rounded-md bg-transparent border-none outline-none    "
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
             
            if(showSubtaskId === row.original._id){
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

              <div  className="w-full   flex items-center justify-between gap-1 flex-row ">
              <div className="w-[90%] h-full ">
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

            <div className="w-[10%]">
              <span className={`${showSubtaskId === row.original._id ? "text-orange-500 " : row.original?.subtasksLength > 0 ? "text-blue-400" : "text-gray-500"} cursor-pointer hover:text-orange-500 transition-all `} onClick={() => {
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
                if (filterId || active || active1) {
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
                getTasks1();
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
            <div className="w-full flex   ">
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
          const statusData = ["To do", "Progress", "Review", "Awaiting", "On hold"];
          useEffect(() => {
            column.setFilterValue(state);
            console.log(state, "THE STATE VALUE IS >>")
          }, [state]);

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
                  onChange={(e) =>
                    column.setFilterValue(e.target.value || state)
                  }
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
                <option value="Awaiting">Awaiting</option>
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
          "Awaiting",
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
      // Timer
      {
        accessorKey: "timertracker",
        header: "Timer",
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
            setReload((prev) => !prev);
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
              onClick={() => setPlay(!play)}
            >
              <span className="text-[1rem] cursor-pointer  ">
                <Timer
                  ref={timerRef}
                  clientId={auth?.user?.id}
                  jobId={row?.original?._id}
                  setIsShow={setIsShow}
                  reload={reload}
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
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.original._id;

          return cellValue === filterValue;
        },
        filterVariant: "select",
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
    [
      users,
      play,
      note,
      auth,
      currentPath,
      projects,
      filterData,
      totalHours,
      tasksData,
      state,
    ]
  );

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);

    table.setGlobalFilter("");
    // table.resetColumnFilters();
  };





  const table = useMaterialReactTable({
    columns,
    data:
      (active === "All" && !active1 && !filterId && !searchValue
        ? tasksData
        : filterData) || [],
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
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection,  },
    // enableEditing: true,
    

        
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

  //  -----------Handle drag end---------
  const handleUserOnDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) return;

    const newTodos = Array.from(users);
    const [movedTodo] = newTodos.splice(source.index, 1);
    newTodos.splice(destination.index, 0, movedTodo);

    setUsers(newTodos);

    handleReorderingUsers(newTodos);
  };
  // Handle Reordering
  const handleReorderingUsers = async (newTodos) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/user/reordering`,
        { usersData: newTodos }
      );
      if (data) {
        toast.success("Reordering successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // Import CSV File
  // --------------Import Job data------------>
  const importJobData = async (file) => {
    setFLoading(true);
    if (!file) {
      toast.error("File is required!");
      setFLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (data) {
        getAllTasks();
        toast.success("Tasks Data imported successfully!");
      }
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error(
        error?.response?.data?.message || "Failed to import job data"
      );
    } finally {
      setFLoading(false);
    }
  };

  // Handle Bulk Action
  const updateBulkJob = async (e) => {
    e.preventDefault();
    setIsUpdate(true);
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/multiple`,
        {
          rowSelection: Object.keys(rowSelection).filter(
            (id) => rowSelection[id] === true
          ),
          projectId: project,
          jobHolder,
          lead,
          hours,
          startDate,
          deadline,
          status: tstatus,
        }
      );
      if (data) {
        getAllTasks();
        toast.success("Bulk Action updated successfully!");
        setRowSelection({});
        setProject("");
        setJobHolder("");
        setLead("");
        setHours("");
        setStartDate("");
        setDeadline("");
        setTStatus("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setIsUpdate(false);
      setShowEdit(false);
      setRowSelection({});
    }
  };



// To Change the total hours when filter is applied inside the table
useEffect(()=>{
  
  console.log("table.getFilteredRowModel().rows.length", table.getFilteredRowModel().rows.length)
  const showingRows = table.getFilteredRowModel().rows  
  setTotalHours((prev) => {

    const totalHours = showingRows.reduce((acc, row) => {
      const hours = row.original.hours;
      return acc + Number(hours);
    }, 0);

    return totalHours.toFixed(0); 


  })
}, [table.getFilteredRowModel().rows])




  const setColumnFromOutsideTable = (colKey, filterVal) => {

    const col = table.getColumn(colKey);
    return col.setFilterValue(filterVal);
  }



  // To see the document.title timer even if the filter is applied to the Jobholder | coz it will unmount the grid timer
  useEffect(() => {

    const col = table.getColumn("jobHolder");

    const filteredValue = col.getFilterValue();

    if(filteredValue === auth?.user?.name) {
      setShowActiveTimer(false)
    } else {
      console.log('set show timer trueeeee')
      setShowActiveTimer(true)
    }


  }, [table.getColumn("jobHolder").getFilterValue])


  

  return (
    <Layout>
      {!showCompleted ? (
        <div className=" relative w-full h-full overflow-auto py-4 px-2 sm:px-4">
          <div className="flex text-start sm:items-center sm:justify-between gap-4 flex-col sm:flex-row">
            <div className="flex items-center gap-5 ">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
                Tasks
              </h1>

              <span
                className={`p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400 mb-1 hover:rotate-180 `}
                onClick={() => {
                  setActive("All");
                  setFilterData("");
                  setActive1("");
                  // setActiveBtn("");
                  // setShowStatus(false);
                  // setShowJobHolder(false);
                  // setShowDue(false);
                  setFilterId("");
                  handleClearFilters();
                  filterByState(state);
                  setSearchValue("");
                }}
                title="Clear filters"
              >
                <IoClose className="h-6 w-6 text-white" />
              </span>
            </div>

            {/* Project Buttons */}
            <div className="flex items-center gap-4">
              {/*  */}
              {(auth?.user?.role?.name === "Admin" ||
                access.includes("Projects")) && (
                <div
                  className=" relative w-[8rem]    border-2 border-gray-200 rounded-md py-1 px-2 hidden sm:flex items-center justify-between gap-1"
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
                    <div
                      ref={closeProject}
                      className="absolute top-9 right-[-3.5rem] flex flex-col gap-2 max-h-[16rem] overflow-y-auto hidden1 z-[99] border rounded-sm shadow-sm bg-gray-50 py-2 px-2 w-[14rem]"
                    >
                      {projects &&
                        projects?.map((project) => (
                          <div
                            key={project._id}
                            className="w-full flex items-center justify-between gap-1 rounded-md bg-white border py-1 px-1 hover:bg-gray-100"
                          >
                            <p className="text-[13px] w-[8rem] ">
                              {project?.projectName}
                            </p>
                            <div className="flex items-center gap-1">
                              <span
                                title="Complete this Project"
                                onClick={() => handleUpdateStatus(project._id)}
                              >
                                <IoCheckmarkDoneCircleSharp className="h-5 w-5 cursor-pointer text-green-500 hover:text-green-600 transition-all duration-200" />
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
                  )}
                </div>
              )}
              <form>
                <input
                  type="file"
                  name="file"
                  onChange={(e) => importJobData(e.target.files[0])}
                  accept=".csv, .xlsx"
                  id="importJobs"
                  className="hidden"
                />
                <label
                  htmlFor="importJobs"
                  className={`${
                    style.button1
                  } !bg-gray-100 !shadow-none text-black hidden sm:flex  hover:bg-orange-500 text-[15px] ${
                    fLoading ? "cursor-not-allowed opacity-90" : ""
                  }`}
                  style={{ padding: ".4rem 1.1rem", color: "#000" }}
                  title={"Import csv or excel file!"}
                  onClick={(e) => fLoading && e.preventDefault()}
                >
                  {fLoading ? (
                    <TbLoader className="h-6 w-6 animate-spin text-black" />
                  ) : (
                    "Import"
                  )}
                </label>
              </form>
              <button
                className={`px-4 h-[2.2rem] hidden sm:flex items-center justify-center gap-1 rounded-md hover:shadow-md text-gray-800 bg-sky-100 hover:text-white hover:bg-sky-600 text-[15px] `}
                onClick={handleExportData}
                title="Export Date"
              >
                <LuImport className="h-6 w-6 " /> Export
              </button>
              <button
                className={`${style.button1} text-[15px] `}
                onClick={() => setShowlabel(true)}
                style={{ padding: ".4rem 1rem" }}
              >
                Add Label
              </button>
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
          <div className="flex flex-col gap-2 mt-3">
            {/* -----------Filters By Projects--------- */}
            <div className="flex items-center flex-row overflow-x-auto hidden1 gap-2 mt-3">
              <div
                className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                  active === "All" &&
                  " border-2 border-b-0 text-orange-600 border-gray-300"
                }`}
                onClick={() => {
                  setActive("All");
                  filterByDep("");
                  setShowCompleted(false);
                  setActive1("");
                  setFilterId("");
                  setFilterData("");
                }}
              >
                All ({getProjectsCount("All")})
              </div>

              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="projects" direction="horizontal">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex items-center gap-2 "
                    >
                      {projects?.map((proj, index) => (
                        <Draggable
                          key={proj._id}
                          draggableId={proj._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className={`py-1 rounded-tl-md rounded-tr-md px-1 w-fit cursor-pointer font-[500] text-[14px] ${
                                active === proj?.projectName &&
                                " border-2 border-b-0 text-orange-600 border-gray-300"
                              }`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => {
                                setFilterData("");
                                setActive(proj?.projectName);
                                filterByDep(proj?.projectName);
                                setShowCompleted(false);
                                setActive1("");
                                setFilterId("");
                              }}
                            >
                              {proj?.projectName} (
                              {getProjectsCount(proj?.projectName)})
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <div
                className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                  activeBtn === "completed" &&
                  showCompleted &&
                  " border-2 border-b-0 text-orange-600 border-gray-300"
                }`}
                onClick={() => {
                  setActiveBtn("completed");
                  setShowCompleted(true);
                  setActive("");
                }}
              >
                Completed
              </div>
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
              {/* <span
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
              </span> */}
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

              {/* Edit Multiple Tasks */}
              <span
                className={`hidden sm:block p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
                  showEdit && "bg-orange-500 text-white"
                }`}
                onClick={() => {
                  setShowEdit(!showEdit);
                }}
                title="Edit Multiple Tasks"
              >
                <MdOutlineModeEdit className="h-6 w-6  cursor-pointer" />
              </span>

              <span
                className={` p-[6px] rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
                onClick={() => {
                  getTasks1();
                  getAllProjects();
                  // setActive("All");
                  // setActiveBtn("");
                  // setActive1("");
                  setFilterId("");
                  // setShowStatus(false);
                  // setShowJobHolder(false);
                }}
                title="Refresh Data"
              >
                <GrUpdate
                  className={`h-5 w-5  cursor-pointer ${
                    isLoad && "animate-spin text-sky-500"
                  }`}
                />
              </span>
            </div>
            {/*  */}
            <hr className="mb-1 bg-gray-300 w-full h-[1px]" />

            {/* ----------Job_Holder Summery Filters---------- */}
            {showJobHolder && activeBtn === "jobHolder" && (
              <>
                <div className="w-full  py-2 ">
                  <div className="flex items-center flex-wrap gap-4">
                    <DragDropContext onDragEnd={handleUserOnDragEnd}>
                      <Droppable droppableId="users" direction="horizontal">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="flex items-center gap-2 overflow-x-auto hidden1"
                          >
                            {users
                              ?.filter(
                                (user) =>
                                  getJobHolderCount(user?.name, active) > 0
                              )
                              ?.map((user, index) => (
                                <Draggable
                                  key={user._id}
                                  draggableId={user._id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      className={`py-1 rounded-tl-md w-[5.8rem] sm:w-fit rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                                        active1 === user.name &&
                                        "  border-b-2 text-orange-600 border-orange-600"
                                      }`}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => {
                                        setActive1(user?.name);
                                        filterByProjStat(user?.name, active);
                                        setColumnFromOutsideTable('status', 'Progress');
                                        setColumnFromOutsideTable('jobHolder', user?.name);
                                        
                                      }}
                                    >
                                      {user.name} (
                                      {getJobHolderCount(user?.name, active)})
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>
                <hr className="mb-1 bg-gray-300 w-full h-[1px]" />
              </>
            )}

            {/* ----------Date Status Summery Filters---------- */}
            {showDue && activeBtn === "due" && (
              <>
                <div className="w-full py-2">
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
                <div className="w-full py-2 flex items-center overflow-x-auto hidden1 gap-2 ">
                  <div className="flex items-center  gap-4">
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

                  <div className="flex items-center gap-4">
                    {status?.map((stat, i) => (
                      <div
                        className={`py-1 rounded-tl-md min-w-[4rem] sm:min-w-fit rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
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
            {/* ----------Bulk Action--------> */}

            {showEdit && (
              <div className="w-full  py-2">
                <form
                  onSubmit={updateBulkJob}
                  className="w-full flex items-center flex-wrap gap-2 "
                >
                  <div className="">
                    <select
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className={`${style.input} w-full`}
                      style={{ width: "8rem" }}
                    >
                      <option value="empty">Project</option>
                      {projects.map((project, i) => (
                        <option value={project._id} key={i}>
                          {project.projectName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="">
                    <select
                      value={jobHolder}
                      onChange={(e) => setJobHolder(e.target.value)}
                      className={`${style.input} w-full`}
                      style={{ width: "7rem" }}
                    >
                      <option value="empty">Assign</option>
                      {users.map((jobHold, i) => (
                        <option value={jobHold.name} key={i}>
                          {jobHold.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="">
                    <select
                      value={lead}
                      onChange={(e) => setLead(e.target.value)}
                      className={`${style.input} w-full`}
                      style={{ width: "7rem" }}
                    >
                      <option value="empty">Owner</option>
                      {users.map((jobHold, i) => (
                        <option value={jobHold.name} key={i}>
                          {jobHold.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="inputBox" style={{ width: "8.5rem" }}>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`${style.input} w-full `}
                    />
                    <span>Start Date</span>
                  </div>
                  <div className="inputBox" style={{ width: "8.5rem" }}>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className={`${style.input} w-full `}
                    />
                    <span>Deadline</span>
                  </div>

                  {/*  */}
                  <div className="">
                    <select
                      value={tstatus}
                      onChange={(e) => setTStatus(e.target.value)}
                      className={`${style.input} w-full`}
                      style={{ width: "6.5rem" }}
                    >
                      <option value="empty">Status</option>
                      {status.map((stat, i) => (
                        <option value={stat} key={i}>
                          {stat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="inputBox" style={{ width: "6rem" }}>
                    <input
                      type="text"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className={`${style.input} w-full `}
                    />
                    <span>Hours</span>
                  </div>
                  {/* <div className="">
                <select
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "9rem" }}
                >
                  <option value="empty">Select Label</option>
                  {labelData?.map((label, i) => (
                    <option value={label._id} key={i}>
                      {label?.name}
                    </option>
                  ))}
                </select>
              </div> */}
                  <div className="flex items-center justify-end pl-4">
                    <button
                      className={`${style.button1} text-[15px] `}
                      type="submit"
                      disabled={isUpload}
                      style={{ padding: ".5rem 1rem" }}
                    >
                      {isUpload ? (
                        <TbLoader2 className="h-5 w-5 animate-spin text-white" />
                      ) : (
                        <span>Save</span>
                      )}
                    </button>
                  </div>
                </form>
                <hr className="mb-1 bg-gray-300 w-full h-[1px] mt-4" />
              </div>
            )}
            {/* <hr className="mb-1 bg-gray-300 w-full h-[1px]" /> */}
            {loading ? (
              <div className="flex items-center justify-center w-full h-screen px-4 py-4">
                <Loader />
              </div>
            ) : (
              <div className="w-full min-h-[10vh] relative -mt-[10px] ">
                <div className="h-full hidden1 overflow-y-scroll relative">
                  <MaterialReactTable table={table}   />
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
                getTasks1={getTasks1}
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
            <div className="fixed right-0 top-[3.8rem] z-[999] bg-gray-100 w-[97%] sm:w-[33%] 3xl:w-[22%]  h-[calc(103vh-0rem)] py-3 px-3 ">
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
                setFilterData={setFilterData}
                tasksData={tasksData}
                
                assignedPerson = {(table.getRow(taskID)).original.jobHolder}
              />
            </div>
          )}

          {/* ---- */}
        </div>
      ) : (
        <CompletedTasks
          setShowCompleted={setShowCompleted}
          setActive2={setActive}
          getTasks={getAllTasks}
          getAllProj1={getAllProjects}
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

      {
        showActiveTimer && <ActiveTimer />
      }
      
    </Layout>
  );
};

export default AllTasks;





// bg-gradient-to-br from-[#ffe4e6] 