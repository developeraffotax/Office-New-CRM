import { BookIcon, ChevronIcon } from "../../shared/ui/Icons.jsx";

export default function SourceList({ sources }) {
  return (
    <details className="group mt-3 rounded-xl border border-gray-200 bg-white/70 text-xs text-gray-600">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 font-medium text-gray-600 hover:text-gray-900 [&::-webkit-details-marker]:hidden">
        <BookIcon className="h-3.5 w-3.5 text-orange-500" />
        Sources ({sources.length})
        <ChevronIcon className="ml-auto h-3.5 w-3.5 transition-transform group-open:rotate-90" />
      </summary>
      <ul className="space-y-1 border-t border-gray-100 px-3 py-2">
        {sources.map((s) => (
          <li key={s.n} className="flex gap-2">
            <span className="flex h-4 min-w-4 items-center justify-center rounded bg-orange-100 px-1 text-[10px] font-semibold text-orange-700">{s.n}</span>
            <span className="text-gray-600">
              {s.project} › {s.product} › {s.file}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
