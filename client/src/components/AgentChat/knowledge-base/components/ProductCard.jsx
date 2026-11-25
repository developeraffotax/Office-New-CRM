import { BoxIcon, FileIcon, TrashIcon } from "../../shared/ui/Icons.jsx";

export default function ProductCard({ p, onOpen, onDelete }) {
  return (
    <li className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
      <button
        className="flex-1 rounded-lg text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
        onClick={() => onOpen(p._id)}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <BoxIcon className="h-5 w-5" />
          </span>
          <h3 className="truncate font-semibold text-gray-900">{p.name}</h3>
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{p.description || "No description yet."}</p>
      </button>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
        <span className="flex min-w-0 items-center gap-1.5">
          <FileIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {p.documentCount} file{p.documentCount === 1 ? "" : "s"}
            {p.allowedRoles?.length ? ` · ${p.allowedRoles.join(", ")}` : " · everyone"}
          </span>
        </span>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
          onClick={() => onDelete(p)}
        >
          <TrashIcon className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </li>
  );
}
