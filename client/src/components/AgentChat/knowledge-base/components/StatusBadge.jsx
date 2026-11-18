import { STATUS } from "../constants.js";
import Spinner from "../../shared/ui/Spinner.jsx";
import { AlertIcon, CheckIcon } from "../../shared/ui/Icons.jsx";

export default function StatusBadge({ status }) {
  const [label, cls] = STATUS[status] || STATUS.queued;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {status === "processing" && <Spinner className="h-3 w-3" />}
      {status === "ready" && <CheckIcon className="h-3 w-3" />}
      {status === "failed" && <AlertIcon className="h-3 w-3" />}
      {(status === "queued" || !STATUS[status]) && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-400" />}
      {label}
    </span>
  );
}
