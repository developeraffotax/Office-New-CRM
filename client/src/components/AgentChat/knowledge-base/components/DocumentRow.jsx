import { useState } from "react";
import { fmtSize } from "../utils.js";
import Button from "../../shared/ui/Button.jsx";
import { FileIcon, RefreshIcon, TableIcon, TrashIcon } from "../../shared/ui/Icons.jsx";
import StatusBadge from "./StatusBadge.jsx";

export default function DocumentRow({ d, onRetry, onDelete }) {
  const [retrying, setRetrying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const retry = async () => {
    setRetrying(true);
    try {
      await onRetry(d);
    } finally {
      setRetrying(false);
    }
  };
  const remove = async () => {
    setDeleting(true);
    try {
      await onDelete(d);
    } finally {
      setDeleting(false);
    }
  };

  const Icon = d.isDataset ? TableIcon : FileIcon;
  return (
    <li className="flex items-start justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900" title={d.filename}>{d.filename}</p>
          <p className="text-xs text-gray-500">
            {d.isDataset && "Spreadsheet · "}
            {fmtSize(d.size)}
            {d.status === "ready" && (d.isDataset ? ` · ${d.rowCount.toLocaleString()} rows` : ` · ${d.chunkCount} passages`)}
          </p>
          {d.status === "failed" && d.error && <p className="mt-1 text-xs text-red-600">{d.error}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <StatusBadge status={d.status} />
        {d.status === "failed" && (
          <Button variant="ghost" size="sm" loading={retrying} icon={<RefreshIcon className="h-3.5 w-3.5" />} onClick={retry}>Retry</Button>
        )}
        <Button variant="danger" size="sm" loading={deleting} aria-label={`Delete ${d.filename}`} icon={<TrashIcon className="h-3.5 w-3.5" />} onClick={remove}>Delete</Button>
      </div>
    </li>
  );
}
