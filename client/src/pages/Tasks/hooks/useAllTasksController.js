import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useLocation, useSearchParams } from "react-router-dom";
import { generateCsv, download } from "export-to-csv";
import { useDispatch, useSelector } from "react-redux";

import { setFilterId, setSearchValue } from "../../../redux/slices/authSlice";
import { openModal } from "../../../redux/slices/globalModalSlice";
import { useSocket } from "../../../context/socketProvider";
import { isAdmin } from "../../../utlis/isAdmin";
import { usePersistedUsersNew } from "../../../hooks/usePersistedUsersNew";
import { useSavedFilters } from "../../../components/SavedFilters/useSavedFilters";
import { csvConfig } from "../constants";
import { useTaskFilters } from "./useTaskFilters";
import { useTasksData } from "./useTasksData";
import { useTaskStats } from "./useTaskStats";
import { useTaskActions } from "./useTaskActions";

export function useAllTasksController() {
  const dispatch = useDispatch();
  const location = useLocation();
  const socket = useSocket();
  const currentPath = location.pathname;
  const [searchParams, setSearchParams] = useSearchParams();
  const comment_taskId = searchParams.get("comment_taskId");
  const taskIdQueryParam = searchParams.get("taskId");

  const { auth, anyTimerRunning, searchValue, jid } = useSelector(
    (state) => state.auth,
  );

  // ─────────── Shared state ───────────
  const [isOpen, setIsOpen] = useState(false); // add task modal
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [openAddDepartment, setOpenAddDepartment] = useState(false);
  const [departmentId, setDepartmentId] = useState("");
  const [showDepartment, setShowDepartment] = useState(false);

  const [openAddProject, setOpenAddProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [showProject, setShowProject] = useState(false);
  const [allProjects, setAllProjects] = useState([]);

  // timer / stop-note modal
  const timerRef = useRef();
  const [isShow, setIsShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskIdForNote, setTaskIdForNote] = useState("");
  const [note, setNote] = useState("");
  const [activity, setActivity] = useState("Chargeable");
  const [timerId, setTimerId] = useState("");

  // comments
  const [isComment, setIsComment] = useState(false);
  const [commentAnchorEl, setCommentAnchorEl] = useState(null);
  const [commentTaskId, setCommentTaskId] = useState("");
  const closeComment = () => {
    setIsComment(false);
    setCommentAnchorEl(null);
  };

  // detail
  const [showDetail, setShowDetail] = useState(false);
  const [taskID, setTaskID] = useState("");
  const [projectName, setProjectName] = useState("");

  const [taskId, setTaskId] = useState("");
  const [totalHours, setTotalHours] = useState(0);
  const [fLoading, setFLoading] = useState(false);
  const [labelData, setLabelData] = useState([]);
  const [showlabel, setShowlabel] = useState(false);

  // filters / pagination
  const [status, setStatus] = useState("progress");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [activeFilter, setActiveFilter] = useState(null);

  const [columnFilters, setColumnFilters] = useState(() => {
    const userName = auth?.user?.name;
    const filters = [];

    filters.push({ id: "taskStatus", value: "Progress" });

    if (!isAdmin(auth)) {
      filters.push({ id: "jobHolder", value: userName });
    }

    if (isAdmin(auth)) {
      filters.push({
        id: "taskDate",
        value: { type: "preset", value: "Today" },
      });
    }

    return filters;
  });

  const { selectedUsers, setSelectedUsers } = usePersistedUsersNew({
    storage_key: "tasks:selected_users",
    users: users,
    current_user: auth?.user,
  });

  // ─────────── Data hooks ───────────
  const { dueStatusFilter, jobHolderFilter, taskStatusFilter, projectFilter } =
    useTaskFilters(columnFilters);

  const { tasksData, loading, refetchTasks, rowCount, setTasksData } =
    useTasksData({
      pagination,
      searchValue,
      columnFilters,
      status,
      taskIdQueryParam,
    });

  const {
    refetchStats,
    taskStats,
    getuserTaskCounts,
    getTaskStatusTaskCounts,
    getdueStatusCounts,
    getProjectTaskCounts,
  } = useTaskStats({ columnFilters, status });

  const {
    deleteTask,
    updateTaskJLS,
    updateTaskProject,
    copyTask,
    updateAlocateTask,
    addlabelTask,
    handleStatusComplete,
    updateAllocatedTime,
  } = useTaskActions({ refetchStats, refetchTasks });

  const savedFiltersHook = useSavedFilters("tasks");
  const { savedFilters } = savedFiltersHook;

  // ─────────── Fetchers ───────────
  const getAllProjects = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/projects/get_all/project`,
      );
      if (auth.user.role.name === "Admin") {
        setAllProjects(data?.projects);
        setProjects(data?.projects);
      } else {
        const filteredProjects = data.projects.filter((project) =>
          project.users_list.some((user) => user._id === auth?.user?.id),
        );
        setAllProjects(filteredProjects);
        setProjects(filteredProjects);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllDepartments = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/department`,
      );
      if (data?.success) {
        if (auth?.user?.role?.name === "Admin") {
          setDepartments(data?.departments || []);
        } else {
          const userProjects = allProjects.filter((project) =>
            project.users_list.some((user) => user._id === auth?.user?.id),
          );
          const projectDepartmentIds = userProjects
            .flatMap((proj) => proj.departments?.map((d) => d._id))
            .filter(Boolean);
          const uniqueDeptIds = [...new Set(projectDepartmentIds)];
          const filteredDepartments = data.departments.filter((dep) =>
            uniqueDeptIds.includes(dep._id),
          );
          setDepartments(filteredDepartments || []);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getlabel = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/label/get/labels/task`,
      );
      if (data.success) {
        setLabelData(data.labels);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users?module=task`,
      );
      setUsers(
        data?.users?.filter((user) =>
          user?.role?.access?.some((item) =>
            item?.permission?.includes("Tasks"),
          ),
        ) || [],
      );
      setUserName(
        data?.users
          ?.filter((user) =>
            user?.role?.access?.some((item) =>
              item.permission.includes("Tasks"),
            ),
          )
          ?.map((user) => user.name),
      );
    } catch (error) {
      console.log(error);
    }
  };

  // ─────────── Handlers ───────────
  const handleStopTimer = () => {
    if (timerRef.current) {
      timerRef.current.stopTimer();
    }
  };

  const flattenData = (data) =>
    data?.map((row) => ({
      projectName: row.project.projectName,
      jobHolder: row.jobHolder,
      task: row.task,
      hours: row.hours,
      startDate: format(new Date(row.startDate), "dd-MMM-yyyy"),
      deadline: format(new Date(row.deadline), "dd-MMM-yyyy") || "",
      status: row.status || "",
      lead: row.lead || "",
    }));

  const handleExportData = () => {
    const csvData = flattenData(tasksData);
    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
  };

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
        deleteTask(taskId);
        Swal.fire("Deleted!", "Your task has been deleted.", "success");
      }
    });
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
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (data) {
        refetchTasks();
        toast.success("Tasks Data imported successfully!");
      }
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error(
        error?.response?.data?.message || "Failed to import job data",
      );
    } finally {
      setFLoading(false);
    }
  };

  const setColumnFromOutsideTable = (colKey, filterVal) => {
    setColumnFilters((prev) => {
      const filtered = prev.filter((f) => f.id !== colKey);

      if (
        filterVal === undefined ||
        filterVal === null ||
        filterVal === "" ||
        (Array.isArray(filterVal) && filterVal.length === 0)
      ) {
        return filtered;
      }

      return [...filtered, { id: colKey, value: filterVal }];
    });
  };

  const createComplaint = (data) => {
    dispatch(openModal({ modal: "complaint", data }));
  };

  // Clears column filters + active saved filter + ?taskId param.
  // (Desktop additionally calls table.setGlobalFilter("") itself.)
  const handleClearFilters = () => {
    setColumnFilters([]);
    setActiveFilter(null);
    if (taskIdQueryParam) {
      searchParams.delete("taskId");
      setSearchParams(searchParams, { replace: true });
    }
  };

  const clearAllFilters = () => {
    dispatch(setFilterId(""));
    handleClearFilters();
    dispatch(setSearchValue(""));
  };

  const applySavedFilter = (f) => {
    setColumnFilters(f.filters);
    setActiveFilter(f);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const toggleSavedFilter = (f) => {
    if (activeFilter?._id === f._id) handleClearFilters();
    else applySavedFilter(f);
  };

  const setSearch = (v) => dispatch(setSearchValue(v));

  const openTaskDetail = (task) => {
    setTaskID(task._id);
    setProjectName(task.project?.projectName || "");
    setShowDetail(true);
  };

  const openCommentFor = (el, task) => {
    setCommentTaskId(task._id);
    setCommentAnchorEl(el);
    setIsComment(true);
  };

  const handleMobileStatusChange = async (task, newStatus) => {
    if (task.status === newStatus) return;
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/task/JLS/${task._id}`,
        { status: newStatus },
      );
      if (data?.success) {
        toast.success("Status updated");
        refetchTasks();
        refetchStats();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  // ─────────── Effects ───────────
  useEffect(() => {
    getAllProjects();
    getAllUsers();
    getlabel();
    // eslint-disable-next-line
  }, [auth]);

  useEffect(() => {
    const timeId = localStorage.getItem("jobId");
    setTimerId(JSON.parse(timeId));
  }, [anyTimerRunning]);

  useEffect(() => {
    if (!tasksData) return;
    const total = tasksData.reduce((sum, t) => sum + Number(t.hours), 0);
    setTotalHours(total.toFixed(0));
  }, [tasksData]);

  // socket: keep latest refetch in a ref + clean up the listener
  const refetchRef = useRef(refetchTasks);
  refetchRef.current = refetchTasks;

  useEffect(() => {
    if (!socket) return;
    const onUpdate = () => refetchRef.current?.();
    socket.on("task_updated", onUpdate);
    return () => socket.off("task_updated", onUpdate);
  }, [socket]);

  return {
    // redux / router
    auth, anyTimerRunning, searchValue, jid, currentPath,
    comment_taskId, taskIdQueryParam,

    // lists
    users, userName, departments, projects, allProjects, labelData,
    selectedUsers, setSelectedUsers,

    // add-task / add-project / label / department modals
    isOpen, setIsOpen,
    openAddProject, setOpenAddProject, projectId, setProjectId,
    openAddDepartment, setOpenAddDepartment, departmentId, setDepartmentId,
    showDepartment, setShowDepartment, showProject, setShowProject,
    showlabel, setShowlabel, taskId, setTaskId,

    // timer
    timerRef, timerId, isShow, setIsShow, isSubmitting, setIsSubmitting,
    taskIdForNote, setTaskIdForNote, note, setNote, activity, setActivity,
    handleStopTimer,

    // comments
    isComment, setIsComment, commentAnchorEl, setCommentAnchorEl,
    commentTaskId, setCommentTaskId, closeComment,

    // detail
    showDetail, setShowDetail, taskID, setTaskID, projectName, setProjectName,

    // filters / paging
    status, setStatus, pagination, setPagination,
    columnFilters, setColumnFilters,
    dueStatusFilter, jobHolderFilter, taskStatusFilter, projectFilter,
    activeFilter, setActiveFilter, savedFilters, savedFiltersHook,

    // data
    tasksData, setTasksData, loading, refetchTasks, rowCount, totalHours,
    refetchStats, taskStats,
    getuserTaskCounts, getTaskStatusTaskCounts, getdueStatusCounts, getProjectTaskCounts,

    // actions
    deleteTask, updateTaskJLS, updateTaskProject, copyTask,
    updateAlocateTask, addlabelTask, updateAllocatedTime,

    // fetchers
    getAllProjects, getAllDepartments, getlabel,

    // handlers
    handleExportData, importJobData,
    handleDeleteTaskConfirmation, handleCompleteStatus,
    setColumnFromOutsideTable, createComplaint,
    handleClearFilters, clearAllFilters,
    applySavedFilter, toggleSavedFilter, setSearch,
    openTaskDetail, openCommentFor, handleMobileStatusChange,
    fLoading,
  };
}