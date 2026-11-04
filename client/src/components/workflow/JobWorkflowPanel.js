import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { workflowApi, errMsg } from "./workflowApi";
import RichTextEditor from "./ui/RichTextEditor";
import RichTextView from "./ui/RichTextView";
import WorkflowUserSelect from "./ui/WorkflowUserSelect";
import { inputCls, btnPrimary, btnGhost, btnDanger } from "./ui/ui";




const OPEN = ["pending", "in_progress", "blocked"];
const STATUS = {
  pending: { label: "To do", cls: "bg-stone-100 text-stone-700" },
  in_progress: { label: "In progress", cls: "bg-amber-100 text-amber-800" },
  blocked: { label: "Blocked", cls: "bg-red-100 text-red-700" },
  done: { label: "Done", cls: "bg-emerald-100 text-emerald-700" },
  skipped: { label: "Skipped", cls: "bg-stone-100 text-stone-400" },
};

function StepCard({ step, index, total, users, busy, onPatch, onDelete, onMove }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(step.title);
  const [description, setDescription] = useState(step.description || "");
  const [note, setNote] = useState(step.note || "");

  useEffect(() => {
    if (!editing) {
      setTitle(step.title);
      setDescription(step.description || "");
    }
    setNote(step.note || "");
  }, [step, editing]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = step.dueDate && OPEN.includes(step.status) && new Date(step.dueDate) < today;
  const done = step.status === "done";

  const saveEdit = async () => {
    if (!title.trim()) return toast.error("Step needs a title");
    if (await onPatch(step._id, { title, description })) setEditing(false);
  };

  return (
    <li className={`rounded-md border bg-white p-3 ${done ? "border-emerald-200" : "border-stone-200"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
          {index + 1}
        </span>

        {editing ? (
          <input className={`${inputCls} min-w-[12rem] flex-1`} value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Step title" />
        ) : (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className={`min-w-[10rem] flex-1 text-left text-sm font-medium ${done ? "text-stone-400 line-through" : "text-stone-900"}`}
          >
            {step.title}
          </button>
        )}

        <select
          aria-label="Status"
          value={step.status}
          disabled={busy}
          onChange={(e) => onPatch(step._id, { status: e.target.value })}
          className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${STATUS[step.status].cls}`}
        >
          {Object.entries(STATUS).map(([value, s]) => (
            <option key={value} value={value}>{s.label}</option>
          ))}
        </select>

        <WorkflowUserSelect
          className="!w-40"
          users={users}
          value={step.assignee?._id || null}
          disabled={busy}
          onChange={(id) => onPatch(step._id, { assignee: id })}
        />

        <input
          type="date"
          aria-label="Due date"
          value={step.dueDate ? step.dueDate.slice(0, 10) : ""}
          disabled={busy}
          onChange={(e) => onPatch(step._id, { dueDate: e.target.value || null })}
          className={`${inputCls} !w-36 ${overdue ? "!border-red-400 text-red-600" : ""}`}
        />

        <div className="flex gap-1">
          <button type="button" className={btnGhost} onClick={() => onMove(-1)} disabled={busy || index === 0} aria-label="Move step up">↑</button>
          <button type="button" className={btnGhost} onClick={() => onMove(1)} disabled={busy || index === total - 1} aria-label="Move step down">↓</button>
        </div>
      </div>

      {(open || editing) && (
        <div className="mt-3 space-y-3 border-t border-stone-100 pt-3">
          {editing ? (
            <>
              <RichTextEditor value={description} onChange={setDescription} />
              <div className="flex gap-2">
                <button type="button" className={btnPrimary} onClick={saveEdit} disabled={busy}>Save step</button>
                <button type="button" className={btnGhost} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              {step.description ? (
                <RichTextView html={step.description} />
              ) : (
                <p className="text-sm text-stone-400">No instructions for this step.</p>
              )}
              <label className="block text-xs font-medium text-stone-600">
                Note
                <textarea
                  rows={2}
                  className={`${inputCls} mt-1`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={() => note !== (step.note || "") && onPatch(step._id, { note })}
                  placeholder="Anything the next person should know"
                />
              </label>
              {step.completedAt && (
                <p className="text-xs text-stone-500">
                  Completed {new Date(step.completedAt).toLocaleDateString()}
                  {step.completedBy?.name ? ` by ${step.completedBy.name}` : ""}
                </p>
              )}
              <div className="flex gap-2">
                <button type="button" className={btnGhost} onClick={() => setEditing(true)}>Edit step</button>
                <button
                  type="button"
                  className={btnDanger}
                  onClick={() => window.confirm(`Remove "${step.title}" from this job?`) && onDelete(step._id)}
                >
                  Remove step
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </li>
  );
}

// Drop into EditJobModal (as a tab) or a drawer: <JobWorkflowPanel clientId={job._id} users={users} />
export default function JobWorkflowPanel({ clientId, users = [], canManage = true, onChanged }) {
  const [wf, setWf] = useState(undefined); // undefined = loading, null = no workflow
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setWf(await workflowApi.getJobWorkflow(clientId));
    } catch (e) {
      toast.error(errMsg(e));
      setWf(null);
    }
  }, [clientId]);

  useEffect(() => {
    setWf(undefined);
    load();
  }, [load]);

  useEffect(() => {
    if (wf === null && canManage) workflowApi.listTemplates().then(setTemplates).catch((e) => toast.error(errMsg(e)));
  }, [wf, canManage]);

  // Runs an API call that returns the updated workflow. Resolves true on success.
  const run = async (fn) => {
    setBusy(true);
    try {
      setWf(await fn());
      onChanged?.();
      return true;
    } catch (e) {
      toast.error(errMsg(e));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const applyTemplate = async () => {
    setBusy(true);
    try {
      const res = await workflowApi.apply({ templateId, jobIds: [clientId], ifExists: "skip" });
      if (res.unresolvedSteps) toast("Some steps have no user. Assign them below.", { icon: "⚠️" });
      await load();
      onChanged?.();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const sync = async () => {
    setBusy(true);
    try {
      const res = await workflowApi.sync(clientId);
      setWf(res.workflow);
      onChanged?.();
      toast.success(res.upToDate ? "Already up to date" : `${res.added} step(s) added, ${res.updated} updated`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const removeWorkflow = async () => {
    if (!window.confirm("Remove this job's workflow? Step progress will be lost.")) return;
    setBusy(true);
    try {
      await workflowApi.removeJobWorkflow(clientId);
      setWf(null);
      onChanged?.();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const patchStep = (stepId, body) => run(() => workflowApi.updateStep(clientId, stepId, body));
  const deleteStep = (stepId) => run(() => workflowApi.deleteStep(clientId, stepId));
  const moveStep = (index, dir) => {
    const ids = wf.steps.map((s) => s._id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    return run(() => workflowApi.reorder(clientId, ids));
  };
  const addStep = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (await run(() => workflowApi.addStep(clientId, { title: newTitle }))) setNewTitle("");
  };

  if (wf === undefined) return <p className="text-sm text-stone-500">Loading workflow…</p>;

  if (wf === null && !canManage) {
    return <p className="text-sm text-stone-500">This job has no workflow yet. An admin can add one.</p>;
  }

  if (wf === null) {
    return (
      <div className="rounded-md border border-dashed border-stone-300 p-4">
        <p className="mb-3 text-sm text-stone-700">This job has no workflow yet. Pick a template to add one.</p>
        <div className="flex flex-wrap gap-2">
          <select className={`${inputCls} !w-64`} value={templateId} onChange={(e) => setTemplateId(e.target.value)} aria-label="Template">
            <option value="">Choose a template</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id}>{t.name} ({t.jobType})</option>
            ))}
          </select>
          <button type="button" className={btnPrimary} onClick={applyTemplate} disabled={busy || !templateId}>
            Apply workflow
          </button>
        </div>
      </div>
    );
  }

  const { done, total, percent } = wf.progress;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-stone-900">
            {wf.templateName || "Workflow"}
            {wf.templateVersion ? <span className="ml-1 font-normal text-stone-500">v{wf.templateVersion}</span> : null}
          </p>
          <p className="text-xs text-stone-500">{done} of {total} steps done</p>
        </div>
        <div className="flex gap-2">
          {wf.templateId && (
            <button type="button" className={btnGhost} onClick={sync} disabled={busy}>
              Update from template
            </button>
          )}
          {canManage && (
            <button type="button" className={btnDanger} onClick={removeWorkflow} disabled={busy}>
              Remove workflow
            </button>
          )}
        </div>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-stone-100"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Workflow progress"
      >
        <div className="h-full bg-orange-500 transition-[width]" style={{ width: `${percent}%` }} />
      </div>

      <ol className="space-y-2">
        {wf.steps.map((s, i) => (
          <StepCard
            key={s._id}
            step={s}
            index={i}
            total={wf.steps.length}
            users={users}
            busy={busy}
            onPatch={patchStep}
            onDelete={deleteStep}
            onMove={(dir) => moveStep(i, dir)}
          />
        ))}
      </ol>

      <form onSubmit={addStep} className="flex gap-2">
        <input
          className={inputCls}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a step to this job only"
          aria-label="New step title"
        />
        <button type="submit" className={btnGhost} disabled={busy || !newTitle.trim()}>
          Add step
        </button>
      </form>
    </div>
  );
}