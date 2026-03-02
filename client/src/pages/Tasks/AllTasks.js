import { useEffect, useMemo, useRef, useState } from "react";

import { useMaterialReactTable } from "material-react-table";
import Loader from "../../utlis/Loader";

import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { filterByRowId } from "../../utlis/filterByRowId";

import { useDispatch, useSelector } from "react-redux";
import { setFilterId, setSearchValue } from "../../redux/slices/authSlice";

import { useSocket } from "../../context/socketProvider";
import { useClickOutside } from "../../utlis/useClickOutside";
import { getTaskColumns } from "./table/columns";
import { TasksTable } from "./table/TasksTable";
import { usePersistedUsers } from "../../hooks/usePersistedUsers";

// Components
import CompletedTasks from "./components/CompletedTasks";
import useColumnFilterSync from "./components/Responsiblities/ColumnFilter";
import TaskModals from "./components/modals/TaskModals";
import BulkEditForm from "./components/modals/BulkEditForm";
import TaskFilterPanels from "./components/filters/TaskFilterPanels";
import TaskFilterBar from "./components/filters/TaskFilterBar";
import TaskPageHeader from "./components/header/TaskPageHeader";

// hooks
import useTaskUI from "./hooks/useTaskUI";
import useTaskData from "./hooks/useTaskData";
import useTaskModals from "./hooks/useTaskModals";
import useColumnVisibility from "./hooks/useColumnVisibility";
import useTaskFilters from "./hooks/useTaskFilters";
import useTaskMutations from "./hooks/useTaskMutations";
import useBulkAction from "./hooks/useBulkAction";

const AllTasks = ({ justShowTable = false }) => {
  const { auth, filterId, anyTimerRunning, searchValue, jid } = useSelector(
    (state) => state.auth,
  );

  const {
    ui,
    setUI,
    showDepartment,
    showCompleted,
    showJobHolder,
    showDue,
    showStatus,
    showProject,
    showlabel,
    showDetail,
    showEdit,
    show_completed,
    setShowDepartment,
    setShowCompleted,
    setShowJobHolder,
    setShowDue,
    setShowStatus,
    setShowProject,
    setShowlabel,
    setShowDetail,
    setShowEdit,
  } = useTaskUI();

  const {
    tasksData,
    setTasksData,
    loading,
    isLoad,
    projects,
    allProjects,
    departments,
    users,
    userName,
    setUserName,
    labelData,
    getAllTasks,
    getTasks1,
    getAllProjects,
    getAllDepartments,
    getlabel,
  } = useTaskData();

  const [showColumn, setShowColumn] = useState(false);

  const dispatch = useDispatch();

  // All modal state consolidated in one hook
  const modals = useTaskModals();
  const {
    timerRef,
    setIsOpen,
    setOpenAddDepartment,
    setDepartmentId,
    setOpenAddProject,
    setProjectId,
    setIsComment,
    setCommentTaskId,
    note,
    setIsShow,
    activity,
    setNote,
    setActivity,
    taskIdForNote,
    setTaskIdForNote,
    setIsSubmitting,
    taskID,
    setTaskID,
    setProjectName,
  } = modals;

  // --- Location ---
  const location = useLocation();
  const currentPath = location.pathname;

  // --- Active Filter Tabs ---
  const [active, setActive] = useState("All"); // top-level department tab
  const [activeBtn, setActiveBtn] = useState(""); // which icon filter is active (jobHolder / status / due)
  const [active1, setActive1] = useState(""); // sub-filter value (status name, user name, etc.)

  // --- Column Filters (synced to table columns) ---
  const [filter1, setFilter1] = useState(""); // department
  const [filter2, setFilter2] = useState(""); // project
  const [filter3, setFilter3] = useState(""); // jobHolder

  // --- Filtered Data & Stats ---
  const [filterData, setFilterData] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [state, setState] = useState("");
  const [stateData, setStateData] = useState([]);

  // --- Timer ---
  const [play, setPlay] = useState(false);
  const [timerId, setTimerId] = useState("");
  const [reload, setReload] = useState(false);

  // --- Refs ---
  const commentStatusRef = useRef(null);

  // --- Status Constants ---
  const dateStatus = ["Due", "Overdue"];
  const status = ["To do", "Progress", "Review", "Onhold"];

  // --- Access Control ---
  const [access, setAccess] = useState([]);

  // --- Bulk Action ---
  const [rowSelection, setRowSelection] = useState({});
  const {
    fLoading,
    project,
    setProject,
    jobHolder,
    setJobHolder,
    lead,
    setLead,
    hours,
    setHours,
    startDate,
    setStartDate,
    deadline,
    setDeadline,
    taskDate,
    setTaskDate,
    tstatus,
    setTStatus,
    isUpload,
    importJobData,
    updateBulkJob,
  } = useBulkAction({
    rowSelection,
    setRowSelection,
    getAllTasks,
    setShowEdit,
  });

  const [searchParams] = useSearchParams();
  const comment_taskId = searchParams.get("comment_taskId");
  const navigate = useNavigate();

  const { selectedUsers, setSelectedUsers, toggleUser, resetUsers } =
    usePersistedUsers("tasks:selected_users", userName);

  const { columnVisibility, setColumnVisibility, toggleColumnVisibility } =
    useColumnVisibility();

  const showColumnRef = useRef(false);

  useClickOutside(showColumnRef, () => setShowColumn(false));

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
        setUI((prev) => ({ ...prev, showDetail: false }));
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

  const {
    getJobHolderCount,
    getDueAndOverdueCountByDepartment,
    getStatusCount,
    filterByDep,
    filterByProjStat,
    filterByState,
  } = useTaskFilters({
    tasksData,
    filterId,
    searchValue,
    setFilterData,
    setStateData,
  });

  const {
    updateTaskProject,
    updateTaskJLS,
    updateAlocateTask,
    copyTask,
    handleExportData,
    handleDeleteTask,
    handleDeleteTaskConfirmation,
    addlabelTask,
    handleStatusComplete,
    handleCompleteStatus,
  } = useTaskMutations({
    tasksData,
    setTasksData,
    filterData,
    setFilterData,
    active,
    active1,
    filterId,
    setUI,
    getTasks1,
  });

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

  // 📂 Projects
  // ----------------------------
  const projectCtx = useMemo(
    () => ({
      allProjects,
      updateTaskProject,
      updateTaskJLS,
      updateAlocateTask,
    }),
    [allProjects],
  );

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
      ShowDetail: ui.ShowDetail,
      copyTask,
      handleCompleteStatus,
      handleDeleteTaskConfirmation,
    }),
    [totalHours, filterId, active, active1],
  );

  // 💬 Comments
  // ----------------------------
  const commentCtx = useMemo(
    () => ({
      comment_taskId,
      setCommentTaskId,
      setIsComment,
    }),
    [comment_taskId],
  );

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

  // 🏷️ Labels
  // ----------------------------
  const labelCtx = useMemo(
    () => ({
      labelData,
      addlabelTask,
    }),
    [labelData],
  );

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
    [authCtx, projectCtx, taskCtx, commentCtx, timerCtx, labelCtx],
  );

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
    data:
      (active === "All" && !active1 && !filterId && !searchValue
        ? tasksData
        : filterData) || [],
    getRowId: (row) => row._id,

    enableStickyHeader: true,
    enableStickyFooter: true,
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

  // To Change the total hours when filter is applied inside the table
  useEffect(() => {
    console.log(
      "table.getFilteredRowModel().rows.length",
      table.getFilteredRowModel().rows.length,
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

  useEffect(() => {
    if (auth.user?.role?.name === "Admin") {
      console.log("Admin Role Detected, setting showJobHolder to true💛💛🧡🧡");
      setShowJobHolder(true);
      setActiveBtn("jobHolder");

      setActive1(auth?.user?.name);
    }
  }, []);

  useEffect(() => {
    if (comment_taskId) {
      filterByRowId(table, comment_taskId, setCommentTaskId, setIsComment);
    }
  }, [comment_taskId, searchParams, navigate, table]);

  useEffect(() => {
    if (show_completed) {
      setActiveBtn("completed");
      setShowCompleted(true);
      setActive("");
    }
  }, [show_completed]);

  const user_tasks_count_map = useMemo(() => {
    return Object.fromEntries(
      userName.map((user) => [user, getJobHolderCount(user, active)]),
    );
  }, [userName, active, getJobHolderCount]);

  // Hook returns an updater for each column
  const updateDepartment = useColumnFilterSync(
    table,
    "departmentName",
    filter1,
    setFilter1,
  );
  const updateProject = useColumnFilterSync(
    table,
    "projectName",
    filter2,
    setFilter2,
  );
  const updateJobHolder = useColumnFilterSync(
    table,
    "jobHolder",
    filter3,
    setFilter3,
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
          <TaskPageHeader
            auth={auth}
            onClearFilters={() => {
              setActive("All");
              setFilterData("");
              setActive1("");
              dispatch(setFilterId(""));
              handleClearFilters();
              filterByState(state);
              dispatch(setSearchValue(""));
            }}
            showDepartment={showDepartment}
            setUI={setUI}
            departments={departments}
            getAllDepartments={getAllDepartments}
            setDepartmentId={setDepartmentId}
            setOpenAddDepartment={setOpenAddDepartment}
            showProject={showProject}
            setShowProject={setShowProject}
            projects={projects}
            getAllProjects={getAllProjects}
            getAllTasks={getAllTasks}
            setProjectId={setProjectId}
            setOpenAddProject={setOpenAddProject}
            fLoading={fLoading}
            importJobData={importJobData}
            handleExportData={handleExportData}
            setShowlabel={setShowlabel}
            setIsOpen={setIsOpen}
          />
          <div className="flex flex-col gap-2 mt-3">
            <TaskFilterBar
              allDepartmentsSelected={allDepartmentsSelected}
              departments={departments}
              tasksData={tasksData}
              filter1={filter1}
              filter3={filter3}
              setFilter1={setFilter1}
              updateDepartment={updateDepartment}
              updateProject={updateProject}
              updateJobHolder={updateJobHolder}
              activeBtn={activeBtn}
              setActiveBtn={setActiveBtn}
              showCompleted={showCompleted}
              setShowCompleted={setShowCompleted}
              setActive={setActive}
              showJobHolder={showJobHolder}
              setShowJobHolder={setShowJobHolder}
              showStatus={showStatus}
              setShowStatus={setShowStatus}
              showEdit={showEdit}
              setShowEdit={setShowEdit}
              showColumn={showColumn}
              setShowColumn={setShowColumn}
              showColumnRef={showColumnRef}
              columnVisibility={columnVisibility}
              toggleColumnVisibility={toggleColumnVisibility}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              userName={userName}
              user_tasks_count_map={user_tasks_count_map}
              isLoad={isLoad}
              getTasks1={getTasks1}
              getAllProjects={getAllProjects}
            />

            <TaskFilterPanels
              showJobHolder={showJobHolder}
              showDue={showDue}
              showStatus={showStatus}
              activeBtn={activeBtn}
              selectedUsers={selectedUsers}
              tasksData={tasksData}
              filter3={filter3}
              active={active}
              active1={active1}
              setActive1={setActive1}
              dateStatus={dateStatus}
              status={status}
              auth={auth}
              getJobHolderCount={getJobHolderCount}
              getDueAndOverdueCountByDepartment={
                getDueAndOverdueCountByDepartment
              }
              getStatusCount={getStatusCount}
              filterByProjStat={filterByProjStat}
              updateJobHolder={updateJobHolder}
              setColumnFromOutsideTable={setColumnFromOutsideTable}
            />

            {/* ----------Bulk Action--------> */}
            {showEdit && (
              <BulkEditForm
                projects={projects}
                users={users}
                status={status}
                project={project}
                setProject={setProject}
                jobHolder={jobHolder}
                setJobHolder={setJobHolder}
                lead={lead}
                setLead={setLead}
                startDate={startDate}
                setStartDate={setStartDate}
                deadline={deadline}
                setDeadline={setDeadline}
                taskDate={taskDate}
                setTaskDate={setTaskDate}
                tstatus={tstatus}
                setTStatus={setTStatus}
                hours={hours}
                setHours={setHours}
                isUpload={isUpload}
                onSubmit={updateBulkJob}
              />
            )}
            {loading ? (
              <div className="flex items-center justify-center w-full h-screen px-4 py-4">
                <Loader />
              </div>
            ) : (
              <TasksTable table={table} />
            )}
          </div>

          <TaskModals
            modals={modals}
            // Shared data
            users={users}
            departments={departments}
            projects={projects}
            tasksData={tasksData}
            userName={userName}
            // Fetchers
            getAllTasks={getAllTasks}
            getTasks1={getTasks1}
            getAllDepartments={getAllDepartments}
            getAllProjects={getAllProjects}
            getlabel={getlabel}
            // Actions
            handleDeleteTask={handleDeleteTask}
            setTasksData={setTasksData}
            setFilterData={setFilterData}
            // UI from parent hooks
            showDetail={ui.showDetail}
            onCloseDetail={setShowDetail}
            showlabel={showlabel}
            setShowlabel={setShowlabel}
            assignedPerson={
              ui.showDetail && taskID
                ? table.getRow(taskID)?.original?.jobHolder
                : undefined
            }
            commentStatusRef={commentStatusRef}
          />
        </div>
      ) : (
        <CompletedTasks
          setShowCompleted={setShowCompleted}
          setActive2={setActive}
          getTasks={getAllTasks}
          getAllProj1={getAllProjects}
        />
      )}
    </>
  );
};

export default AllTasks;
