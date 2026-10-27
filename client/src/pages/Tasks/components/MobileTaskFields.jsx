import { useMemo, useState } from "react";
import { addDays, format, isValid } from "date-fns";
import {
  FiCalendar, FiCheck, FiChevronRight, FiClock, FiEdit3, FiFlag,
  FiFolder, FiLoader, FiSearch, FiUser, FiUserCheck,
} from "react-icons/fi";
import BottomSheet from "./BottomSheet";
import { statusArr } from "../constants";

const AVATAR_COLORS = [
  "bg-orange-500", "bg-sky-500", "bg-emerald-500", "bg-violet-500",
  "bg-rose-500", "bg-teal-500", "bg-indigo-500", "bg-amber-500",
];
const hashStr = (s = "") => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

const STATUS_STYLES = {
  "To do": "bg-slate-100 text-slate-700",
  Progress: "bg-blue-50 text-blue-700",
  Review: "bg-violet-50 text-violet-700",
  Onhold: "bg-amber-50 text-amber-700",
};


const DATE_KEYS = ["startDate", "deadline", "taskDate"];


const toInput = (d) => {
  if (!d) return "";
  const x = new Date(d);
  return isValid(x) ? format(x, "yyyy-MM-dd") : "";
};
const show = (d) => {
  const x = d ? new Date(d) : null;
  return x && isValid(x) ? format(x, "dd MMM yyyy") : "Not set";
};

const TITLES = {
  task: "Task", project: "Department", jobHolder: "Job holder", lead: "Lead",
  status: "Status", hours: "Hours", startDate: "Start date", deadline: "Deadline",    taskDate: "Task date",
};
const KINDS = {
  task: "text", hours: "text",
  startDate: "date", deadline: "date", taskDate: "date",
  jobHolder: "user", lead: "user",
  project: "project", status: "status",
};

const Avatar = ({ name, size = "h-6 w-6" }) => (
  <span
    className={`flex ${size} shrink-0 items-center justify-center rounded-full text-[11px] font-semibold uppercase text-white ${
      AVATAR_COLORS[hashStr(name) % AVATAR_COLORS.length]
    }`}
  >
    {name?.slice(0, 1) || "?"}
  </span>
);

const Row = ({ icon: Icon, label, onClick, busy, wrap, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    className="flex w-full items-center gap-3 px-3 py-3 text-left active:bg-gray-50 disabled:active:bg-transparent"
  >
    <Icon className="h-4 w-4 shrink-0 text-gray-400" />
    <span className="w-24 shrink-0 text-[13px] text-gray-500">{label}</span>
    <div
      className={`min-w-0 flex-1 text-[14px] font-medium text-gray-800 ${
        wrap ? "whitespace-normal break-words" : "truncate"
      }`}
    >
      {children}
    </div>
    {onClick &&
      (busy ? (
        <FiLoader className="h-4 w-4 shrink-0 animate-spin text-orange-500" />
      ) : (
        <FiChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
      ))}
  </button>
);

/**
 * onSave(patch) must return a Promise<boolean> (true = saved).
 * patch keys: task | projectId | jobHolder | lead | status | hours | startDate | deadline | taskDate
 */
export default function MobileTaskFields({ task, users = [], projects = [], onSave }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(null);

  const kind = editing ? KINDS[editing] : null;

  const filteredUsers = useMemo(() => {
    const s = q.trim().toLowerCase();
    return users.filter((u) => u?.name && u.name.toLowerCase().includes(s));
  }, [users, q]);

  const open = (key) => {
    const initial = {
      task: task?.task,
      hours: task?.hours,
      startDate: toInput(task?.startDate),
      deadline: toInput(task?.deadline),
       taskDate: toInput(task?.taskDate),
    }[key];
    setDraft(initial == null ? "" : String(initial));
    setQ("");
    setEditing(key);
  };

  const close = () => {
    if (!busy) setEditing(null);
  };

  const commit = async (patch) => {
    setBusy(editing);
    const ok = await onSave(patch);
    setBusy(null);
    if (ok) setEditing(null);
  };

  // list pickers: save immediately (skip the request if nothing changed)
  const pick = (patch, current, next) => {
    if (current === next) return setEditing(null);
    commit(patch);
  };

  const saveDraft = () => {
    const v = draft.trim();
    if (!v) return;
    const current = String(
  DATE_KEYS.includes(editing) ? toInput(task?.[editing]) : task?.[editing] ?? "",
);
    if (v === current) return setEditing(null);
    commit({ [editing]: v });
  };

  return (
    <>
      <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <Row icon={FiEdit3} label="Task" wrap busy={busy === "task"} onClick={() => open("task")}>
          {task?.task}
        </Row>

        <Row icon={FiFolder} label="Department" busy={busy === "project"} onClick={() => open("project")}>
          {task?.project?.projectName || "None"}
        </Row>

        <Row icon={FiUser} label="Job holder" busy={busy === "jobHolder"} onClick={() => open("jobHolder")}>
          {task?.jobHolder ? (
            <span className="flex items-center gap-2">
              <Avatar name={task.jobHolder} />
              <span className="truncate capitalize">{task.jobHolder}</span>
            </span>
          ) : (
            "Unassigned"
          )}
        </Row>

        <Row icon={FiUserCheck} label="Lead" busy={busy === "lead"} onClick={() => open("lead")}>
          {task?.lead ? (
            <span className="flex items-center gap-2">
              <Avatar name={task.lead} />
              <span className="truncate capitalize">{task.lead}</span>
            </span>
          ) : (
            "Not set"
          )}
        </Row>

        <Row icon={FiFlag} label="Status" busy={busy === "status"} onClick={() => open("status")}>
          {task?.status ? (
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] ${
                STATUS_STYLES[task.status] || "bg-slate-100 text-slate-700"
              }`}
            >
              {task.status}
            </span>
          ) : (
            "Not set"
          )}
        </Row>

        <Row icon={FiClock} label="Hours" busy={busy === "hours"} onClick={() => open("hours")}>
          {task?.hours ? `${task.hours}h` : "Not set"}
        </Row>

        <Row icon={FiClock} label="Spent">
          {task?.estimate_Time ?? "—"}
        </Row>

        <Row icon={FiCalendar} label="Start date" busy={busy === "startDate"} onClick={() => open("startDate")}>
          {show(task?.startDate)}
        </Row>

        <Row icon={FiCalendar} label="Deadline" busy={busy === "deadline"} onClick={() => open("deadline")}>
          {show(task?.deadline)}
        </Row>

        <Row icon={FiCalendar} label="Task date" busy={busy === "taskDate"} onClick={() => open("taskDate")}>
          {show(task?.taskDate)}
        </Row>
      </div>

      <BottomSheet
        open={!!editing}
        onClose={close}
        title={editing ? TITLES[editing] : ""}
        tall={kind === "user"}
        flush={kind === "user"}
        footer={
          kind === "text" || kind === "date" ? (
            <div className="flex gap-2 p-3">
              <button
                type="button"
                onClick={close}
                className="h-11 flex-1 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveDraft}
                disabled={!draft.trim() || !!busy}
                className="flex h-11 flex-[1.4] items-center justify-center rounded-xl bg-orange-500 text-[14px] font-medium text-white disabled:opacity-50"
              >
                {busy ? <FiLoader className="h-4 w-4 animate-spin" /> : "Save"}
              </button>
            </div>
          ) : undefined
        }
      >
        {kind === "text" && (
          <div className="p-4">
            {editing === "task" ? (
              <textarea
                autoFocus
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 p-3 text-[16px] outline-none focus:border-orange-300"
              />
            ) : (
              <input
                autoFocus
                inputMode="decimal"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="e.g. 2.5"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[16px] outline-none focus:border-orange-300"
              />
            )}
          </div>
        )}

        {kind === "date" && (
            <div className="p-4">
              {editing === "taskDate" && (
                <div className="mb-3 flex gap-2">
                  {[["Today", 0], ["Tomorrow", 1]].map(([label, n]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setDraft(format(addDays(new Date(), n), "yyyy-MM-dd"))}
                      className="h-9 rounded-full border border-slate-200 px-4 text-[13px] font-medium text-slate-700 active:bg-slate-100"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <input
                type="date"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[16px] outline-none focus:border-orange-300"
              />
            </div>
          )}

        {kind === "user" && (
          <>
            <div className="shrink-0 p-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search people…"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-[16px] outline-none focus:border-orange-300 focus:bg-white"
                />
              </div>
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2">
              {filteredUsers.map((u) => (
                <li key={u._id}>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => pick({ [editing]: u.name }, task?.[editing], u.name)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-slate-100 disabled:opacity-60"
                  >
                    <Avatar name={u.name} size="h-8 w-8" />
                    <span className="flex-1 truncate text-[15px] text-slate-800">{u.name}</span>
                    {task?.[editing] === u.name &&
                      (busy ? (
                        <FiLoader className="h-5 w-5 animate-spin text-orange-500" />
                      ) : (
                        <FiCheck className="h-5 w-5 text-orange-500" />
                      ))}
                  </button>
                </li>
              ))}
              {!filteredUsers.length && (
                <li className="py-8 text-center text-[13px] text-slate-400">No users found</li>
              )}
            </ul>
          </>
        )}

        {kind === "project" && (
          <ul className="p-2">
            {projects.map((p) => (
              <li key={p._id}>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => pick({ projectId: p._id }, task?.project?._id, p._id)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-left text-[15px] text-slate-800 active:bg-slate-100 disabled:opacity-60"
                >
                  {p.projectName}
                  {task?.project?._id === p._id && <FiCheck className="h-5 w-5 text-orange-500" />}
                </button>
              </li>
            ))}
          </ul>
        )}

        {kind === "status" && (
          <ul className="p-2">
            {statusArr.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => pick({ status: s }, task?.status, s)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-left text-[15px] text-slate-800 active:bg-slate-100 disabled:opacity-60"
                >
                  {s}
                  {task?.status === s && <FiCheck className="h-5 w-5 text-orange-500" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </BottomSheet>
    </>
  );
}