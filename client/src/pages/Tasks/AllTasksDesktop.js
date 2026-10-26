import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useMaterialReactTable } from "material-react-table";

import QuickAccess from "../../utlis/QuickAccess";
import DraggableFilterTabs from "./DraggableFilterTabs";
import DraggableProjectTabs from "./DraggableProjectTabs";
import OverviewForPages from "../../utlis/overview/OverviewForPages";
import OutsideFilter from "../Jobs/utils/OutsideFilter";
import TaskHeaderActions from "./TaskActions";
import SavedFiltersPanel from "../../components/SavedFilters/SavedFiltersPanel";
import SelectedUsersNew from "../../components/SelectedUsersNew";

import { style } from "../../utlis/CommonStyle";
import { IoBriefcaseOutline, IoClose } from "react-icons/io5";
import { MdOutlineModeEdit } from "react-icons/md";
import { TbLoader2 } from "react-icons/tb";
import { GrUpdate } from "react-icons/gr";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { CiFilter } from "react-icons/ci";
import { useClickOutside } from "../../utlis/useClickOutside";
import { isAdmin } from "../../utlis/isAdmin";
import { isTeamLead } from "../../utlis/checkPermission";
import { getTaskColumns } from "./table/columns";
import { TasksTable } from "./table/TasksTable";
import {
  colVisibility,
  dotColors,
  statusArr,
  textColors,
} from "./constants";
import {
  getSavedColumnOrder,
  usePersistedColumnOrder,
} from "../../hooks/usePersistedColumnOrder";
import {
  columnOrderingOptions,
  headCellHoverSx,
} from "../../utlis/columnOrdering";

const COLUMN_ORDER_KEY = "tasks:column_order";

const AllTasksDesktop = ({ c }) => {
  const {
    auth, users, departments, allProjects, projects, labelData, totalHours,
    comment_taskId, searchValue, status, setStatus,
    columnFilters, setColumnFilters, pagination, setPagination,
    tasksData, setTasksData, loading, refetchTasks, rowCount, taskStats,
    dueStatusFilter, jobHolderFilter, taskStatusFilter, projectFilter,
    getuserTaskCounts, getTaskStatusTaskCounts, getdueStatusCounts, getProjectTaskCounts,
    selectedUsers, setSelectedUsers,
    savedFilters, savedFiltersHook, activeFilter, setActiveFilter, applySavedFilter,
    setColumnFromOutsideTable, createComplaint,
    copyTask, updateTaskProject, updateTaskJLS, updateAllocatedTime,
    updateAlocateTask, addlabelTask,
    handleCompleteStatus, handleDeleteTaskConfirmation,
    // timer
    anyTimerRunning, timerId, jid, currentPath, timerRef,
    setIsShow, setIsSubmitting, note, setNote, activity, setActivity,
    taskIdForNote, setTaskIdForNote,
    // modals / detail / comments
    setTaskID, setProjectName, setShowDetail,
    setCommentTaskId, setCommentAnchorEl, setIsComment,
    setIsOpen, setShowlabel, setOpenAddProject, setOpenAddDepartment,
    setDepartmentId, setProjectId,
    showDepartment, setShowDepartment, showProject, setShowProject,
    getAllDepartments, getAllProjects, importJobData, fLoading, handleExportData,
  } = c;

  // ─────────── Desktop-only state ───────────
  const [play, setPlay] = useState(false);
  const [reload, setReload] = useState(false);
  const [showJobHolder, setShowJobHolder] = useState(true);
  const [showSavedFilters, setShowSavedFilters] = useState(false);
  const [sorting] = useState([]);

  const isNotCompleted = useMemo(() => status !== "completed", [status]);

  // Bulk action
  const [showEdit, setShowEdit] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [project, setProject] = useState("");
  const [jobHolder, setJobHolder] = useState("");
  const [lead, setLead] = useState("");
  const [leadUser, setLeadUser] = useState("");
  const [hours, setHours] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [tstatus, setTStatus] = useState("");
  const [isUpload, setIsUpdate] = useState(false);

  // Column visibility
  const [showcolumn, setShowColumn] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    _id: false,
    ...colVisibility,
  });
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

  // ─────────── Column ctx ───────────
  const authCtx = useMemo(
    () => ({ auth, users, departments }),
    [auth, users, departments],
  );

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
      setCommentAnchorEl,
      setIsComment,
      createComplaint,

      copyTask,
      handleCompleteStatus,
      handleDeleteTaskConfirmation,
      updateTaskProject,
      updateTaskJLS,
      updateAllocatedTime,
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

  const ctx = useMemo(
    () => ({ ...authCtx, ...taskCtx, ...timerCtx }),
    [authCtx, taskCtx, timerCtx],
  );

  const columns = useMemo(() => getTaskColumns(ctx), [ctx]);

  // ─────────── Table ───────────
  const table = useMaterialReactTable({
    columns,
    data: tasksData || [],
    getRowId: (row) => row._id,

    manualPagination: true,
    manualFiltering: true,

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
      columnVisibility: { _id: false },
      columnOrder: getSavedColumnOrder(COLUMN_ORDER_KEY),
    },

    state: {
      rowSelection,
      pagination,
      density: "compact",
      columnVisibility,
      sorting,
      columnFilters,
      showProgressBars: false,
      showSkeletons: false,
      showLoadingOverlay: false,
    },

    ...columnOrderingOptions,

    muiTableHeadCellProps: {
      style: {
        fontWeight: "600",
        fontSize: "14px",
        backgroundColor: "#E5E7EB",
        color: "#000",
        padding: ".7rem 0.3rem",
      },
      sx: headCellHoverSx,
    },

    muiTableBodyCellProps: {
      sx: { border: "1px solid rgba(203, 201, 201, 0.5)" },
    },

    muiTableProps: {
      sx: {
        "& .MuiTableHead-root": { backgroundColor: "#f0f0f0" },
        tableLayout: "auto",
        fontSize: "13px",
        caption: { captionSide: "top" },
      },
    },
  });

  usePersistedColumnOrder(table, COLUMN_ORDER_KEY);

  // Clear = shared clear + MRT's internal global filter
  const clearTableFilters = () => {
    c.handleClearFilters();
    table.setGlobalFilter("");
  };
  const clearAll = () => {
    c.clearAllFilters();
    table.setGlobalFilter("");
  };

  // ─────────── Effects ───────────
  useEffect(() => {
    const savedVisibility = JSON.parse(
      localStorage.getItem("visibileTasksColumn"),
    );
    if (savedVisibility) setColumnVisibility(savedVisibility);
  }, []);

  const columnOrder = table.getState().columnOrder;
  useEffect(() => {
    if (columnOrder?.length) {
      localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(columnOrder));
    }
  }, [columnOrder]);

  // ─────────── Bulk action ───────────
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
          leadUser,
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

  const renderColumnControls = () => (
    <section className="w-[600px] rounded-lg bg-white border border-slate-200 shadow-sm">
      <header className="px-5 py-3 border-b">
        <h3 className="text-sm font-semibold text-slate-800">View settings</h3>
      </header>

      <div className="grid grid-cols-2 divide-x">
        <section className="px-5 py-4">
          <h4 className="mb-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
            Columns
          </h4>
          <ul className="space-y-1 list-decimal">
            {Object.keys(colVisibility)?.map((column) => (
              <li key={column}>
                <label className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 transition">
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

        <section className="px-5 py-4">
          <h4 className="mb-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
            Users
          </h4>
          <div className="h-full overflow-y-auto space-y-1 pr-1">
            <SelectedUsersNew
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              users={users}
              current_user={auth?.user}
            />
          </div>
        </section>
      </div>
    </section>
  );

  // ─────────── Render ───────────
  return (
    <div className="relative w-full h-full overflow-auto py-4 px-2 sm:px-4">
      <div className="flex text-start sm:items-center sm:justify-between gap-4 flex-col sm:flex-row">
        <div className="flex items-center gap-3 ">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
            Tasks
          </h1>

          <span
            className="p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400 mb-1 hover:rotate-180"
            onClick={clearAll}
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

          <span className="w-[1px] h-8 bg-gray-200 rounded "></span>

          <div className="flex gap-2 w-fit font-google font-medium ">
            {[
              { label: "In-Progress", value: "progress" },
              { label: "Completed", value: "completed" },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setStatus(value)}
                className={`flex items-center gap-[7px] px-[14px] py-[6px] text-[13px] rounded-xl border cursor-pointer transition-all duration-200
                  ${
                    status === value
                      ? "border-gray-300 bg-gray-50 text-gray-900"
                      : "border-gray-200 bg-white text-gray-400 hover:text-gray-700"
                  }`}
              >
                <span
                  className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${
                    status === value ? dotColors[value] : "bg-gray-300"
                  }`}
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
                    className={`flex items-center gap-1 px-2 py-1 text-[12px] font-normal rounded-xl cursor-pointer border-none
                      ${
                        isActive
                          ? `${textColors[value]} bg-gray-100`
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-150 ${
                        isActive ? dotColors[value] : "bg-transparent"
                      }`}
                    />
                    {label} ({getdueStatusCounts(value)})
                  </button>
                );
              })}
            </div>
          )}

          <span className="w-[1px] h-8 bg-gray-200 rounded "></span>

          <div className="flex items-center gap-0 font-google">
            {/* Filter Button */}
            <div className="relative z-[50]">
              <button
                title="Saved Filters"
                onClick={() => setShowSavedFilters(!showSavedFilters)}
                className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors duration-150
                  ${
                    showSavedFilters
                      ? "bg-slate-100 border-slate-300 text-slate-700"
                      : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-300"
                  }`}
              >
                <CiFilter className="h-[18px] w-[18px]" />
              </button>

              {showSavedFilters && (
                <div className="absolute top-full left-0 mt-1">
                  <SavedFiltersPanel
                    page="tasks"
                    columnFilters={columnFilters}
                    onLoad={(filters, savedFilter) => {
                      setColumnFilters(filters);
                      setActiveFilter(savedFilter);
                      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                      setShowSavedFilters(false);
                    }}
                    setShowSavedFilters={setShowSavedFilters}
                    activeFilter={activeFilter}
                    savedFiltersHook={savedFiltersHook}
                  />
                </div>
              )}
            </div>

            {savedFilters.length > 0 && (
              <div className="w-px h-4 bg-slate-200 mx-2 flex-shrink-0" />
            )}

            {/* Quick-apply pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {savedFilters.map((f) => {
                const isActive = activeFilter?._id === f._id;
                return (
                  <button
                    key={f._id}
                    onClick={() =>
                      isActive ? clearTableFilters() : applySavedFilter(f)
                    }
                    className={`flex items-center gap-1.5 px-2.5 h-[26px] rounded-md border text-[11px] font-medium tracking-wide transition-all duration-150
                      ${
                        isActive
                          ? "bg-orange-50 border-orange-200 text-orange-600"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                    )}
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Project Buttons */}
        <div className="flex items-center gap-4 ">
          <TaskHeaderActions
            auth={auth}
            style={style}
            showDepartment={showDepartment}
            setShowDepartment={setShowDepartment}
            departments={departments}
            getAllDepartments={getAllDepartments}
            setDepartmentId={setDepartmentId}
            setOpenAddDepartment={setOpenAddDepartment}
            showProject={showProject}
            setShowProject={setShowProject}
            projects={projects}
            getAllProjects={getAllProjects}
            refetchTasks={refetchTasks}
            setProjectId={setProjectId}
            setOpenAddProject={setOpenAddProject}
            importJobData={importJobData}
            fLoading={fLoading}
            handleExportData={handleExportData}
            setShowlabel={setShowlabel}
            setIsOpen={setIsOpen}
          />
        </div>
      </div>

      <div className="flex flex-col">
        {/* -----------Filters By Deps--------- */}
        <div className="flex items-center flex-row overflow-x-auto hidden1 gap-2 py-1.5">
          <DraggableProjectTabs
            projects={projects}
            projectFilter={projectFilter}
            totalCount={taskStats?.totalTasks}
            getCount={getProjectTaskCounts}
            onSelect={(id) => setColumnFromOutsideTable("departmentName", id)}
          />

          {(isAdmin(auth) || isTeamLead(auth?.user)) && (
            <span
              className={`p-1 rounded-md hover:shadow-md cursor-pointer border ${
                showJobHolder && "bg-gray-200"
              }`}
              onClick={() => setShowJobHolder(!showJobHolder)}
              title="Filter by Job Holder"
            >
              <IoBriefcaseOutline className="h-6 w-6 cursor-pointer" />
            </span>
          )}

          <span
            className={`hidden sm:block p-1 rounded-md hover:shadow-md cursor-pointer border ${
              showEdit && "bg-orange-500 text-white"
            }`}
            onClick={() => setShowEdit(!showEdit)}
            title="Edit Multiple Tasks"
          >
            <MdOutlineModeEdit className="h-6 w-6 cursor-pointer" />
          </span>

          <div className="relative">
            <div
              className={`p-[6px] rounded-md hover:shadow-md cursor-pointer border ${
                showcolumn && "bg-orange-500 text-white"
              }`}
              onClick={() => setShowColumn(!showcolumn)}
            >
              {showcolumn ? (
                <GoEyeClosed className="h-5 w-5" />
              ) : (
                <GoEye className="h-5 w-5" />
              )}
            </div>
            {showcolumn && (
              <div
                ref={showColumnRef}
                className="fixed top-32 left-[50%] z-[9999] w-[12rem]"
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
            className={`flex items-center justify-center p-[6px] rounded-md border shadow-sm hover:shadow-md transition-all duration-100 ${
              loading ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <GrUpdate
              className={`h-5 w-5 transition-all duration-100 text-gray-600 ${
                loading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>

        {/* ----------Job_Holder Summary Filters---------- */}
        {(isAdmin(auth) || isTeamLead(auth?.user)) && showJobHolder && (
          <div className="flex items-center flex-wrap gap-4 py-1.5 border-t">
            <DraggableFilterTabs
              droppableId={"users"}
              items={selectedUsers.map((uName) => ({
                _id: uName,
                name: uName,
              }))}
              filterValue={jobHolderFilter}
              tasks={[]}
              getCountFn={(user) => getuserTaskCounts(user.name)}
              getLabelFn={(user) => user.name}
              onClick={(user) => setColumnFromOutsideTable("jobHolder", user.name)}
              activeClassName={
                jobHolderFilter
                  ? "border-b-2 text-orange-600 border-orange-600"
                  : ""
              }
            />

            <span className="w-[1px] h-8 bg-gray-200 rounded "></span>

            <div>
              <OutsideFilter
                setColumnFromOutsideTable={setColumnFromOutsideTable}
                title={"taskDate"}
                columnFilters={columnFilters}
              />
            </div>

            {status !== "completed" && (
              <span className="w-[1px] h-8 bg-gray-200 rounded "></span>
            )}

            {status !== "completed" &&
              statusArr?.map((stat, i) => (
                <div
                  key={i}
                  className={`py-1 px-3 rounded-full cursor-pointer font-[400] text-[14px] text-gray-900 font-google border-2 shadow-sm transition-all duration-150
                    ${
                      taskStatusFilter === stat
                        ? "text-orange-600 border-orange-500 bg-orange-50"
                        : "hover:bg-gray-100"
                    }`}
                  onClick={() => {
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
          <div className="w-full py-2">
            <form
              onSubmit={updateBulkJob}
              className="w-full flex items-center flex-wrap gap-2"
            >
              <div>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "8rem" }}
                >
                  <option value="empty">Project</option>
                  {projects.map((p, i) => (
                    <option value={p._id} key={i}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={jobHolder}
                  onChange={(e) => setJobHolder(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "7rem" }}
                >
                  <option value="empty">Assign</option>
                  {users.map((u, i) => (
                    <option value={u.name} key={i}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "7rem" }}
                >
                  <option value="empty">Owner</option>
                  {users.map((u, i) => (
                    <option value={u.name} key={i}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={leadUser}
                  onChange={(e) => setLeadUser(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "7rem" }}
                >
                  <option value="empty">Lead </option>
                  {users.map((u, i) => (
                    <option value={u.name} key={i}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inputBox" style={{ width: "8.5rem" }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`${style.input} w-full`}
                />
                <span>Start Date</span>
              </div>
              <div className="inputBox" style={{ width: "8.5rem" }}>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={`${style.input} w-full`}
                />
                <span>Deadline</span>
              </div>
              <div className="inputBox" style={{ width: "8.5rem" }}>
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className={`${style.input} w-full`}
                />
                <span>Task Date</span>
              </div>

              <div>
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
                  className={`${style.input} w-full`}
                />
                <span>Hours</span>
              </div>

              <div className="flex items-center justify-end pl-4">
                <button
                  className={`${style.button1} text-[15px]`}
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

        <TasksTable table={table} />
      </div>
    </div>
  );
};

export default AllTasksDesktop;