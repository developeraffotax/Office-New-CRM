import Avatar from "../../shared/ui/Avatar.jsx";
import { ArrowRightIcon } from "../../shared/ui/Icons.jsx";

export default function EmptyState({ suggestions, onPick }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center pt-12 text-center sm:pt-20">
      <Avatar size="h-14 w-14" iconSize="h-7 w-7" />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gray-900">Ask me anything</h1>
      <p className="mt-2 text-sm leading-6 text-gray-500">
        I can answer from your company's documents and spreadsheets. Attach a PDF, Word, Excel, CSV or image and I'll read it, fill it in from your stored data, or work on it.
      </p>
      <div className="mt-8 grid w-full gap-2.5 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="group flex items-start justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left text-sm text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
          >
            <span>{s}</span>
            <ArrowRightIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
          </button>
        ))}
      </div>
    </div>
  );
}
