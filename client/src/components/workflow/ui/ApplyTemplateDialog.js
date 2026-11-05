import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { workflowApi, errMsg } from "../workflowApi";
import { Modal, inputCls, btnPrimary, btnGhost } from "./ui";
import { departments } from "../constants";

// Use from the templates page (pick a template + filter) or from AllJobs with row selection:
//   <ApplyTemplateDialog selectedJobIds={selectedIds} onClose={...} onApplied={refetchJobs} />
export default function ApplyTemplateDialog({ initialTemplateId = "", selectedJobIds = [], onClose, onApplied }) {
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [useSelected, setUseSelected] = useState(selectedJobIds.length > 0);
  const [jobName, setJobName] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [jobHolder, setJobHolder] = useState("");
  const [ifExists, setIfExists] = useState("skip");
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    workflowApi.listTemplates().then(setTemplates).catch((e) => toast.error(errMsg(e)));
  }, []);

  // default the job type filter to the template's job type
  useEffect(() => {
    const t = templates.find((x) => x._id === templateId);
    if (t) setJobName(t.jobType);
  }, [templateId, templates]);

  // any change invalidates the preview
  useEffect(() => setPreview(null), [templateId, useSelected, jobName, jobStatus, jobHolder, ifExists]);

  const payload = (dryRun) => ({
    templateId,
    ifExists,
    dryRun,
    ...(useSelected
      ? { jobIds: selectedJobIds }
      : { filter: Object.fromEntries(Object.entries({ jobName, jobStatus, jobHolder }).filter(([, v]) => v.trim())) }),
  });

  const runPreview = async () => {
    setBusy(true);
    try {
      setPreview(await workflowApi.apply(payload(true)));
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    setBusy(true);
    try {
      const res = await workflowApi.apply(payload(false));
      toast.success(`Workflow applied to ${res.applied} job${res.applied === 1 ? "" : "s"}`);
      if (res.unresolvedSteps) {
        toast(`${res.unresolvedSteps} step(s) have no user because the job has no matching job holder / lead user.`, { icon: "⚠️" });
      }
      onApplied?.(res);
      onClose();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const toChange = preview ? preview.willCreate + preview.willReplace : 0;

  return (
    <Modal
      title="Apply workflow to jobs"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="button" className={btnGhost} onClick={runPreview} disabled={busy || !templateId}>
            Preview
          </button>
          <button type="button" className={btnPrimary} onClick={apply} disabled={busy || !preview || toChange === 0}>
            {preview ? `Apply to ${toChange} job${toChange === 1 ? "" : "s"}` : "Apply"}
          </button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <label className="block">
          <span className="mb-1 block font-medium text-stone-700">Template</span>
          <select className={inputCls} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            <option value="">Choose a template</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id}>{t.name} ({t.jobType})</option>
            ))}
          </select>
        </label>

        {selectedJobIds.length > 0 && (
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" className="accent-orange-600" checked={useSelected} onChange={() => setUseSelected(true)} />
              {selectedJobIds.length} selected job{selectedJobIds.length === 1 ? "" : "s"}
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" className="accent-orange-600" checked={!useSelected} onChange={() => setUseSelected(false)} />
              All jobs matching a filter
            </label>
          </div>
        )}

        {!useSelected && (
          <div className="grid gap-3 sm:grid-cols-3">
            {/* <label>
              <span className="mb-1 block text-xs font-medium text-stone-600">Job type</span>
              <input className={inputCls} value={jobName} onChange={(e) => setJobName(e.target.value)} />
            </label> */}

            <label className="block">
                            <span className="mb-1 block text-xs font-medium text-stone-600">
                              Department
                            </span>
                             
                            <select
                              className={inputCls}
                              value={jobName}
                              onChange={(e) => setJobName(e.target.value)}
                            >
                              <option value="">Select a department</option>
                              {departments.map((j) => (
                                <option key={j} value={j}>
                                  {j}
                                </option>
                              ))}
                            </select>
                          </label>


            {/* <label>
              <span className="mb-1 block text-xs font-medium text-stone-600">Job status (optional)</span>
              <input className={inputCls} value={jobStatus} onChange={(e) => setJobStatus(e.target.value)} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-stone-600">Job holder (optional)</span>
              <input className={inputCls} value={jobHolder} onChange={(e) => setJobHolder(e.target.value)} />
            </label> */}
          </div>
        )}

        <fieldset>
          <legend className="mb-1 font-medium text-stone-700">If a job already has a workflow</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" className="accent-orange-600" checked={ifExists === "skip"} onChange={() => setIfExists("skip")} />
              Leave it as it is
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" className="accent-orange-600" checked={ifExists === "replace"} onChange={() => setIfExists("replace")} />
              Replace it
            </label>
          </div>
        </fieldset>

        {preview && (
          <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
            <p className="font-medium text-stone-900">
              {preview.matched} job{preview.matched === 1 ? "" : "s"} found: {preview.willCreate} new
              {preview.willReplace > 0 && `, ${preview.willReplace} replaced`}
              {preview.willSkip > 0 && `, ${preview.willSkip} skipped`}
            </p>
            {preview.sample?.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-stone-600">
                {preview.sample.map((s) => (
                  <li key={s._id}>
                    {s.clientName || s.companyName}
                    {s.jobName ? ` · ${s.jobName}` : ""}
                  </li>
                ))}
                {preview.matched > preview.sample.length && <li>…and {preview.matched - preview.sample.length} more</li>}
              </ul>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}