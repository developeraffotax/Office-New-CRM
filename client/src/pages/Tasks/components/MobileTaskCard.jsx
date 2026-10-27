import { memo } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import {
  FiClock,
  FiMessageSquare,
  FiMoreVertical,
  FiCheckSquare,
  FiCalendar,
} from "react-icons/fi";

const STATUS_STYLES = {
  "To do": "bg-slate-100 text-slate-700",
  Progress: "bg-blue-50 text-blue-700",
  Review: "bg-violet-50 text-violet-700",
  Onhold: "bg-amber-50 text-amber-700",
  completed: "bg-green-50 text-green-700",
};

const AVATAR_COLORS = [
  "bg-orange-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-amber-500",
];

const hash = (s = "") => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

const getDue = (deadline) => {
  if (!deadline) return null;
  const diff = differenceInCalendarDays(new Date(deadline), new Date());
  if (diff < 0)
    return { label: `${Math.abs(diff)}d overdue`, cls: "bg-red-50 text-red-600" };
  if (diff === 0) return { label: "Due today", cls: "bg-amber-50 text-amber-700" };
  if (diff === 1) return { label: "Tomorrow", cls: "bg-slate-100 text-slate-600" };
  return {
    label: format(new Date(deadline), "dd MMM"),
    cls: "bg-slate-100 text-slate-600",
  };
};

function MobileTaskCard({
  task,
  isCompleted,
  isTimerRunning,
  onOpen,
  onMore,
  onStatus,
  onComment,
}) {
  const due = !isCompleted ? getDue(task.deadline) : null;
  const statusKey = isCompleted ? "completed" : task.status;
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : null;
  const doneSubtasks = subtasks?.filter((s) => s.status === "complete").length;

  return (
    <article
      onClick={() => onOpen(task)}
      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-colors active:bg-slate-50"
    >
      {/* top: project + date + indicators */}
      <div className="flex items-center justify-between gap-2">
        <span className="max-w-[55%] truncate rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700">
          {task.project?.projectName || "No department"}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Task Date */}
          {task.taskDate && (
            <span className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              <FiCalendar className="h-3 w-3" />
              {format(new Date(task.taskDate), "dd MMM yyyy")}
            </span>
          )}

          {isTimerRunning && (
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              Running
            </span>
          )}

          <button
            aria-label="More actions"
            onClick={(e) => {
              e.stopPropagation();
              onMore(task);
            }}
            className="-mr-1.5 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 active:bg-slate-100"
          >
            <FiMoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* title */}
      <h3
        className="mt-1 text-[15px] font-medium leading-snug text-slate-900"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {task.task}
      </h3>

      {/* meta */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-slate-500">
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold uppercase text-white ${
              AVATAR_COLORS[hash(task.jobHolder) % AVATAR_COLORS.length]
            }`}
          >
            {task.jobHolder?.slice(0, 1) || "?"}
          </span>
          <span className="truncate capitalize">
            {task.jobHolder || "Unassigned"}
          </span>
        </span>

        {task.hours ? (
          <span className="flex items-center gap-1">
            <FiClock className="h-3.5 w-3.5" />
            {task.hours}h
          </span>
        ) : null}

        {subtasks && subtasks.length > 0 && (
          <span className="flex items-center gap-1">
            <FiCheckSquare className="h-3.5 w-3.5" />
            {doneSubtasks}/{subtasks.length}
          </span>
        )}
      </div>

      {/* footer */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-1.5">
          <button
            disabled={isCompleted}
            onClick={(e) => {
              e.stopPropagation();
              onStatus(task);
            }}
            className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${
              STATUS_STYLES[statusKey] || "bg-slate-100 text-slate-600"
            }`}
          >
            {isCompleted ? "Completed" : task.status || "Set status"}
          </button>
          {due && (
            <span
              className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${due.cls}`}
            >
              {due.label}
            </span>
          )}
        </div>
        <button
          aria-label="Comments"
          onClick={(e) => {
            e.stopPropagation();
            onComment(e.currentTarget, task);
          }}
          className="-mr-1.5 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
        >
          <FiMessageSquare className="h-[18px] w-[18px]" />
        </button>
      </div>
    </article>
  );
}

export default memo(MobileTaskCard);