import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  MdAdd,
  MdDeleteOutline,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from "react-icons/md";
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

// small square icon button used for move up / down / remove
const iconBtn =
  "rounded-md p-1.5 text-stone-500 hover:bg-stone-200/70 hover:text-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

let seq = 0;
const blankStep = () => ({
  _key: `new-${Date.now()}-${seq++}`,
  title: "",
  description: "",
  assigneeMode: "fixed",
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
    <div className="w-full font-inter ">
      
      {/* one split pane: list on the left, editor on the right */}
      <div className="flex flex-col  border border-stone-200 bg-white h-full lg:flex-row">
        {/* list */}
        <aside className="flex w-full shrink-0 flex-col rounded-t-lg border-b border-stone-200 bg-stone-50 lg:w-72 lg:rounded-l-lg lg:rounded-tr-none lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-sm font-semibold text-stone-900">
              Workflow Templates
              <span className="ml-1.5 font-normal text-stone-500">
                {templates.length}
              </span>
            </h2>
            <button
              type="button"
              onClick={() => setDraft(blankDraft())}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-orange-600 hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <MdAdd className="h-4 w-4" aria-hidden="true" />
              New
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto border-t border-stone-200 py-1   list-none">
            {templates.map((t) => {
              const selected = draft._id === t._id;
              return (
                <li key={t._id} className="m-0">
                  <button
                    type="button"
                    onClick={() => setDraft(toDraft(t))}
                    aria-current={selected ? "true" : undefined}
                    className={`flex w-full flex-col gap-0.5 border-l-2 px-4 py-2.5 text-left transition-colors focus:outline-none focus-visible:bg-stone-100 ${
                      selected
                        ? "border-orange-500 bg-white"
                        : "border-transparent hover:bg-stone-100"
                    }`}
                  >
                    <span className="truncate text-sm font-medium text-stone-900">
                      {t.name}
                    </span>
                    <span className="text-xs text-stone-500">
                      {t.jobType} · {t.steps.length}{" "}
                      {t.steps.length === 1 ? "step" : "steps"}
                      {!t.isActive && (
                        <span className="font-medium text-amber-600">
                          {" "}
                          · off
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
            {!templates.length && (
              <li className="px-4 py-6 text-sm text-stone-500">
                No templates yet. Create one for a job type, then apply it to
                many jobs at once.
              </li>
            )}
          </ul>

          <div className="border-t border-stone-200 px-4 py-3">
            <button
              type="button"
              onClick={() => setShowReassign(true)}
              className="text-sm font-medium text-stone-600 hover:text-orange-600 focus:outline-none focus-visible:underline"
            >
              Reassign a user's open steps
            </button>
          </div>
        </aside>

        {/* editor */}
        <section className="min-w-0 flex-1 rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none">
          {/* toolbar */}
          <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white/95 px-6 py-3 backdrop-blur lg:rounded-tr-lg">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-stone-900">
                {draft._id ? "Edit template" : "New template"}
              </h2>
              <p className="text-xs text-stone-500">
                {draft._id
                  ? "Edits apply to jobs you add this template to from now on."
                  : "Name it, pick the job type, then add the steps."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {draft._id && (
                <>
                  <button type="button" className={btnDanger} onClick={remove}>
                    Delete
                  </button>
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => setShowApply(true)}
                    disabled={!draft.isActive}
                  >
                    Apply to jobs
                  </button>
                </>
              )}
              <button
                type="button"
                className={btnPrimary}
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save template"}
              </button>
            </div>
          </div>

          {/* details */}
          <div className="border-b border-stone-200 px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-stone-600">
                  Template name
                </span>
                <input
                  className={inputCls}
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="Bookkeeping – Monthly"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-stone-600">
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
              {/* <label className="text-sm sm:col-span-2">
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
          </label> */}
            </div>
          </div>

          {/* steps */}
          <div className="px-6 py-6">
            <h3 className="mb-5 text-sm font-semibold text-stone-900">
              Steps
              <span className="ml-1.5 font-normal text-stone-500">
                {draft.steps.length}
              </span>
            </h3>

            <ul className="list-none">
              {draft.steps.map((s, i) => (
                <li
                  key={s._key}
                  className="relative m-0 pb-5 pl-11 before:absolute before:bottom-0 before:left-[15px] before:top-9 before:w-px before:bg-stone-200 last:pb-0 last:before:hidden"
                >
                  <span className="absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-orange-300 bg-white text-sm font-semibold text-orange-700">
                    {i + 1}
                  </span>

                  <div className="rounded-lg border border-stone-200 bg-white">
                    {/* step header: title, user, actions */}
                    <div className="flex flex-wrap items-center gap-2 rounded-t-lg border-b border-stone-200 bg-stone-50 px-3 py-2.5">
                      <input
                        className={`${inputCls} min-w-[12rem] flex-1`}
                        aria-label={`Step ${i + 1} title`}
                        value={s.title}
                        onChange={(e) =>
                          patchStep(s._key, { title: e.target.value })
                        }
                        placeholder="Which department will handle it?"
                      />
                      {s.assigneeMode === "fixed" && (
                        <WorkflowUserSelect
                          className="sm:!w-52"
                          users={users}
                          value={s.assignee}
                          onChange={(id) => patchStep(s._key, { assignee: id })}
                          placeholder="Choose user"
                          ariaLabel={`Step ${i + 1} user`}
                        />
                      )}
                      <div className="flex items-center">
                        <button
                          type="button"
                          className={iconBtn}
                          onClick={() => moveStep(i, -1)}
                          disabled={i === 0}
                          aria-label="Move step up"
                          title="Move up"
                        >
                          <MdKeyboardArrowUp className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          className={iconBtn}
                          onClick={() => moveStep(i, 1)}
                          disabled={i === draft.steps.length - 1}
                          aria-label="Move step down"
                          title="Move down"
                        >
                          <MdKeyboardArrowDown className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          className={`${iconBtn} hover:!bg-red-50 hover:!text-red-600`}
                          onClick={() => removeStep(s._key)}
                          disabled={draft.steps.length === 1}
                          aria-label="Remove step"
                          title="Remove step"
                        >
                          <MdDeleteOutline className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-0">
                      {/* `empty:hidden` collapses this row while everything inside is commented out */}
                      <div className="mb-3 grid gap-3 empty:hidden sm:grid-cols-3">
                        {/* <label className="text-xs text-stone-600">
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
                </label> */}
                        {/* Moved up, next to the step title:
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
                )} */}
                        {/* <label className="text-xs text-stone-600">
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
                </label> */}
                      </div>

                      {/* <p className="mb-1.5 text-xs font-medium text-stone-600">
                        Instructions
                      </p> */}
                      <RichTextEditor
                        value={s.description}
                        onChange={(html) =>
                          patchStep(s._key, { description: html })
                        }
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={`${btnGhost} ml-11 mt-5 inline-flex items-center gap-1.5`}
              onClick={addStep}
            >
              <MdAdd className="h-4 w-4" aria-hidden="true" />
              Add step
            </button>
          </div>
        </section>
      </div>

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