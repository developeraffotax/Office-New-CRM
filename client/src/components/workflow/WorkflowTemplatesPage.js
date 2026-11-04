import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { workflowApi, errMsg } from "./workflowApi";
import RichTextEditor from "./ui/RichTextEditor";
import WorkflowUserSelect from "./ui/WorkflowUserSelect";
import ApplyTemplateDialog from "./ui/ApplyTemplateDialog";
import BulkReassignDialog from "./ui/BulkReassignDialog";
import { inputCls, btnPrimary, btnGhost, btnDanger } from "./ui/ui";
import axios from "axios";

const MODES = [
  { value: "jobHolder", label: "Job holder" },
  { value: "leadUser", label: "Lead user" },
  { value: "fixed", label: "Specific user" },
  { value: "unassigned", label: "Unassigned" },
];

let seq = 0;
const blankStep = () => ({
  _key: `new-${Date.now()}-${seq++}`,
  title: "",
  description: "",
  assigneeMode: "jobHolder",
  assignee: null,
  dueOffsetDays: "",
});
const blankDraft = () => ({
  name: "",
  jobType: "",
  description: "",
  isActive: true,
  steps: [blankStep()],
});
const toDraft = (t) => ({
  _id: t._id,
  name: t.name,
  jobType: t.jobType,
  description: t.description || "",
  isActive: t.isActive,
  steps: [...t.steps]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      ...s,
      _key: s._id,
      assignee: s.assignee?._id || s.assignee || null,
      dueOffsetDays: s.dueOffsetDays ?? "",
    })),
});

export const jobTypes = [
  "Bookkeeping",
  "Payroll",
  "Vat Return",
  "Personal Tax",
  "Accounts",
  "Company Sec",
  "Address",
];

// Props: users = [{ _id, name }], jobTypes = ["Bookkeeping", "Payroll", ...] (suggestions only)
export default function WorkflowTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [draft, setDraft] = useState(blankDraft());
  const [saving, setSaving] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showReassign, setShowReassign] = useState(false);

  const [users, setUsers] = useState([]);

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users?module=job`,
      );

      setUsers(
        data?.users?.filter((user) =>
          user?.role?.access?.some((item) =>
            item?.permission?.includes("Jobs"),
          ),
        ) || [],
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const load = useCallback(async (selectId) => {
    try {
      const list = await workflowApi.listTemplates({ includeInactive: true });
      setTemplates(list);
      if (selectId) {
        const t = list.find((x) => x._id === selectId);
        if (t) setDraft(toDraft(t));
      }
    } catch (e) {
      toast.error(errMsg(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (p) => setDraft((d) => ({ ...d, ...p }));
  const patchStep = (key, p) =>
    setDraft((d) => ({
      ...d,
      steps: d.steps.map((s) => (s._key === key ? { ...s, ...p } : s)),
    }));
  const addStep = () =>
    setDraft((d) => ({ ...d, steps: [...d.steps, blankStep()] }));
  const removeStep = (key) =>
    setDraft((d) => ({ ...d, steps: d.steps.filter((s) => s._key !== key) }));
  const moveStep = (i, dir) =>
    setDraft((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.steps.length) return d;
      const steps = [...d.steps];
      [steps[i], steps[j]] = [steps[j], steps[i]];
      return { ...d, steps };
    });

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        name: draft.name,
        jobType: draft.jobType,
        description: draft.description,
        isActive: draft.isActive,
        steps: draft.steps.map(({ _key, ...s }) => s), // new steps have no _id, so the server mints one
      };
      const saved = draft._id
        ? await workflowApi.updateTemplate(draft._id, body)
        : await workflowApi.createTemplate(body);
      toast.success("Template saved");
      await load(saved._id);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (
      !window.confirm(
        `Delete "${draft.name}"? Jobs already using it keep their steps.`,
      )
    )
      return;
    try {
      await workflowApi.deleteTemplate(draft._id);
      toast.success("Template deleted");
      setDraft(blankDraft());
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* list */}
      <aside className="w-full shrink-0 lg:w-72">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-base font-semibold text-stone-900">
            Workflow templates
          </h1>
          <button
            type="button"
            className={btnPrimary}
            onClick={() => setDraft(blankDraft())}
          >
            New template
          </button>
        </div>
        <ul className="space-y-1.5">
          {templates.map((t) => (
            <li key={t._id}>
              <button
                type="button"
                onClick={() => setDraft(toDraft(t))}
                className={`w-full rounded-md border px-3 py-2 text-left ${
                  draft._id === t._id
                    ? "border-orange-500 bg-orange-50"
                    : "border-stone-200 bg-white hover:bg-stone-50"
                }`}
              >
                <span className="block text-sm font-medium text-stone-900">
                  {t.name}
                </span>
                <span className="block text-xs text-stone-500">
                  {t.jobType} · {t.steps.length} steps{!t.isActive && " · off"}
                </span>
              </button>
            </li>
          ))}
          {!templates.length && (
            <li className="rounded-md border border-dashed border-stone-300 p-4 text-sm text-stone-500">
              No templates yet. Create one for a job type, then apply it to many
              jobs at once.
            </li>
          )}
        </ul>
        <button
          type="button"
          className={`${btnGhost} mt-3 w-full`}
          onClick={() => setShowReassign(true)}
        >
          Reassign a user's open steps
        </button>
      </aside>

      {/* editor */}
      <section className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-stone-700">
              Template name
            </span>
            <input
              className={inputCls}
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Bookkeeping – Monthly"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-stone-700">
              Job type
            </span>
            <input
              className={inputCls}
              list="wf-job-types"
              value={draft.jobType}
              onChange={(e) => patch({ jobType: e.target.value })}
              placeholder="Bookkeeping"
            />
            <datalist id="wf-job-types">
              {jobTypes.map((j) => (
                <option key={j} value={j} />
              ))}
            </datalist>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-stone-700">
              Description (optional)
            </span>
            <input
              className={inputCls}
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(e) => patch({ isActive: e.target.checked })}
              className="accent-orange-600"
            />
            Available to apply
          </label>
        </div>

        <h2 className="mb-2 mt-6 text-sm font-semibold text-stone-900">
          Steps
        </h2>
        <ol className="space-y-3">
          {draft.steps.map((s, i) => (
            <li key={s._key} className="rounded-md border border-stone-200 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                  {i + 1}
                </span>
                <input
                  className={inputCls}
                  aria-label={`Step ${i + 1} title`}
                  value={s.title}
                  onChange={(e) => patchStep(s._key, { title: e.target.value })}
                  placeholder="What needs to happen?"
                />
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => moveStep(i, -1)}
                  disabled={i === 0}
                  aria-label="Move step up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => moveStep(i, 1)}
                  disabled={i === draft.steps.length - 1}
                  aria-label="Move step down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={btnDanger}
                  onClick={() => removeStep(s._key)}
                  disabled={draft.steps.length === 1}
                  aria-label="Remove step"
                >
                  ✕
                </button>
              </div>

              <div className="mb-2 grid gap-2 sm:grid-cols-3">
                <label className="text-xs text-stone-600">
                  Done by
                  <select
                    className={`${inputCls} mt-1`}
                    value={s.assigneeMode}
                    onChange={(e) =>
                      patchStep(s._key, {
                        assigneeMode: e.target.value,
                        assignee: null,
                      })
                    }
                  >
                    {MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>
                {s.assigneeMode === "fixed" && (
                  <label className="text-xs text-stone-600">
                    User
                    <WorkflowUserSelect
                      className="mt-1"
                      users={users}
                      value={s.assignee}
                      onChange={(id) => patchStep(s._key, { assignee: id })}
                      placeholder="Choose user"
                    />
                  </label>
                )}
                <label className="text-xs text-stone-600">
                  Due (days after applied)
                  <input
                    type="number"
                    min="0"
                    className={`${inputCls} mt-1`}
                    value={s.dueOffsetDays}
                    onChange={(e) =>
                      patchStep(s._key, { dueOffsetDays: e.target.value })
                    }
                    placeholder="No due date"
                  />
                </label>
              </div>

              <RichTextEditor
                value={s.description}
                onChange={(html) => patchStep(s._key, { description: html })}
              />
            </li>
          ))}
        </ol>
        <button type="button" className={`${btnGhost} mt-3`} onClick={addStep}>
          Add step
        </button>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 pt-4">
          <div className="flex gap-2">
            {draft._id && (
              <>
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => setShowApply(true)}
                  disabled={!draft.isActive}
                >
                  Apply to jobs
                </button>
                <button type="button" className={btnDanger} onClick={remove}>
                  Delete template
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            className={btnPrimary}
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save template"}
          </button>
        </div>
      </section>

      {showApply && (
        <ApplyTemplateDialog
          initialTemplateId={draft._id}
          onClose={() => setShowApply(false)}
        />
      )}
      {showReassign && (
        <BulkReassignDialog
          users={users}
          onClose={() => setShowReassign(false)}
        />
      )}
    </div>
  );
}
