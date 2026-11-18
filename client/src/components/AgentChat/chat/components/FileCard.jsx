import { useState } from "react";
import toast from "react-hot-toast";
import { http, errMsg } from "../../aiApi.js";
import { downloadBlob } from "../utils/download.js";
import { formatCell } from "../utils/format.js";
import Button from "../../shared/ui/Button.jsx";
import { DownloadIcon, FileIcon } from "../../shared/ui/Icons.jsx";

export default function FileCard({ file }) {
  const [busy, setBusy] = useState(false);
  const s = file.stats;

  const download = async () => {
    setBusy(true);
    try {
      const res = await http.get(`/attachments/${file.id}/download`, { responseType: "blob" });
      downloadBlob(res.data, file.filename);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <FileIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900" title={file.filename}>{file.filename}</p>
          {s && (
            <p className="text-xs text-gray-500">
              {s.matched.toLocaleString()} of {s.sheetRows.toLocaleString()} rows filled
              {s.unmatched > 0 && ` · ${s.unmatched.toLocaleString()} not found`}
              {s.ambiguous > 0 && ` · ${s.ambiguous.toLocaleString()} matched more than one record`}
              {s.noKey > 0 && ` · ${s.noKey.toLocaleString()} had no value to match on`}
            </p>
          )}
        </div>
        <Button onClick={download} loading={busy} icon={<DownloadIcon />}>{busy ? "Preparing…" : "Download"}</Button>
      </div>

      {file.changes?.length > 0 && (
        <details className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <summary className="cursor-pointer font-medium">What changed (first {file.changes.length})</summary>
          <ul className="mt-2 space-y-1">
            {file.changes.map((c, i) => (
              <li key={i}>
                <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-gray-200">{c.cell}</span>{" "}
                {formatCell(c.was)} → <span className="font-medium text-gray-900">{formatCell(c.now)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="mt-3 text-xs text-gray-400">This is a new copy. Your original file is unchanged.</p>
    </div>
  );
}
