import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { workflowApi, errMsg } from "./workflowApi";
import { btnGhost } from "./ui/ui";


const LABEL = { pending: "To do", in_progress: "In progress", blocked: "Blocked" };

// "My steps": open workflow steps assigned to the logged-in user, across all jobs.
// onOpenJob(clientId, row) is optional, e.g. to open the job detail on its Workflow tab.
export default function MyWorkflowSteps({ onOpenJob }) {
  const [rows, setRows] = useState(null);

  const load = useCallback(async () => {
    try {
      setRows(await workflowApi.mySteps());
    } catch (e) {
      toast.error(errMsg(e));
      setRows([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (row, status) => {
    try {
      await workflowApi.updateStep(row.clientId, row.stepId, { status });
      load(); // done steps drop out of this list
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  if (rows === null) return <p className="text-sm text-stone-500">Loading your steps…</p>;
  if (!rows.length) return <p className="text-sm text-stone-500">Nothing assigned to you right now.</p>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <ul className="divide-y divide-stone-100 rounded-md border border-stone-200 bg-white">
      {rows.map((r) => {
        const overdue = r.dueDate && new Date(r.dueDate) < today;
        return (
          <li key={r.stepId} className="flex flex-wrap items-center gap-3 px-3 py-2">
            <div className="min-w-[12rem] flex-1">
              <p className="text-sm font-medium text-stone-900">{r.title}</p>
              <p className="text-xs text-stone-500">
                {r.clientName || r.companyName}
                {r.jobName ? ` · ${r.jobName}` : ""}
              </p>
            </div>
            <span className={`text-xs ${overdue ? "font-medium text-red-600" : "text-stone-500"}`}>
              {r.dueDate ? `Due ${new Date(r.dueDate).toLocaleDateString()}` : "No due date"}
            </span>
            <select
              aria-label="Status"
              value={r.status}
              onChange={(e) => setStatus(r, e.target.value)}
              className="rounded-md border border-stone-300 bg-white px-2 py-1 text-xs"
            >
              {Object.entries(LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
              <option value="done">Done</option>
            </select>
            {onOpenJob && (
              <button type="button" className={btnGhost} onClick={() => onOpenJob(r.clientId, r)}>
                Open job
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}