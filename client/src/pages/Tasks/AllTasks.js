import React, { useEffect, useMemo, useRef, useState } from "react";

import { style } from "../../utlis/CommonStyle";
import axios from "axios";
import AddProjectModal from "../../components/Tasks/AddProjectModal";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { IoBriefcaseOutline, IoClose } from "react-icons/io5";
import { MdAutoGraph, MdOutlineModeEdit } from "react-icons/md";

import Swal from "sweetalert2";
import toast from "react-hot-toast";

import { TbLoader, TbLoader2 } from "react-icons/tb";
import CompletedTasks from "./CompletedTasks";
import AddTaskModal from "../../components/Tasks/AddTaskModal";
import { useMaterialReactTable } from "material-react-table";
import Loader from "../../utlis/Loader";
import { format } from "date-fns";

import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { mkConfig, generateCsv, download } from "export-to-csv";
import JobCommentModal from "../Jobs/JobCommentModal";
import AddLabel from "../../components/Modals/AddLabel";
import TaskDetail from "./TaskDetail";
import { GrUpdate } from "react-icons/gr";
import { LuImport } from "react-icons/lu";

import { ActiveTimer } from "../../utlis/ActiveTimer";

import QuickAccess from "../../utlis/QuickAccess";
import SubtasksForNote from "./SubtasksForNote";
import { filterByRowId } from "../../utlis/filterByRowId";

import { useDispatch, useSelector } from "react-redux";
import { setFilterId, setSearchValue } from "../../redux/slices/authSlice";

import { useSocket } from "../../context/socketProvider";
import AddTaskDepartmentModal from "../../components/Tasks/AddTaskDepartmentModal";
import ProjectDropdown from "./components/ProjectsDropdown/ProjectDropdown";
import DepartmentDropdown from "./components/DepartmentsDropdown/DepartmentDropdown";
import DraggableFilterTabs from "./DraggableFilterTabs";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { useClickOutside } from "../../utlis/useClickOutside";
import { getTaskColumns } from "./table/columns";
import { TasksTable } from "./table/TasksTable";
import OverviewForPages from "../../utlis/overview/OverviewForPages";
import { isAdmin } from "../../utlis/isAdmin";

const colVisibility = {
  departmentName: true,
  projectName: true,
  jobHolder: true,
  task: true,
  hours: true,
  startDate: true,
  deadline: true,
  taskDate: true,
  datestatus: true,

  status: true,
  lead: true,
  estimate_Time: true,
  timertracker: true,
  comments: true,

  actions: true,
  labal: true,
  recurring: true,
};

function useColumnFilterSync(table, columnId, value, setValue) {
  useEffect(() => {
    if (!table) return;
    const col = table.getColumn(columnId);
    if (!col) return;

    const val = col.getFilterValue() || "";
    if (val !== value) setValue(val);
  }, [table, columnId, table.getState().columnFilters, value, setValue]);

  // For outside → table, just call this instead of another effect:
  const updateFilter = (val) => {
    table.getColumn(columnId)?.setFilterValue(val || undefined);
    setValue(val);
  };

  return updateFilter;
}

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

const AllTasks = ({ justShowTable = false }) => {
  const { auth, filterId, anyTimerRunning, searchValue, jid } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const [openAddDepartment, setOpenAddDepartment] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [showDepartment, setShowDepartment] = useState(false);

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

  const [filter1, setFilter1] = useState("");
  const [filter2, setFilter2] = useState("");
  const [filter3, setFilter3] = useState("");

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
  const [taskDate, setTaskDate] = useState("");
  const [tstatus, setTStatus] = useState("");
  const [isUpload, setIsUpdate] = useState(false);
  const [reload, setReload] = useState(false);

  // console.log("tasksData:", tasksData);

  const [taskIdForNote, setTaskIdForNote] = useState("");

  const [showActiveTimer, setShowActiveTimer] = useState(false);

  const [searchParams] = useSearchParams();
  const comment_taskId = searchParams.get("comment_taskId");
  const show_completed = searchParams.get("completed");
  const navigate = useNavigate();




  const [showcolumn, setShowColumn] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    _id: false,
    ...colVisibility,
  });

  const showColumnRef = useRef(false);

  useClickOutside(showColumnRef, () => setShowColumn(false));

  useEffect(() => {
    // Load saved column visibility from localStorage
    const savedVisibility = JSON.parse(
      localStorage.getItem("visibileTasksColumn")
    );

    if (savedVisibility) {
      setColumnVisibility(savedVisibility);
    }
  }, []);

  const toggleColumnVisibility = (column) => {
    const updatedVisibility = {
      ...columnVisibility,
      [column]: !columnVisibility[column],
    };
    setColumnVisibility(updatedVisibility);
    localStorage.setItem(
      "visibileTasksColumn",
      JSON.stringify(updatedVisibility)
    );
  };

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 30, // ✅ default page size
  });

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("task_updated", () => {
      getAllTasks();
    });
  }, [socket]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape key shortcut
      if (e.key === "Escape") {
        setShowDetail(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
  }, [auth]);

  //---------- Get All Projects-----------
  const getAllDepartments = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/department`
      );
      if (data?.success) {
        if (auth?.user?.role?.name === "Admin") {
          // Admin: show all
          setDepartments(data?.departments || []);
        } else {
          // Non-admin: only include departments linked to projects user is in
          const userProjects = allProjects.filter((project) =>
            project.users_list.some((user) => user._id === auth?.user?.id)
          );

          // Collect all department IDs from user's projects
          const projectDepartmentIds = userProjects
            .flatMap((proj) => proj.departments?.map((d) => d._id)) // many-to-many
            .filter(Boolean);

          // Deduplicate IDs (in case user has multiple projects in the same department)
          const uniqueDeptIds = [...new Set(projectDepartmentIds)];

          // Filter the full department list based on user's accessible departments
          const filteredDepartments = data.departments.filter((dep) =>
            uniqueDeptIds.includes(dep._id)
          );

          setDepartments(filteredDepartments || []);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth) {
      getAllDepartments();
    }
  }, [auth, allProjects]);

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

  console.log("TASKS💛💛💛", tasksData);
  const getDepartmentTaskCount = (departmentId, tasks) => {
    return tasks.filter(
      (task) => task.project?.department?._id === departmentId
    ).length;
  };

  const getProjectTaskCount = (projectId, tasks) => {
    return tasks.filter((task) => task.project?._id === projectId).length;
  };

  const getUserTaskCount = (userName, tasks) => {
    return tasks.filter((task) => task.jobHolder === userName).length;
  };

  // const getProjectsCount = (project) => {
  //   if (project === "All") {
  //     return tasksData?.length;
  //   }
  //   return tasksData.filter((item) => item?.project?.projectName === project)
  //     ?.length;
  // };

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

      // socketId.emit("notification", {
      //       title: "Task  Updated",
      //     });
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
    deadline,
    taskDate
  ) => {
    if (!taskId) {
      toast.error("Project/Task id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/allocate/task/${taskId}`,
        { allocateTask, startDate, deadline, taskDate }
      );
      if (data?.success) {
        const updateTask = data?.task;
        toast.success("Task updated successfully!");
        setTasksData((prevData) =>
          prevData?.map((item) =>
            item._id === updateTask._id ? updateTask : item
          )
        );
        
        if (Array.isArray(filterData)) {
          setFilterData((prevData) =>
            Array.isArray(prevData)
              ? prevData.map((item) =>
                  item?._id === updateTask?._id ? updateTask : item
                )
              : [updateTask] // fallback if somehow prevData isn't an array
          );
        }
      }

      getTasks1();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const getStatus = (startDateOfTask, deadlineOfTask) => {
    const startDate = new Date(startDateOfTask);
    const deadline = new Date(deadlineOfTask);
    const today = new Date();

    // Remove time parts for accurate date comparison
    startDate.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (deadline < today) {
      return "Overdue";
    } else if (startDate <= today && !(deadline < today)) {
      return "Due";
    } else {
      return "Upcoming";
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
      toast.success("Task copied successfully!");
      setTasksData((prevData) => [...prevData, data?.task]);
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
        // socketId.emit("addTask", {
        //   note: "New Task Added",
        // });
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

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

        setTasksData((prevData = []) => {
          console.log("PREVDATA", prevData);
          return prevData.filter((item) => item._id !== updateTask._id);
        });

        if (filterData) {
          setFilterData((prevData = []) => {
            console.log("PREVDATA 2💜💜💜💙💚💚💛💛", prevData);
            return prevData.filter((item) => item._id !== updateTask._id);
          });
        }
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

  // ----------------------------
  // 🔑 Authentication & User Data
  // ----------------------------
  const authCtx = useMemo(
    () => ({
      auth,
      users,
      departments,
    }),
    [auth, users, departments]
  );

  // ----------------------------
  // 📂 Projects
  // ----------------------------
  const projectCtx = useMemo(
    () => ({
      allProjects,
      updateTaskProject,
      updateTaskJLS,
      updateAlocateTask,
    }),
    [allProjects]
  );

  // ----------------------------
  // 📊 Tasks / Filtering
  // ----------------------------
  const taskCtx = useMemo(
    () => ({
      totalHours,
      filterId,
      active,
      active1,
      setFilterData,
      setTasksData,
      setTaskID,
      setProjectName,
      setShowDetail,
      copyTask,
      handleCompleteStatus,
      handleDeleteTaskConfirmation,
    }),
    [totalHours, filterId, active, active1]
  );

  // ----------------------------
  // 💬 Comments
  // ----------------------------
  const commentCtx = useMemo(
    () => ({
      comment_taskId,
      setCommentTaskId,
      setIsComment,
    }),
    [comment_taskId]
  );

  // ----------------------------
  // ⏱️ Timer / Tracking
  // ----------------------------
  const timerCtx = useMemo(
    () => ({
      anyTimerRunning,
      timerId,
      jid,
      play,
      reload,
      note,
      currentPath,
      activity,
      taskIdForNote,
      timerRef,
      setIsShow,
      setReload,
      setPlay,
      setNote,
      setActivity,
      setTaskIdForNote,
    }),
    [
      anyTimerRunning,
      timerId,
      jid,
      play,
      reload,
      note,
      currentPath,
      activity,
      taskIdForNote,
      timerRef,
    ]
  );

  // ----------------------------
  // 🏷️ Labels
  // ----------------------------
  const labelCtx = useMemo(
    () => ({
      labelData,
      addlabelTask,
    }),
    [labelData]
  );

  // ----------------------------
  // 📦 Merge into one ctx if needed
  // ----------------------------
  const ctx = useMemo(
    () => ({
      ...authCtx,
      ...projectCtx,
      ...taskCtx,
      ...commentCtx,
      ...timerCtx,
      ...labelCtx,
    }),
    [authCtx, projectCtx, taskCtx, commentCtx, timerCtx, labelCtx]
  );

  // ----------------------------
  // 📑 Columns
  // ----------------------------
  const columns = useMemo(() => getTaskColumns(ctx), [ctx]);

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

    // enableEditing: true,

    state: {
      rowSelection,
      pagination,
      density: "compact",
      columnVisibility: columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination, // ✅ Hook for page changes
    autoResetPageIndex: false,
    enablePagination: true,
    initialState: {
      // pagination: { pageSize: 20 },
      // pageSize: 20,
      // density: "compact",
      // columnVisibility: {
      //   _id: false
      // }
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
        // border: "1px solid rgba(81, 81, 81, .5)",
        caption: {
          captionSide: "top",
        },
      },
    },
  });

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
          taskDate,
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
        setTaskDate("")
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
  useEffect(() => {
    console.log(
      "table.getFilteredRowModel().rows.length",
      table.getFilteredRowModel().rows.length
    );
    const showingRows = table.getFilteredRowModel().rows;
    setTotalHours((prev) => {
      const totalHours = showingRows.reduce((acc, row) => {
        const hours = row.original.hours;
        return acc + Number(hours);
      }, 0);

      return totalHours.toFixed(0);
    });
  }, [table.getFilteredRowModel().rows]);

  const setColumnFromOutsideTable = (colKey, filterVal) => {
    const col = table.getColumn(colKey);
    return col.setFilterValue(filterVal);
  };

  // To see the document.title timer even if the filter is applied to the Jobholder | coz it will unmount the grid timer
  useEffect(() => {
    const col = table.getColumn("jobHolder");

    const filteredValue = col.getFilterValue();

    if (filteredValue === auth?.user?.name) {
      setShowActiveTimer(false);
    } else {
      console.log("set show timer trueeeee");
      setShowActiveTimer(true);
    }
  }, [table.getColumn("jobHolder").getFilterValue]);

  useEffect(() => {
    if (auth.user?.role?.name === "Admin") {
      console.log("Admin Role Detected, setting showJobHolder to true💛💛🧡🧡");
      setShowJobHolder(true);
      setActiveBtn("jobHolder");

      setActive1(auth?.user?.name);

      // setColumnFromOutsideTable("taskDate", "Today");
    }
  }, []);

  useEffect(() => {
    if (comment_taskId) {
      filterByRowId(table, comment_taskId, setCommentTaskId, setIsComment);

      // searchParams.delete("comment_taskId");
      // navigate({ search: searchParams.toString() }, { replace: true });
    }
  }, [comment_taskId, searchParams, navigate, table]);

  
  useEffect(() => {
    if (show_completed) {

      setActiveBtn("completed");
                  setShowCompleted(true);
                  setActive("");

    }
  }, [show_completed])

  

  const renderColumnControls = () => (
    <div className="flex flex-col gap-3 bg-white rounded-md border p-4">
      {Object.keys(colVisibility)?.map((column) => (
        <div key={column} className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={columnVisibility[column]}
              onChange={() => toggleColumnVisibility(column)}
              className="mr-2 accent-orange-600 h-4 w-4"
            />
            {column}
          </label>
        </div>
      ))}
    </div>
  );

  // const columnFilters = table.getState().columnFilters;

  // useEffect(() => {
  //   if (!table) return;

  //   const col = table.getColumn("departmentName");
  //   if (!col) return;

  //   const val = col.getFilterValue() || "";

  //   if(!val) return
  //   if (val !== filter1) {
  //     setFilter1(val);
  //   }
  // }, [table, columnFilters]);

  // useEffect(() => {
  //   if (!table) return;

  //   const col = table.getColumn("projectName");
  //   if (!col) return;

  //   const val = col.getFilterValue() || "";

  //   if (val !== filter2) {
  //     setFilter2(val);
  //   }
  // }, [table, columnFilters]);

  // useEffect(() => {
  //   if (!table) return;

  //   const col = table.getColumn("jobHolder");
  //   if (!col) return;

  //   const val = col.getFilterValue() || "";

  //   if (val !== filter3) {
  //     setFilter3(val);
  //   }
  // }, [table, columnFilters]);

  // Hook returns an updater for each column
  const updateDepartment = useColumnFilterSync(
    table,
    "departmentName",
    filter1,
    setFilter1
  );
  const updateProject = useColumnFilterSync(
    table,
    "projectName",
    filter2,
    setFilter2
  );
  const updateJobHolder = useColumnFilterSync(
    table,
    "jobHolder",
    filter3,
    setFilter3
  );

  // helper to check if "all departments" are selected
  const allDepartmentsSelected =
    filter1 === "" ||
    filter1 === "All" ||
    (Array.isArray(filter1) && filter1.length === departments.length);

 

  return (
    <>
      {!showCompleted ? (
        <div className=" relative w-full h-full overflow-auto py-4 px-2 sm:px-4">
          <div className="flex text-start sm:items-center sm:justify-between gap-4 flex-col sm:flex-row">
            <div className="flex items-center gap-3 ">
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
                  dispatch(setFilterId(""));
                  handleClearFilters();
                  filterByState(state);
                  dispatch(setSearchValue(""));
                }}
                title="Clear filters"
              >
                <IoClose className="h-6 w-6 text-white" />
              </span>



                
              <span >
                <QuickAccess />
              </span>

                {isAdmin(auth) && <span className=" mb-2"> <OverviewForPages /> </span>}
                
            </div>

            {/* Project Buttons */}
            <div className="flex items-center gap-4">
              {auth?.user?.role?.name === "Admin" && (
                <div
                  className=" relative w-[8rem]    border-2 border-gray-200 rounded-md py-1 px-2 hidden sm:flex items-center justify-between gap-1"
                  onClick={() => setShowDepartment(!showDepartment)}
                >
                  <span className="text-[15px] text-gray-900 cursor-pointer">
                    Departments
                  </span>
                  <span
                    onClick={() => setShowDepartment(!showDepartment)}
                    className="cursor-pointer"
                  >
                    {!showDepartment ? (
                      <IoIosArrowDown className="h-5 w-5 text-black cursor-pointer" />
                    ) : (
                      <IoIosArrowUp className="h-5 w-5 text-black cursor-pointer" />
                    )}
                  </span>

                  {/* -----------Departments------- */}
                  <DepartmentDropdown
                    showDepartment={showDepartment}
                    departments={departments}
                    getAllDepartments={getAllDepartments}
                    setShowDepartment={setShowDepartment}
                    setDepartmentId={setDepartmentId}
                    setOpenAddDepartment={setOpenAddDepartment}
                  />
                </div>
              )}

              {/*  */}
              {auth?.user?.role?.name === "Admin" && (
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
                  <ProjectDropdown
                    showProject={showProject}
                    projects={projects}
                    getAllProjects={getAllProjects}
                    getAllTasks={getAllTasks}
                    setShowProject={setShowProject}
                    setProjectId={setProjectId}
                    setOpenAddProject={setOpenAddProject}
                  />
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
                onClick={() => setOpenAddDepartment(true)}
                style={{ padding: ".4rem 1rem" }}
              >
                Add Department
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
            <div className="flex items-center flex-row overflow-x-auto hidden1 gap-2 mt-3 max-lg:hidden">
              <div
                className={`py-1 rounded-tl-md rounded-tr-md px-1 cursor-pointer font-[500] text-[14px] ${
                  allDepartmentsSelected &&
                  " border-2 border-b-0 text-orange-600 border-gray-300"
                }`}
                onClick={() => {
                  setShowCompleted(false);

                  // clear all filters when clicking "All"
                  updateDepartment("");
                  updateProject("");
                  updateJobHolder("");

                  setFilter1("All");
                }}
              >
                All
              </div>

              <DraggableFilterTabs
                droppableId={"departments"}
                items={departments}
                filterValue={filter1}
                tasks={tasksData}
                getCountFn={(department, tasks) =>
                  tasks.filter((t) =>
                    t.project?.departments?.some(
                      (d) => d._id === department?._id
                    )
                  ).length
                }
                getLabelFn={(department) => department?.departmentName}
                // onClick={
                //   (department) => setFilter1((prev) => {
                //     const isSameUser = prev === department?.departmentName;
                //     const newValue = isSameUser ? "" : department?.departmentName;

                //       setColumnFromOutsideTable("departmentName", newValue);

                //        setColumnFromOutsideTable("projectName", "");
                //        setColumnFromOutsideTable("jobHolder", "");
                //     return newValue;
                //   })
                // }

                onClick={(dep) => {
                  const newValue =
                    filter1 === dep.departmentName ? "" : dep.departmentName;
                  updateDepartment(newValue);
                  updateProject(""); // reset project filter when department changes
                  updateJobHolder(""); // reset jobHolder filter when department changes
                }}
                onDragEnd={() => {}}
                activeClassName={
                  filter1
                    ? "border-2 border-b-0 text-orange-600 border-gray-300"
                    : ""
                }
              />

              {/* <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="departments" direction="horizontal">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex items-center gap-2 "
                    >
                      {departments?.map((dpt, index) => (
                        <Draggable
                          key={dpt._id}
                          draggableId={dpt._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className={`py-1 rounded-tl-md rounded-tr-md px-1 w-fit cursor-pointer font-[500] text-[14px] ${
                                filter1 === dpt?.departmentName &&
                                " border-2 border-b-0 text-orange-600 border-gray-300"
                              }`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => {
                                setFilterData("");
                                setActive(dpt?.departmentName);
                                filterByDep(dpt?.departmentName);

                                setShowCompleted(false);
                                setActive1("");

                                dispatch(setFilterId(""));

                                setColumnFromOutsideTable('departmentName', dpt?.departmentName);
                                setColumnFromOutsideTable('jobHolder', "");

                                 setFilter1((prev) => {
                                    const isSameUser = prev === dpt?.departmentName;
                                    const newValue = isSameUser ? "" : dpt?.departmentName;

                                    setColumnFromOutsideTable("departmentName", newValue);
                                    return newValue;
                                  });
                              }}
                            >
                              {dpt?.departmentName} (
                                {getDepartmentTaskCount(dpt._id, tasksData)}
                             
                              )
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext> */}

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
                  activeBtn === "jobHolder" &&
                  showJobHolder &&
                  "bg-orange-500 text-white"
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

              <div className="relative">
                <div
                  className={`  p-[6px] rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border ${
                    showcolumn && "bg-orange-500 text-white"
                  }`}
                  onClick={() => setShowColumn(!showcolumn)}
                >
                  {" "}
                  {showcolumn ? (
                    <GoEyeClosed className="h-5 w-5" />
                  ) : (
                    <GoEye className="h-5 w-5" />
                  )}{" "}
                </div>
                {showcolumn && (
                  <div
                    ref={showColumnRef}
                    className="fixed top-32 left-[50%] z-[9999]    w-[12rem]"
                  >
                    {renderColumnControls()}
                  </div>
                )}
              </div>

              <span
                className={` p-[6px] rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
                onClick={() => {
                  getTasks1();
                  getAllProjects();
                  // setActive("All");
                  // setActiveBtn("");
                  // setActive1("");
                  //setFilterId("");
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
            <hr className="mb-1 bg-gray-300 w-full h-[1px] max-lg:hidden" />

            {/* ----------Job_Holder Summery Filters---------- */}
            {showJobHolder && activeBtn === "jobHolder" && (
              <>
                <div className="w-full  py-2 max-lg:hidden ">
                  <div className="flex items-center flex-wrap gap-4">
                    <DraggableFilterTabs
                      droppableId={"users"}
                      // items={filter2 ? projectUsers.filter(user => getJobHolderCount(user?.name, active) > 0) : users.filter(user => getJobHolderCount(user?.name, active) > 0)}
                      items={users.filter(
                        (user) => getJobHolderCount(user?.name, active) > 0
                      )}
                      filterValue={filter3}
                      tasks={tasksData}
                      getCountFn={(user, tasks) =>
                        tasks.filter((t) => t.jobHolder === user.name).length
                      }
                      getLabelFn={(user) => user.name}
                      onClick={(user) => {
                        const newValue =
                          filter3 === user?.name ? "" : user?.name;

                        updateJobHolder(newValue); // reset jobHolder filter when department changes

                        setColumnFromOutsideTable("status", "Progress");

                        setColumnFromOutsideTable("taskDate", "");
                        if (
                          auth.user?.role?.name === "Admin" &&
                          user?.name === auth?.user?.name
                        ) {
                          setColumnFromOutsideTable("taskDate", "Today");
                        }
                      }}
                      activeClassName={
                        filter3
                          ? "border-b-2 text-orange-600 border-orange-600"
                          : ""
                      }
                    />
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

                  <div className="inputBox" style={{ width: "8.5rem" }}>
                    <input
                      type="date"
                      value={taskDate}
                      onChange={(e) => setTaskDate(e.target.value)}
                      className={`${style.input} w-full `}
                    />
                    <span>Task Date</span>
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
              <TasksTable table={table} />
            )}
          </div>

          {/* ----------------Add Task Department-------- */}
          {openAddDepartment && (
            <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
              <AddTaskDepartmentModal
                users={users}
                setOpenAddDepartment={setOpenAddDepartment}
                getAllDepartments={getAllDepartments}
                departmentId={departmentId}
                setDepartmentId={setDepartmentId}
                getTasks1={getTasks1}
              />
            </div>
          )}

          {/* ----------------Add Project-------- */}
          {openAddProject && (
            <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
              <AddProjectModal
                users={users}
                setOpenAddProject={setOpenAddProject}
                getAllProjects={getAllProjects}
                projectId={projectId}
                setProjectId={setProjectId}
                getTasks1={getTasks1}
                departments={departments}
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
                  <hr className="w-full  h-[1px] bg-gray-500 " />
                  <div className="flex  justify-start items-center gap-4   px-4 py-2 ">
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

                    <SubtasksForNote
                      taskId={taskIdForNote}
                      onSelect={(option) => setNote(option)}
                    />
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
            <div className="fixed inset-0 z-[499] flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-gray-100 rounded-xl shadow-lg w-[95%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[70%] 3xl:w-[60%]    py-4 px-5   ">
                <div className="h-full w-full flex flex-col justify-start items-center relative">

                  <div className="flex items-center justify-between border-b pb-2 mb-3 self-start w-full">
                  <h3 className="text-lg font-semibold">Project: {projectName}</h3>
                  <button
                    className="p-1 rounded-2xl bg-gray-50 border hover:shadow-md hover:bg-gray-100"
                    onClick={() => setShowDetail(false)}
                  >
                    <IoClose className="h-5 w-5" />
                  </button>
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
                  assignedPerson={table.getRow(taskID).original.jobHolder}
                  setTaskIdForNote={setTaskIdForNote}
                   
                />

                </div>
              </div>
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

      {showActiveTimer && <ActiveTimer />}
    </>
  );
};

export default AllTasks;
