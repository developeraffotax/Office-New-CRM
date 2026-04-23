import axios from "axios";
import AddProjectModal from "../../components/Tasks/AddProjectModal";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import AddTaskModal from "../../components/Tasks/AddTaskModal";
import JobCommentModal from "../Jobs/JobCommentModal";
import AddLabel from "../../components/Modals/AddLabel";
import TaskDetail from "./TaskDetail";
import QuickAccess from "../../utlis/QuickAccess";
import SubtasksForNote from "./SubtasksForNote";
import AddTaskDepartmentModal from "../../components/Tasks/AddTaskDepartmentModal";
import ProjectDropdown from "./components/ProjectsDropdown/ProjectDropdown";
import DepartmentDropdown from "./components/DepartmentsDropdown/DepartmentDropdown";
import DraggableFilterTabs from "./DraggableFilterTabs";
import OverviewForPages from "../../utlis/overview/OverviewForPages";
import OutsideFilter from "../Jobs/utils/OutsideFilter";
import SelectedUsers from "../../components/SelectedUsers";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { style } from "../../utlis/CommonStyle";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { IoBriefcaseOutline, IoClose } from "react-icons/io5";
import { MdOutlineModeEdit } from "react-icons/md";
import { TbLoader, TbLoader2 } from "react-icons/tb"; 
import { useMaterialReactTable } from "material-react-table";
import { format } from "date-fns";
import { useLocation, useSearchParams } from "react-router-dom";
import { generateCsv, download } from "export-to-csv";
import { GrUpdate } from "react-icons/gr";
import { LuImport } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { setFilterId, setSearchValue } from "../../redux/slices/authSlice";
import { useSocket } from "../../context/socketProvider";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { useClickOutside } from "../../utlis/useClickOutside";
import { getTaskColumns } from "./table/columns";
import { TasksTable } from "./table/TasksTable";
import { isAdmin } from "../../utlis/isAdmin";
import { usePersistedUsers } from "../../hooks/usePersistedUsers";
import { openModal } from "../../redux/slices/globalModalSlice";
import { convertTasksArrayToObject } from "./utils";
import { colVisibility, csvConfig, dotColors, statusArr, textColors } from "./constants";
import { useTaskFilters } from "./hooks/useTaskFilters";
import { useTasksData } from "./hooks/useTasksData";
import { useTaskStats } from "./hooks/useTaskStats";
import { useTaskActions } from "./hooks/useTaskActions";







const AllTasks = ({ justShowTable = false }) => {

  const dispatch = useDispatch();
  const location = useLocation();
    const socket = useSocket();
  const currentPath = location.pathname;
  const [searchParams] = useSearchParams();
  const comment_taskId = searchParams.get("comment_taskId");


  const { auth, anyTimerRunning, searchValue, jid } = useSelector( (state) => state.auth, );


  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);


  const [departments, setDepartments] = useState([]);
  const [openAddDepartment, setOpenAddDepartment] = useState(false);
  const [departmentId, setDepartmentId] = useState("");
  const [showDepartment, setShowDepartment] = useState(false);


  const [openAddProject, setOpenAddProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [showProject, setShowProject] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  
  
  const [play, setPlay] = useState(false);
  const timerRef = useRef();
  const [isShow, setIsShow] = useState(false);
  

  const [isComment, setIsComment] = useState(false);
  const [commentTaskId, setCommentTaskId] = useState("");
  const [userName, setUserName] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [taskID, setTaskID] = useState("");
  const [projectName, setProjectName] = useState("");
  
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskIdForNote, setTaskIdForNote] = useState("");
  const [totalHours, setTotalHours] = useState(0);
  const [note, setNote] = useState("");
  const [taskId, setTaskId] = useState("");
  const [showJobHolder, setShowJobHolder] = useState(true);
  const [fLoading, setFLoading] = useState(false);
  const [labelData, setLabelData] = useState([]);
  const commentStatusRef = useRef(null);
  const [showlabel, setShowlabel] = useState(false);
  const [timerId, setTimerId] = useState("");
  const [activity, setActivity] = useState("Chargeable"); 


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


  const { selectedUsers, setSelectedUsers } = usePersistedUsers( "tasks:selected_users", userName, );


// ==========================================
// COLUMN VISIBILITY
// ==========================================
  const [showcolumn, setShowColumn] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({ _id: false, ...colVisibility, });
  
  const showColumnRef = useRef(false);
  useClickOutside(showColumnRef, () => setShowColumn(false));

  const toggleColumnVisibility = (column) => {
    const updatedVisibility = {
      ...columnVisibility,
      [column]: !columnVisibility[column],
    };
    setColumnVisibility(updatedVisibility);
    localStorage.setItem(
      "visibileTasksColumn",
      JSON.stringify(updatedVisibility),
    );
  };



// ==========================================
// TABLE
// ==========================================
  const [status, setStatus] = useState("progress");
  const [sorting, setSorting] = useState([]);

  const isNotCompleted = useMemo(() => status !== "completed", [status]);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20, });

  const [columnFilters, setColumnFilters] = useState(() => {
    const userName = auth?.user?.name;

    const filters = [];

    filters.push({ id: "taskStatus", value: "Progress" });
  // ✅ FIXED: taskDate default filter
  
  if (!isAdmin(auth)) {
    filters.push({ id: "jobHolder", value: userName, });
  }
  
  if (isAdmin(auth)) {
      filters.push({ id: "taskDate", value: { type: "preset", value: "Today", }, });

    }

    return filters;
  });



  const { departmentFilter, dueStatusFilter, jobHolderFilter, taskStatusFilter, } = useTaskFilters(columnFilters);
  const { tasksData, loading, refetchTasks, rowCount, setTasksData } = useTasksData({ pagination, searchValue, columnFilters, status });
  const { refetchStats, taskStats, getuserTaskCounts, getdepartmentTaskCounts, getTaskStatusTaskCounts, getdueStatusCounts, } = useTaskStats({ columnFilters, status });
  const { deleteTask, updateTaskJLS, updateTaskProject, copyTask, updateAlocateTask, addlabelTask, handleStatusComplete, } = useTaskActions({ refetchStats, refetchTasks });


  const userTaskCountMap = useMemo(() => { return convertTasksArrayToObject(taskStats?.userStats); }, [taskStats]);













  //---------- Get All Projects-----------
  const getAllProjects = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/projects/get_all/project`,
      );
      setAllProjects(data?.projects);
      if (auth.user.role.name === "Admin") {
        setProjects(data?.projects);
      } else {
        const filteredProjects = data.projects.filter((project) =>
          project.users_list.some((user) => user._id === auth?.user?.id),
        );

        setProjects(filteredProjects);
      }
    } catch (error) {
      console.log(error);
    }
  };



  //---------- Get All Deps-----------
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

  

  //   Get All Labels
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
  




  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`,
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
            user?.role?.access?.map((item) =>
              item.permission.includes("Tasks"),
            ),
          )
          ?.map((user) => user.name),
      );
    } catch (error) {
      console.log(error);
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
    const csvData = flattenData( tasksData);
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
        },
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

  // Handle Bulk Action
  const updateBulkJob = async (e) => {
    e.preventDefault();
    setIsUpdate(true);
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/update/multiple`,
        {
          rowSelection: Object.keys(rowSelection).filter(
            (id) => rowSelection[id] === true,
          ),
          projectId: project,
          jobHolder,
          lead,
          hours,
          startDate,
          deadline,
          taskDate,
          status: tstatus,
        },
      );
      if (data) {
        refetchTasks();
        toast.success("Bulk Action updated successfully!");
        setRowSelection({});
        setProject("");
        setJobHolder("");
        setLead("");
        setHours("");
        setStartDate("");
        setDeadline("");
        setTaskDate("");
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









  const setColumnFromOutsideTable = (colKey, filterVal) => {
    setColumnFilters((prev) => {
      // Remove existing filter for this column
      const filtered = prev.filter((f) => f.id !== colKey);

      // If empty → just remove filter
      if (
        filterVal === undefined ||
        filterVal === null ||
        filterVal === "" ||
        (Array.isArray(filterVal) && filterVal.length === 0)
      ) {
        return filtered;
      }

      // Otherwise add updated filter
      return [
        ...filtered,
        {
          id: colKey,
          value: filterVal,
        },
      ];
    });
  };








  const createComplaint = (data) => {
    dispatch(
      openModal({
        modal: "complaint",
        data: data,
      }),
    );
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
    [auth, users, departments],
  );

  // ----------------------------
  // 📊 Tasks / Filtering
  // ----------------------------
  const taskCtx = useMemo(
    () => ({
      columnFilters,
      searchValue,
      status,

      totalHours,
      allProjects,
      comment_taskId,
      labelData,

      setTasksData,
      setColumnFilters,
      setTaskID,
      setProjectName,
      setShowDetail,
      setCommentTaskId,
      setIsComment,
      createComplaint,

      copyTask,
      handleCompleteStatus,
      handleDeleteTaskConfirmation,
      updateTaskProject,
      updateTaskJLS,
      updateAlocateTask,
      addlabelTask,
    }),
    [
      comment_taskId,
      totalHours,
      allProjects,
      labelData,
      columnFilters,
      searchValue,
      status,
    ],
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
      setIsSubmitting,
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
    ],
  );

  // ----------------------------
  // 📦 Merge into one ctx if needed
  // ----------------------------
  const ctx = useMemo(
    () => ({
      ...authCtx,
      ...taskCtx,
      ...timerCtx,
    }),
    [authCtx, taskCtx, timerCtx],
  );

  // ----------------------------
  // 📑 Columns
  // ----------------------------
  const columns = useMemo(() => getTaskColumns(ctx), [ctx]);

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");
  };

  const table = useMaterialReactTable({
    columns,
    data: tasksData || [],
    getRowId: (row) => row._id,

    manualPagination: true,
    manualFiltering: true,
    // manualSorting: true,

    rowCount: rowCount,
    enablePagination: true,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,

    enableFilterMatchHighlighting: false,
    enableColumnFilters: false,

    enableStickyHeader: true,
    enableStickyFooter: true,
    columnFilterDisplayMode: "popover",
    muiTableContainerProps: { sx: { maxHeight: "78vh" } },
    enableColumnActions: false,
    enableSorting: false,
    enableGlobalFilter: true,
    enableRowNumbers: true,
    enableColumnResizing: true,
    enableTopToolbar: true,
    enableBottomToolbar: true,
    enableRowSelection: true,
    enableTableHead: true,

    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,

    initialState: {
      columnVisibility: {
        _id: false,
      },
    },

    state: {
      rowSelection,
      pagination,
      density: "compact",
      columnVisibility: columnVisibility,

      sorting,
      columnFilters,
      // globalFilter: searchValue,
      // isLoading: loading,
      showProgressBars: false,
      showSkeletons: false,
      showLoadingOverlay: false,
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
        caption: {
          captionSide: "top",
        },
      },
    },
  });




















// ==========================================
// EFFECTS
// ==========================================


  useEffect(() => {
    getAllProjects();
    getAllUsers();
    getlabel();
  }, [auth]);


  useEffect(() => {
    if (auth) {
      getAllDepartments();
    }
  }, [auth, allProjects]);

 


    useEffect(() => {
    const savedVisibility = JSON.parse(
      localStorage.getItem("visibileTasksColumn"),
    );

    if (savedVisibility) {
      setColumnVisibility(savedVisibility);
    }
  }, []);



  useEffect(() => {
    const timeId = localStorage.getItem("jobId");
    setTimerId(JSON.parse(timeId));
  }, [anyTimerRunning]);

  const calculateTotalHours = (data) => {
    return data?.reduce((sum, client) => sum + Number(client.hours), 0);
  };

  useEffect(() => {
    if (!tasksData) return;
    setTotalHours(calculateTotalHours(tasksData).toFixed(0));
  }, [tasksData]);





  
    useEffect(() => {
    if (!socket) return;

    socket.on("task_updated", () => {
      refetchTasks();
    });
  }, [socket]);




  const renderColumnControls = () => (
    <section className="w-[600px] rounded-lg bg-white border border-slate-200 shadow-sm">
      {/* Header */}
      <header className="px-5 py-3 border-b">
        <h3 className="text-sm font-semibold text-slate-800">View settings</h3>
      </header>

      {/* Content */}
      <div className="grid grid-cols-2 divide-x">
        {/* LEFT — Columns */}
        <section className="px-5 py-4">
          <h4 className="mb-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
            Columns
          </h4>

          <ul className="space-y-1 list-decimal">
            {Object.keys(colVisibility)?.map((column) => (
              <li key={column}>
                <label
                  className="flex items-center justify-between rounded-md px-2 py-1.5
                           text-sm text-slate-700 cursor-pointer
                           hover:bg-slate-50 transition"
                >
                  <span className="capitalize">{column}</span>
                  <input
                    type="checkbox"
                    checked={columnVisibility[column]}
                    onChange={() => toggleColumnVisibility(column)}
                    className="h-4 w-4 accent-orange-600"
                  />
                </label>
              </li>
            ))}
          </ul>
        </section>

        {/* RIGHT — Users */}
        <section className="px-5 py-4">
          <h4 className="mb-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
            Users
          </h4>

          <div className="h-full overflow-y-auto space-y-1 pr-1">
            <SelectedUsers
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              userNameArr={userName}
              countMap={userTaskCountMap}
              label={"task"}
            />
          </div>
        </section>
      </div>
    </section>
  );

  return (
    <div className=" relative w-full h-full overflow-auto py-4 px-2 sm:px-4">
      <div className="flex text-start sm:items-center sm:justify-between gap-4 flex-col sm:flex-row">
        <div className="flex items-center gap-3 ">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
            Tasks
          </h1>

          <span
            className={`p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400 mb-1 hover:rotate-180 `}
            onClick={() => {
              dispatch(setFilterId(""));
              handleClearFilters();

              dispatch(setSearchValue(""));
            }}
            title="Clear filters"
          >
            <IoClose className="h-6 w-6 text-white" />
          </span>

          <span>
            <QuickAccess />
          </span>

          {isAdmin(auth) && (
            <span className=" mb-2">
              {" "}
              <OverviewForPages />{" "}
            </span>
          )}

          {<span className="w-[1px] h-8 bg-gray-200 rounded "></span>}

          <div className="flex gap-2 w-fit font-google font-medium ">
            {[
              { label: "In-Progress", value: "progress" },
              { label: "Completed", value: "completed" },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setStatus(value)}
                className={`flex items-center gap-[7px] px-[14px] py-[6px] text-[13px] rounded-xl  border cursor-pointer  transition-all duration-200
                      ${
                        status === value
                          ? "border-gray-300 bg-gray-50 text-gray-900"
                          : "border-gray-200 bg-white text-gray-400 hover:text-gray-700"
                      }`}
              >
                <span
                  className={`w-[7px] h-[7px] rounded-full flex-shrink-0  
                      ${status === value ? dotColors[value] : "bg-gray-300"}`}
                />

                {label}
              </button>
            ))}
          </div>

          {isNotCompleted && (
            <span className="w-[1px] h-8 bg-gray-200 rounded "></span>
          )}

          {isNotCompleted && (
            <div className="flex gap-1 w-fit font-google font-medium transition-all duration-500">
              {[
                { label: "Due", value: "due" },
                { label: "Overdue", value: "overdue" },
                { label: "Upcoming", value: "upcoming" },
              ].map(({ label, value }) => {
                const isActive = dueStatusFilter === value;

                return (
                  <button
                    key={value}
                    onClick={() =>
                      setColumnFromOutsideTable("datestatus", value)
                    }
                    className={`
                          flex items-center gap-1 px-2 py-1 text-[12px] font-normal rounded-xl cursor-pointer border-none
                          ${
                            isActive
                              ? `${textColors[value]} bg-gray-100`
                              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                          }
                        `}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-150
                            ${isActive ? dotColors[value] : "bg-transparent"}
                          `}
                    />
                    {label} ({getdueStatusCounts(value)})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Project Buttons */}
        <div className="flex items-center gap-4 ">
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
                getAllTasks={refetchTasks}
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
      <div className="flex flex-col   ">
        {/* -----------Filters By Deps--------- */}
        <div className="flex items-center flex-row overflow-x-auto hidden1 gap-2 py-1.5 max-lg:hidden">
          <div className="flex items-center flex-row overflow-x-auto hidden1 gap-1  ">
            {/* --- Aligned "All" Tab --- */}
            <div
              onClick={() => setColumnFromOutsideTable("departmentName", "")}
              className={`
                      relative flex items-center gap-1 px-2 py-1.5 cursor-pointer
                      text-[13px] font-[400] whitespace-nowrap  
                      rounded-t-md border-b-2 font-google
                      ${
                        !departmentFilter
                          ? "text-orange-600 border-orange-500 bg-orange-50"
                          : "text-gray-800 border-transparent hover:text-gray-900 hover:bg-gray-50"
                      }
                    `}
            >
              <span className="tracking-wide">
                All ({taskStats?.totalTasks})
              </span>

              {!departmentFilter && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-orange-500 rounded-full" />
              )}
            </div>

            {/* --- Department Tabs --- */}
            {[...departments]?.map(({ departmentName, _id }, i) => {
              const isActive = departmentFilter === _id;
              return (
                <div
                  key={i}
                  onClick={() =>
                    setColumnFromOutsideTable("departmentName", _id)
                  }
                  className={`
                          relative flex items-center gap-1 px-2 py-1.5 cursor-pointer
                          text-[13px] font-[400] whitespace-nowrap  
                          rounded-t-md border-b-2 font-google
                          ${
                            isActive
                              ? "text-orange-600 border-orange-500 bg-orange-50"
                              : "text-gray-800 border-transparent hover:text-gray-900 hover:bg-gray-50"
                          }
                        `}
                >
                  <span className="tracking-wide">
                    {departmentName} ({getdepartmentTaskCounts(_id)})
                  </span>

                  {isActive && (
                    <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-orange-500 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>

          {/*  */}
          {/* -------------Filter Open Buttons-------- */}
          {isAdmin(auth) && <span
            className={` p-1 rounded-md hover:shadow-md    cursor-pointer border  ${
              showJobHolder &&
              "bg-gray-200"
            }`}
            onClick={() => {
               
              setShowJobHolder(!showJobHolder);
            }}
            title="Filter by Job Holder"
          >
            <IoBriefcaseOutline className="h-6 w-6  cursor-pointer " />
          </span>}

          {/* Edit Multiple Tasks */}
          <span
            className={`hidden sm:block p-1 rounded-md hover:shadow-md   cursor-pointer border ${
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
              className={`  p-[6px] rounded-md hover:shadow-md  cursor-pointer border ${
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

          <button
            onClick={() => {
              refetchTasks();
              getAllProjects();
            }}
            title="Refresh Data"
            disabled={loading}
            className={`
                  flex items-center justify-center
                  p-[6px]
                  
                  rounded-md 
                  border
                  shadow-sm
                  hover:shadow-md
                  transition-all duration-100
                  ${loading ? " cursor-not-allowed" : "cursor-pointer"}
                `}
          >
            <GrUpdate
              className={` h-5 w-5 transition-all duration-100 text-gray-600 ${
                loading ? "animate-spin" : ""
              } `}
            />
          </button>
        </div>

        {/* ----------Job_Holder Summery Filters---------- */}
        {isAdmin(auth) && showJobHolder &&  (
          <div className="flex items-center flex-wrap gap-4  py-1.5 border-t  max-lg:hidden">
            <DraggableFilterTabs
              droppableId={"users"}
              items={selectedUsers.map((uName) => ({
                _id: uName,
                name: uName,
              }))}
              filterValue={jobHolderFilter}
              tasks={[]}
              getCountFn={(user, tasks) => getuserTaskCounts(user.name)}
              getLabelFn={(user) => user.name}
              onClick={(user) => {
                setColumnFromOutsideTable("jobHolder", user.name);
              }}
              activeClassName={
                jobHolderFilter
                  ? "border-b-2 text-orange-600 border-orange-600"
                  : ""
              }
            />

            {<span className="w-[1px] h-8 bg-gray-200 rounded "></span>}

            <div className="  ">
              {" "}
              <OutsideFilter
                setColumnFromOutsideTable={setColumnFromOutsideTable}
                title={"taskDate"}
                columnFilters={columnFilters}
              />{" "}
            </div>
            {status !== "completed" && (
              <span className="w-[1px] h-8 bg-gray-200 rounded "></span>
            )}

            {status !== "completed" &&
              statusArr?.map((stat, i) => (
                <div
                  key={i}
                  className={`
                                         py-1 px-3 rounded-full cursor-pointer
                                         font-[400] text-[14px] text-gray-900 font-google
                                         border shadow-sm transition-all duration-150
                   
                                         ${
                                           taskStatusFilter === stat
                                             ? "text-white border-orange-600 bg-orange-600"
                                             : "hover:bg-gray-100"
                                         }
                                       `}
                  onClick={() => {
                    // Toggle behavior (Enterprise UX)
                    if (taskStatusFilter === stat) {
                      setColumnFromOutsideTable("taskStatus", undefined);
                    } else {
                      setColumnFromOutsideTable("taskStatus", stat);
                    }
                  }}
                >
                  {stat} ({getTaskStatusTaskCounts(stat)})
                </div>
              ))}
          </div>
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
                  {statusArr.map((stat, i) => (
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
        <TasksTable table={table} />
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
            getTasks1={refetchTasks}
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
            getTasks1={refetchTasks}
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
            getAllTasks={refetchTasks}
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
            getTasks1={refetchTasks}
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
                    className={`${style.btn} flex items-center justify-center space-x-1`}
                    onClick={handleStopTimer}
                    disabled={isSubmitting} // Optional: disable button while submitting
                  >
                    {isSubmitting ? (
                      <span className="flex space-x-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-150"></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-300"></span>
                      </span>
                    ) : (
                      "Submit"
                    )}
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
                <h3 className="text-lg font-semibold">
                  Project: {projectName}
                </h3>
                <button
                  className="p-1 rounded-2xl bg-gray-50 border hover:shadow-md hover:bg-gray-100"
                  onClick={() => setShowDetail(false)}
                >
                  <IoClose className="h-5 w-5" />
                </button>
              </div>

              <TaskDetail
                taskId={taskID}
                getAllTasks={refetchTasks}
                handleDeleteTask={deleteTask}
                setTasksData={setTasksData}
                setShowDetail={setShowDetail}
                users={users}
                projects={projects}
                setFilterData={() => {}}
                tasksData={tasksData}
                assignedPerson={table.getRow(taskID).original.jobHolder}
                setTaskIdForNote={setTaskIdForNote}
              />
            </div>
          </div>
        </div>
      )}

      {showlabel && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
          <AddLabel
            setShowlabel={setShowlabel}
            type={"task"}
            getLabels={getlabel}
          />
        </div>
      )}
    </div>
  );
};

export default AllTasks;
