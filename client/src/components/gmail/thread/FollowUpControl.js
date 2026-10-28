// mail/thread/FollowUpControl.js
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiRepeat } from "react-icons/fi";

const API = `${process.env.REACT_APP_API_URL}/api/v1/gmail/followups`;
const FREQS = [1, 2, 3, 5, 7, 10, 14];

export default function FollowUpControl({ companyName, threadId, canEnable = true }) {
  const [open, setOpen] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ frequencyDays: 5, maxFollowUps: 3, customInstructions: "" });

  const load = async () => {
    try {
      const { data } = await axios.get(API, { params: { companyName, threadId } });
      setSchedule(data.schedule);
      if (data.schedule) {
        const { frequencyDays, maxFollowUps, customInstructions } = data.schedule;
        setForm({ frequencyDays, maxFollowUps, customInstructions });
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, [companyName, threadId]);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await axios.post(API, { companyName, threadId, ...form });
      setSchedule(data.schedule);
      toast.success("Follow-ups scheduled");
      setOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const act = async (action) => {
    try {
      const { data } = await axios.post(`${API}/status`, { companyName, threadId, action });
      setSchedule(data.schedule);
      toast.success(action === "cancel" ? "Follow-ups stopped" : "Updated");
      if (action === "cancel") setOpen(false);
    } catch { toast.error("Failed"); }
  };

  const live = schedule && ["active", "paused"].includes(schedule.status);

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
        {live
          ? `Every ${schedule.frequencyDays}d · ${schedule.sentCount}/${schedule.maxFollowUps}${schedule.status === "paused" ? " (paused)" : ""}`
          : "Auto follow-up"}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
          <label className="text-xs font-semibold text-gray-600">Send every</label>
          <select
            value={form.frequencyDays}
            onChange={(e) => setForm({ ...form, frequencyDays: Number(e.target.value) })}
            className="mt-1 mb-3 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          >
            {FREQS.map((d) => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>)}
          </select>

          <label className="text-xs font-semibold text-gray-600">Max follow-ups</label>
          <input
            type="number" min={1} max={10}
            value={form.maxFollowUps}
            onChange={(e) => setForm({ ...form, maxFollowUps: Number(e.target.value) })}
            className="mt-1 mb-3 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          />

          <label className="text-xs font-semibold text-gray-600">Instructions (optional)</label>
          <textarea
            rows={3} maxLength={800}
            value={form.customInstructions}
            onChange={(e) => setForm({ ...form, customInstructions: e.target.value })}
            className="mt-1 mb-3 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
            placeholder="e.g. mention the quote we sent"
          />

          {live && (
            <p className="mb-3 text-xs text-gray-500">
              Next: {new Date(schedule.nextRunAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            </p>
          )}
          {schedule && !live && schedule.stopReason && (
            <p className="mb-3 text-xs text-gray-500">Stopped: {schedule.stopReason.replace(/_/g, " ")}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving || !canEnable}
              title={!canEnable ? "Client replied last. Reply first." : ""}
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