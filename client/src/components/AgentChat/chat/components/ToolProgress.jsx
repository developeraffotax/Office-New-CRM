import { toolLabel } from "../constants.js";
import Spinner from "../../shared/ui/Spinner.jsx";

// One pill per tool that is currently running.
export default function ToolProgress({ tools }) {
  if (!tools.length) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-2" role="status" aria-live="polite">
      {tools.map((t) => (
        <span key={t.id} className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 py-1 pl-2.5 pr-3 text-xs font-medium text-orange-800">
          <Spinner className="h-3.5 w-3.5 text-orange-500" />
          <span className="animate-pulse">{toolLabel(t.name)}…</span>
        </span>
      ))}
    </div>
  );
}
