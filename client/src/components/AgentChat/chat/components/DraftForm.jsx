import { useState } from "react";
import toast from "react-hot-toast";
import { http, errMsg } from "../../aiApi.js";
import { downloadBlob } from "../utils/download.js";
import FormField from "./FormField.jsx";
import Button from "../../shared/ui/Button.jsx";
import { AlertIcon, CheckIcon, DownloadIcon, FormIcon } from "../../shared/ui/Icons.jsx";

function DraftDone({ form, isFile, file, skipped, onDownloadAgain, onEdit }) {
  return (
    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
      <div className="flex items-center gap-2 font-medium">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
          <CheckIcon className="h-3.5 w-3.5" />
        </span>
        {isFile ? "Your filled form was downloaded." : `${form.title} submitted.`}
      </div>
      {isFile && (
        <>
          {skipped.length > 0 && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
              <p className="flex items-center gap-1.5 font-medium">
                <AlertIcon className="h-4 w-4" /> Left blank, please fill by hand:
              </p>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {skipped.map((s) => <li key={s.name}>{s.label}: {s.reason}</li>)}
              </ul>
            </div>
          )}
          <div className="mt-3 flex gap-4 text-xs">
            <button type="button" className="font-medium underline underline-offset-2 hover:text-emerald-700" onClick={onDownloadAgain}>Download again</button>
            <button type="button" className="font-medium underline underline-offset-2 hover:text-emerald-700" onClick={onEdit}>Edit and download again</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function DraftForm({ draft }) {
  const { form, sources = {}, errors: initialErrors = {} } = draft;
  const isFile = form.mode === "file"; // an uploaded PDF/Word form → download; a CRM form → submit
  const [values, setValues] = useState(draft.values || {});
  const [errors, setErrors] = useState(initialErrors);
  const [missing, setMissing] = useState(draft.missing || []);
  const [state, setState] = useState("idle"); // idle | saving | done
  const [file, setFile] = useState(null); // { blob, name } of the last filled file
  const [skipped, setSkipped] = useState([]);
  const set = (name, v) => setValues((x) => ({ ...x, [name]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setState("saving");
    try {
      if (isFile) {
        const res = await http.post(`/attachments/${form.id}/fill`, { values }, { responseType: "blob" });
        const header = res.headers["x-skipped"];
        setSkipped(header ? JSON.parse(decodeURIComponent(header)) : []);
        const name = `filled-${form.title}`;
        setFile({ blob: res.data, name });
        downloadBlob(res.data, name);
      } else {
        await http.post(`/forms/${form.id}/submit`, { values });
        toast.success(`${form.title} submitted`);
      }
      setErrors({});
      setMissing([]);
      setState("done");
    } catch (err) {
      setState("idle");
      let data = err.response?.data;
      if (data instanceof Blob) data = await data.text().then(JSON.parse).catch(() => ({})); // blob responses hide the JSON error
      setErrors(data?.errors || {});
      setMissing(data?.missing || []);
      toast.error(data?.message || errMsg(err));
    }
  };

  if (state === "done")
    return (
      <DraftDone
        form={form}
        isFile={isFile}
        file={file}
        skipped={skipped}
        onDownloadAgain={() => downloadBlob(file.blob, file.name)}
        onEdit={() => setState("idle")}
      />
    );

  const renderField = (f) => (
    <FormField
      key={f.name}
      field={f}
      formId={form.id}
      value={values[f.name]}
      onChange={set}
      error={errors[f.name] || (missing.includes(f.name) && "Required, not found in your data")}
      source={sources[f.name]}
    />
  );

  // Uploaded forms can have dozens of fields: show what was filled first, the rest tucked away.
  const filled = form.fields.filter((f) => values[f.name] !== undefined && values[f.name] !== "");
  const rest = form.fields.filter((f) => !filled.includes(f));
  const primary = isFile ? filled : form.fields;
  const pct = form.fields.length ? Math.round((filled.length / form.fields.length) * 100) : 0;
  const saving = state === "saving";

  return (
    <form onSubmit={submit} className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3.5" style={{ background: "linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)" }}>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <FormIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{form.title}</p>
            <p className="text-xs text-gray-500">
              Filled in by the assistant: {filled.length} of {form.fields.length} fields. Check every value before {isFile ? "downloading" : "submitting"}.
            </p>
          </div>
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-orange-700">Draft</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2">{primary.map(renderField)}</div>

        {isFile && rest.length > 0 && (
          <details className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
            <summary className="cursor-pointer text-xs font-medium text-gray-600">Fields not filled ({rest.length}). Add any yourself.</summary>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">{rest.map(renderField)}</div>
          </details>
        )}

        <div className="flex justify-end">
          <Button type="submit" loading={saving} icon={isFile ? <DownloadIcon /> : <CheckIcon />}>
            {saving ? (isFile ? "Filling…" : "Submitting…") : isFile ? "Download filled form" : "Submit"}
          </Button>
        </div>
      </div>
    </form>
  );
}
