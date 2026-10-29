// mail/thread/FollowUpControl.js (replace)
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiRepeat } from "react-icons/fi";

const API = `${process.env.REACT_APP_API_URL}/api/v1/gmail/followups`;
const FREQS = [1, 2, 3, 5, 7, 10, 14];

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const TZS = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
if (!TZS.includes(BROWSER_TZ)) TZS.unshift(BROWSER_TZ);

const DEFAULT_FORM = {
  autoReply: false,
  autoFollowUp: true,
  requireApproval: true,
  frequencyDays: 5,
  maxFollowUps: 3,
  startDate: "",
  sendTime: "09:00",
  timezone: BROWSER_TZ,
  customInstructions: "",
};

const fmt = (d) => new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
const inputCls = "mt-1 mb-3 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm";

function Check({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 accent-orange-500"
      />
      <span className="text-sm text-gray-700">
        {label}
        {hint && <span className="block text-xs text-gray-400">{hint}</span>}
      </span>
    </label>
  );
}

export default function FollowUpControl({ companyName, threadId }) {
  const [open, setOpen] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [pending, setPending] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const load = async () => {
    try {
      const { data } = await axios.get(API, { params: { companyName, threadId } });
      setSchedule(data.schedule);
      setPending(data.pending || 0);
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
          timezone: s.timezone || BROWSER_TZ,
          customInstructions: s.customInstructions || "",
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, [companyName, threadId]);

  const save = async () => {
    return;
    setSaving(true);
    try {
      const { data } = await axios.post(API, { companyName, threadId, ...form });
      setSchedule(data.schedule);
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

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
          live && schedule.status === "active"
            ? "border-orange-300 bg-orange-50 text-orange-600"
            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
        }`}
      >
        <FiRepeat />
        {label}
        {pending > 0 && <span className="rounded-full bg-amber-500 px-1.5 text-white">{pending}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 max-h-[80vh] w-80 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
          <Check
            checked={form.autoReply}
            onChange={(v) => set({ autoReply: v })}
            label="Auto-reply to client emails"
            hint="Answers right after a new email arrives. Only applies to emails received after you save."
          />
          <Check
            checked={form.autoFollowUp}
            onChange={(v) => set({ autoFollowUp: v })}
            label="Auto follow-up if no response"
          />

          {form.autoFollowUp && (
            <div className="mt-2 rounded-lg bg-gray-50 p-3">
              <label className="text-xs font-semibold text-gray-600">Send every</label>
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

              <label className="text-xs font-semibold text-gray-600">Max follow-ups</label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.maxFollowUps}
                onChange={(e) => set({ maxFollowUps: Number(e.target.value) })}
                className={inputCls}
              />

              <label className="text-xs font-semibold text-gray-600">Start date (optional)</label>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={form.startDate}
                onChange={(e) => set({ startDate: e.target.value })}
                className={inputCls}
              />

              <label className="text-xs font-semibold text-gray-600">Send at</label>
              <input
                type="time"
                value={form.sendTime}
                onChange={(e) => set({ sendTime: e.target.value })}
                className={inputCls}
              />
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
          )}

          <div className="mt-3">
            <Check
              checked={form.requireApproval}
              onChange={(v) => set({ requireApproval: v })}
              label="Ask admin approval before sending"
              hint="The AI writes the draft; an admin approves or edits it."
            />
          </div>

          <label className="text-xs font-semibold text-gray-600">Instructions (optional)</label>
          <textarea
            rows={3}
            maxLength={800}
            value={form.customInstructions}
            onChange={(e) => set({ customInstructions: e.target.value })}
            className={inputCls}
            placeholder="e.g. mention the quote we sent"
          />

          {live && schedule.autoFollowUp && (
            <p className="mb-1 text-xs text-gray-500">
              {schedule.nextRunAt
                ? `Next follow-up: ${fmt(schedule.nextRunAt)}`
                : "Follow-up timer starts after our next message"}
            </p>
          )}
          {live && schedule.autoReply && (
            <p className="mb-1 text-xs text-gray-500">
              Auto-replies sent: {schedule.replyCount}/{schedule.maxAutoReplies}
            </p>
          )}
          {pending > 0 && <p className="mb-1 text-xs text-amber-600">{pending} draft awaiting approval</p>}
          {schedule && !live && schedule.stopReason && (
            <p className="mb-1 text-xs text-gray-500">Stopped: {schedule.stopReason.replace(/_/g, " ")}</p>
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={save}
              disabled={saving || (!form.autoReply && !form.autoFollowUp)}
              className="flex-1 rounded-lg bg-orange-500 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {live ? "Update" : "Start"}
            </button>
            {live && (
              <>
                <button
                  onClick={() => act(schedule.status === "active" ? "pause" : "resume")}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                >
                  {schedule.status === "active" ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={() => act("cancel")}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600"
                >
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}