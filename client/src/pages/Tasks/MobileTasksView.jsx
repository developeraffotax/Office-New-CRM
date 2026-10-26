import { useEffect, useState } from "react";
import {
  FiSearch, FiSliders, FiRefreshCw, FiPlus, FiMoreVertical, FiX, FiCheck,
  FiExternalLink, FiCheckCircle, FiTrash2, FiUpload, FiDownload, FiTag,
  FiPlusCircle,
} from "react-icons/fi";
import { TbLoader2 } from "react-icons/tb";
import BottomSheet from "./components/BottomSheet";
import MobileTaskCard from "./components/MobileTaskCard";
import OutsideFilter from "../Jobs/utils/OutsideFilter";
import { dotColors, textColors } from "./constants";

const noScrollbar = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const Chip = ({ active, onClick, children, count, dot }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition active:scale-95 ${
      active
        ? "border-orange-300 bg-orange-50 text-orange-700"
        : "border-slate-200 bg-white text-slate-600"
    }`}
  >
    {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
    {children}
    {count !== undefined && (
      <span className={`text-[11px] ${active ? "text-orange-500" : "text-slate-400"}`}>
        {count}
      </span>
    )}
  </button>
);

const IconBtn = ({ onClick, label, badge, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 active:bg-slate-100"
  >
    {children}
    {badge > 0 && (
      <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
        {badge}
      </span>
    )}
  </button>
);

const Section = ({ title, children }) => (
  <section className="px-4 py-3">
    <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {title}
    </h4>
    <div className="flex flex-wrap gap-2">{children}</div>
  </section>
);

const SheetRow = ({ icon: Icon, label, onClick, danger, as: As = "button", htmlFor }) => (
  <As
    htmlFor={htmlFor}
    onClick={onClick}
    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3.5 text-left text-[15px] active:bg-slate-100 ${
      danger ? "text-red-600" : "text-slate-800"
    }`}
  >
    <Icon className={`h-5 w-5 ${danger ? "text-red-500" : "text-slate-400"}`} />
    {label}
  </As>
);

export default function MobileTasksView({
  canManage,        // admin: show "more" menu
  canDelete,        // who can delete (match your actionsColumn rules)
  canFilterUsers,   // admin || team lead
  tasksData,
  loading,
  rowCount,
  setPagination,
  status,
  setStatus,
  columnFilters,
  setColumnFromOutsideTable,
  onClearFilters,
  dueStatusFilter,
  jobHolderFilter,
  taskStatusFilter,
  projectFilter,
  projects,
  selectedUsers,
  statusArr,
  counts, // { due, user, taskStatus, project, total }
  savedFilters,
  activeFilter,
  onToggleSaved,
  searchValue,
  onSearch,
  runningTaskId,
  onOpenTask,
  onComment,
  onAdd,
  onRefresh,
  onStatusChange,
  onComplete,
  onDelete,
  adminActions, // { onImport, onExport, onAddLabel, onAddDepartment, importing }
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [actionTask, setActionTask] = useState(null);
  const [statusTask, setStatusTask] = useState(null);

  const isCompleted = status === "completed";
  const activeCount = columnFilters?.length || 0;
  const hasMore = (tasksData?.length || 0) < (rowCount || 0);

  // debounced search
  const [q, setQ] = useState(searchValue || "");
  useEffect(() => setQ(searchValue || ""), [searchValue]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== (searchValue || "")) onSearch(q);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [q]);

  const toggle = (col, current, value) =>
    setColumnFromOutsideTable(col, current === value ? undefined : value);

  const loadMore = () =>
    setPagination((p) => ({ ...p, pageSize: p.pageSize + 20 }));

  return (
    <div className="flex min-h-full flex-col bg-slate-50 font-google">
      {/* ───────── Sticky top ───────── */}
      <div
        className="sticky top-0 z-30 space-y-2.5 border-b border-slate-200 bg-white px-3 pb-2.5 pt-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h1 className="relative text-xl font-semibold tracking-wide text-slate-800 before:absolute before:-bottom-1.5 before:left-0 before:h-[3px] before:w-8 before:bg-orange-500">
              Tasks
            </h1>
            <span className="ml-1 text-xs text-slate-400">{rowCount ?? 0}</span>
          </div>

          <div className="flex items-center gap-1.5">

             

            <IconBtn label="Refresh" onClick={onRefresh}>
              <FiRefreshCw className={`h-[18px] w-[18px] ${loading ? "animate-spin" : ""}`} />
            </IconBtn>
            <IconBtn label="Filters" badge={activeCount} onClick={() => setFiltersOpen(true)}>
              <FiSliders className="h-[18px] w-[18px]" />
            </IconBtn>
            {canManage && (
              <IconBtn label="More" onClick={() => setMoreOpen(true)}>
                <FiMoreVertical className="h-[18px] w-[18px]" />
              </IconBtn>
            )}
          </div>
        </div>

        {/* In-progress / Completed */}
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          {[
            { label: "In-Progress", value: "progress" },
            { label: "Completed", value: "completed" },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setStatus(value)}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-medium transition ${
                status === value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <span
                className={`h-[7px] w-[7px] rounded-full ${
                  status === value ? dotColors[value] : "bg-slate-300"
                }`}
              />
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tasks…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-[14px] outline-none focus:border-orange-300 focus:bg-white"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick chips: saved filters + due status */}
        {(savedFilters?.length > 0 || !isCompleted) && (
          <div
            className="-mx-3 flex gap-2 overflow-x-auto px-3 [&::-webkit-scrollbar]:hidden"
            style={noScrollbar}
          >
           

            {/* {!isCompleted &&
              [
                { label: "Due", value: "due" },
                { label: "Overdue", value: "overdue" },
                { label: "Upcoming", value: "upcoming" },
              ].map(({ label, value }) => (
                <Chip
                  key={value}
                  active={dueStatusFilter === value}
                  dot={dueStatusFilter === value ? dotColors[value] : undefined}
                  count={counts.due(value)}
                  onClick={() => toggle("datestatus", dueStatusFilter, value)}
                >
                  <span className={dueStatusFilter === value ? textColors[value] : ""}>
                    {label}
                  </span>
                </Chip>
              ))} */}

               <OutsideFilter
                setColumnFromOutsideTable={setColumnFromOutsideTable}
                title="taskDate"
                columnFilters={columnFilters}
              />

               {savedFilters?.map((f) => (
              <Chip
                key={f._id}
                active={activeFilter?._id === f._id}
                onClick={() => onToggleSaved(f)}
              >
                {f.name}
              </Chip>
            ))}


          </div>
        )}

        {loading && tasksData?.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-orange-100">
            <div className="h-full w-1/3 animate-pulse bg-orange-500" />
          </div>
        )}
      </div>

      {/* ───────── List ───────── */}
      <div className="flex-1 px-3 py-3" style={{ paddingBottom: "7rem" }}>
        {loading && !tasksData?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : tasksData?.length ? (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              {tasksData.map((task) => (
                <MobileTaskCard
                  key={task._id}
                  task={task}
                  isCompleted={isCompleted}
                  isTimerRunning={runningTaskId === task._id}
                  onOpen={onOpenTask}
                  onMore={setActionTask}
                  onStatus={setStatusTask}
                  onComment={onComment}
                />
              ))}
            </div>

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="mx-auto mt-4 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-[14px] font-medium text-slate-700 active:bg-slate-100"
              >
                {loading && <TbLoader2 className="h-4 w-4 animate-spin" />}
                Load more · {tasksData.length}/{rowCount}
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <FiCheckCircle className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-[15px] font-medium text-slate-700">No tasks found</p>
            <p className="mt-1 text-[13px] text-slate-400">
              Try changing or clearing your filters
            </p>
            {activeCount > 0 && (
              <button
                onClick={onClearFilters}
                className="mt-4 h-10 rounded-xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-slate-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ───────── FAB ───────── */}
      <button
        onClick={onAdd}
        aria-label="Add task"
        className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-300/50 active:scale-95 active:bg-orange-600"
        style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
      >
        <FiPlus className="h-6 w-6" />
      </button>

      {/* ───────── Filters sheet ───────── */}
      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        tall
        footer={
          <div className="flex gap-2 p-3">
            <button
              onClick={onClearFilters}
              className="h-11 flex-1 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-700"
            >
              Clear all
            </button>
            <button
              onClick={() => setFiltersOpen(false)}
              className="h-11 flex-[1.4] rounded-xl bg-orange-500 text-[14px] font-medium text-white"
            >
              Show {rowCount ?? 0} tasks
            </button>
          </div>
        }
      >
        <Section title="Department">
          <Chip
            active={!projectFilter}
            count={counts.total}
            onClick={() => setColumnFromOutsideTable("departmentName", "")}
          >
            All
          </Chip>
          {projects?.map((p) => (
            <Chip
              key={p._id}
              active={projectFilter === p._id}
              count={counts.project(p._id)}
              onClick={() => toggle("departmentName", projectFilter, p._id)}
            >
              {p.projectName}
            </Chip>
          ))}
        </Section>

        {canFilterUsers && (
          <>
            <hr className="border-slate-100" />
            <Section title="Assigned to">
              {selectedUsers?.map((name) => (
                <Chip
                  key={name}
                  active={jobHolderFilter === name}
                  count={counts.user(name)}
                  onClick={() => toggle("jobHolder", jobHolderFilter, name)}
                >
                  {name}
                </Chip>
              ))}
            </Section>
          </>
        )}

        {!isCompleted && (
          <>
            <hr className="border-slate-100" />
            <Section title="Status">
              {statusArr?.map((s) => (
                <Chip
                  key={s}
                  active={taskStatusFilter === s}
                  count={counts.taskStatus(s)}
                  onClick={() => toggle("taskStatus", taskStatusFilter, s)}
                >
                  {s}
                </Chip>
              ))}
            </Section>
          </>
        )}

        {canFilterUsers && (
          <>
            <hr className="border-slate-100" />
            <section className="px-4 py-3">
              <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Task date
              </h4>
              <OutsideFilter
                setColumnFromOutsideTable={setColumnFromOutsideTable}
                title="taskDate"
                columnFilters={columnFilters}
              />
            </section>
          </>
        )}
      </BottomSheet>

      {/* ───────── Task action sheet ───────── */}
      <BottomSheet
        open={!!actionTask}
        onClose={() => setActionTask(null)}
        title={actionTask?.task}
      >
        <div className="p-2">
          <SheetRow
            icon={FiExternalLink}
            label="Open details"
            onClick={() => {
              onOpenTask(actionTask);
              setActionTask(null);
            }}
          />
          {!isCompleted && (
            <SheetRow
              icon={FiCheckCircle}
              label="Mark as complete"
              onClick={() => {
                onComplete(actionTask._id);
                setActionTask(null);
              }}
            />
          )}
          {canDelete && (
            <SheetRow
              danger
              icon={FiTrash2}
              label="Delete task"
              onClick={() => {
                onDelete(actionTask._id);
                setActionTask(null);
              }}
            />
          )}
        </div>
      </BottomSheet>

      {/* ───────── Status sheet ───────── */}
      <BottomSheet
        open={!!statusTask}
        onClose={() => setStatusTask(null)}
        title="Change status"
      >
        <ul className="p-2">
          {statusArr?.map((s) => (
            <li key={s}>
              <button
                onClick={() => {
                  onStatusChange(statusTask, s);
                  setStatusTask(null);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-[15px] text-slate-800 active:bg-slate-100"
              >
                {s}
                {statusTask?.status === s && <FiCheck className="h-5 w-5 text-orange-500" />}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>

      {/* ───────── More (admin) sheet ───────── */}
      {canManage && (
        <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
          <div className="p-2">
            <input
              id="importJobsMobile"
              type="file"
              accept=".csv, .xlsx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                e.target.value = "";
                setMoreOpen(false);
                adminActions.onImport(file);
              }}
            />
            <SheetRow as="label" htmlFor="importJobsMobile" icon={FiUpload} label="Import CSV / Excel" />
            <SheetRow
              icon={FiDownload}
              label="Export data"
              onClick={() => {
                adminActions.onExport();
                setMoreOpen(false);
              }}
            />
            <SheetRow
              icon={FiTag}
              label="Add label"
              onClick={() => {
                adminActions.onAddLabel();
                setMoreOpen(false);
              }}
            />
            <SheetRow
              icon={FiPlusCircle}
              label="Add department"
              onClick={() => {
                adminActions.onAddDepartment();
                setMoreOpen(false);
              }}
            />
          </div>
        </BottomSheet>
      )}
    </div>
  );
}