// mail/thread/FollowUpControl.js
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiClock,
  FiMessageCircle,
  FiPause,
  FiPlay,
  FiRepeat,
  FiShield,
  FiSlash,
  FiX,
} from "react-icons/fi";
import { HiXMark } from "react-icons/hi2";
import { IoBookmarkOutline } from "react-icons/io5";
import AiProjectManager from "../../ai/AiProjects/AiProjectManager"; // adjust path
import { Link } from "react-router-dom";
import { useClickOutside } from "../../../utlis/useClickOutside";

const API = `${process.env.REACT_APP_API_URL}/api/v1/gmail/followups`;
const FREQS = [1, 2, 3, 5, 7, 10, 14, 30];

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const TZS = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
if (!TZS.includes(BROWSER_TZ)) TZS.unshift(BROWSER_TZ);

// same key the reply selector uses, so a new schedule starts with the project you already picked there
const PROJECT_KEY = "ai_selected_project";
const savedProject = (companyName = "") => {
  try {
    const saved = localStorage.getItem(`${PROJECT_KEY}-${companyName.toLowerCase()}`);
    const p = saved ? JSON.parse(saved) : null;
    return p?._id ? p : null;
  } catch {
    return null;
  }
};



const DEFAULT_FORM = {
  autoReply: false,
  autoFollowUp: true,
  requireApproval: false,
  frequencyDays: 5,
  maxFollowUps: 3,
  startDate: "",
  sendTime: "09:00",
  timezone: "Asia/Karachi",
  customInstructions: "",
  project: null, // { _id, name, companyName }
};

const fmt = (d) => new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

const labelCls = "mb-1 block text-xs font-medium text-gray-600";
const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

// Selectable option card (still a real checkbox underneath)
function Check({ checked, onChange, label, hint, icon: Icon }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
        checked
          ? "border-orange-300 bg-orange-50/60 ring-1 ring-orange-200"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition ${
          checked ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
        }`}
      >
        {Icon && <Icon className="size-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-gray-800">{label}</span>
        {hint && <span className="mt-0.5 block text-xs leading-snug text-gray-500">{hint}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 shrink-0 accent-orange-500"
      />
    </label>
  );
}

export default function FollowUpControl({ companyName, threadId }) {



  const [open, setOpen] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [pending, setPending] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [showProjects, setShowProjects] = useState(false);
  const [projectMissing, setProjectMissing] = useState(false);


    const containerRef = useRef();
    useClickOutside(containerRef, () => setOpen(false))



  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const load = async () => {
    try {
      const { data } = await axios.get(API, { params: { companyName, threadId } });
      setSchedule(data.schedule);
      setPending(data.pending || 0);
      setProjectMissing(!!data.projectMissing);
      if (data.schedule) {
        const s = data.schedule;
        setForm({
          autoReply: !!s.autoReply,
          autoFollowUp: !!s.autoFollowUp,
          requireApproval: s.requireApproval !== false,
          frequencyDays: s.frequencyDays ?? 5,
          maxFollowUps: s.maxFollowUps ?? 3,
          startDate: s.startDate || "",
          sendTime: s.sendTime || "09:00",
          timezone: s.timezone || DEFAULT_FORM.timezone,
          customInstructions: s.customInstructions || "",
          project: data.project
            ? { _id: data.project._id, name: data.project.name, companyName: data.project.companyName }
            : null,
        });
      } else {
        setForm({ ...DEFAULT_FORM, project: savedProject(companyName) });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, [companyName, threadId]);

  const save = async () => {
    setSaving(true);
    try {
      const { project, ...rest } = form; // send the id, not the whole object
      const { data } = await axios.post(API, {
        companyName,
        threadId,
        ...rest,
        projectId: project?._id || null,
      });
      setSchedule(data.schedule);
      setProjectMissing(false);
      toast.success("Automation saved");
      setOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const act = async (action) => {
    try {
      const { data } = await axios.post(`${API}/status`, { companyName, threadId, action });
      setSchedule(data.schedule);
      toast.success(action === "cancel" ? "Automation stopped" : "Updated");
      if (action === "cancel") setOpen(false);
    } catch {
      toast.error("Failed");
    }
  };

  const live = schedule && ["active", "paused"].includes(schedule.status);
  const label = live
    ? [
        schedule.autoReply && "Auto-reply",
        schedule.autoFollowUp &&
          `Every ${schedule.frequencyDays}d · ${schedule.sentCount}/${schedule.maxFollowUps}`,
      ]
        .filter(Boolean)
        .join(" + ") + (schedule.status === "paused" ? " (paused)" : "")
    : "Auto email";

  // display only: decides whether the status panel has anything to show
  const hasStatus =
    (live && (schedule.autoFollowUp || schedule.autoReply)) ||
    pending > 0 ||
    (schedule && !live && schedule.stopReason);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition ${
          live && schedule.status === "active"
            ? "border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100"
            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
        }`}
      >
        {live && schedule.status === "active" ? (
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-orange-500" />
          </span>
        ) : (
          <FiRepeat />
        )}
        {label}
        {pending > 0 && (
          <span className="min-w-[18px] rounded-full bg-amber-500 px-1.5 text-center text-[10px] font-bold leading-[18px] text-white">
            {pending}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 flex max-h-[80vh] w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white">
                <FiRepeat className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">Email automation</p>
                <p className="truncate text-xs text-gray-500">Auto-reply and follow-ups for this thread</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {live && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    schedule.status === "active"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {schedule.status === "active" ? "Active" : "Paused"}
                </span>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close"
                className="rounded-md p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
              >
                <FiX className="size-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <div className="space-y-2">
              <Check
                icon={FiMessageCircle}
                checked={form.autoReply}
                onChange={(v) => set({ autoReply: v })}
                label="Auto-reply to client emails"
                hint="Answers right after a new email arrives. Only applies to emails received after you save."
              />
              <Check
                icon={FiClock}
                checked={form.autoFollowUp}
                onChange={(v) => set({ autoFollowUp: v })}
                label="Auto follow-up if no response"
              />
            </div>

            {form.autoFollowUp && (
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/60 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Follow-up schedule
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Send every</label>
                    <select
                      value={form.frequencyDays}
                      onChange={(e) => set({ frequencyDays: Number(e.target.value) })}
                      className={inputCls}
                    >
                      {FREQS.map((d) => (
                        <option key={d} value={d}>
                          {d} day{d > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Max follow-ups</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={form.maxFollowUps}
                      onChange={(e) => set({ maxFollowUps: Number(e.target.value) })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Start date (optional)</label>
                    <input
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={form.startDate}
                      onChange={(e) => set({ startDate: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Send at</label>
                    <input
                      type="time"
                      value={form.sendTime}
                      onChange={(e) => set({ sendTime: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Timezone</label>
                  <select
                    value={form.timezone}
                    onChange={(e) => set({ timezone: e.target.value })}
                    className={inputCls}
                  >
                    {TZS.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <Check
              icon={FiShield}
              checked={form.requireApproval}
              onChange={(v) => set({ requireApproval: v })}
              label="Ask admin approval before sending"
              hint="The AI writes the draft; an admin approves or edits it."
            />

            {/* AI project */}
            <div>
              <label className={labelCls}>AI project</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowProjects(true)}
                  className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-sm transition ${
                    form.project
                      ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100/70"
                      : "border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <IoBookmarkOutline className="shrink-0" />
                  <span className="truncate">{form.project?.name || "No project (default tone)"}</span>
                </button>
                {form.project && (
                  <button
                    type="button"
                    onClick={() => set({ project: null })}
                    title="Unlink project"
                    className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <HiXMark className="size-4" />
                  </button>
                )}
              </div>
              {projectMissing && !form.project && (
                <p className="mt-1.5 text-xs text-amber-600">
                  The linked project was deleted, so default settings are used. Pick another and save.
                </p>
              )}
            </div>

            {/* Instructions */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">Instructions (optional)</label>
                <span className="text-[11px] tabular-nums text-gray-400">
                  {form.customInstructions.length}/800
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={800}
                value={form.customInstructions}
                onChange={(e) => set({ customInstructions: e.target.value })}
                className={`${inputCls} resize-none`}
                placeholder="e.g. mention the quote we sent"
              />
            </div>

            {/* Status */}
            {hasStatus && (
              <div className="space-y-1.5 rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-3">
                {live && schedule.autoFollowUp && (
                  <p className="text-xs text-gray-600">
                    {schedule.nextRunAt
                      ? `Next follow-up: ${fmt(schedule.nextRunAt)}`
                      : "Follow-up timer starts after our next message"}
                  </p>
                )}
                {live && schedule.autoReply && (
                  <p className="text-xs text-gray-600">
                    Auto-replies sent: {schedule.replyCount}/{schedule.maxAutoReplies}
                  </p>
                )}

                {pending > 0 && (
                  <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs text-blue-600">
                    <p>{pending} draft awaiting approval</p>
                    <Link to={`/pending-approvals`} className="font-semibold underline-offset-2 hover:underline">
                      View
                    </Link>
                  </div>
                )}

                {schedule && !live && schedule.stopReason && (
                  <p className="text-xs text-gray-500">
                    Stopped: {schedule.stopReason.replace(/_/g, " ")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 border-t border-gray-100 bg-white px-4 py-3">
            <button
              onClick={save}
              disabled={saving || (!form.autoReply && !form.autoFollowUp)}
              className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {live ? "Update" : "Start"}
            </button>
            {live && (
              <>
                <button
                  onClick={() => act(schedule.status === "active" ? "pause" : "resume")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  {schedule.status === "active" ? (
                    <FiPause className="size-3.5" />
                  ) : (
                    <FiPlay className="size-3.5" />
                  )}
                  {schedule.status === "active" ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={() => act("cancel")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                >
                  <FiSlash className="size-3.5" />
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Same project picker as the reply selector. Portal avoids being clipped by the popover. */}
      {showProjects &&
        createPortal(
          <AiProjectManager
            companyName={(companyName || "").toLowerCase()}
            project={form.project || { _id: "", name: "", companyName: "" }}
            onClose={() => setShowProjects(false)}
            onSelect={(p) => {
              set({ project: { _id: p._id, name: p.name, companyName: p.companyName } });
              setShowProjects(false);
            }}
          />,
          document.body,
        )}
    </div>
  );
}