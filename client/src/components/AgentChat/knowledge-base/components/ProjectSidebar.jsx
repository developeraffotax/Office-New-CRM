import Skeleton from "../../shared/ui/Skeleton.jsx";
import { FolderIcon, PlusIcon } from "../../shared/ui/Icons.jsx";

export default function ProjectSidebar({ projects, projectId, loading, onSelect, onNew }) {
  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Projects</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-orange-600 transition hover:bg-orange-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
          onClick={onNew}
        >
          <PlusIcon className="h-3.5 w-3.5" /> New project
        </button>
      </div>
      {loading ? (
        <div className="space-y-1.5" role="status" aria-label="Loading projects">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-9 w-full" />)}
        </div>
      ) : projects.length === 0 ? (
        <p className="px-1 text-sm text-gray-500">No projects yet. Create one, like Accounting.</p>
      ) : (
        <ul className="space-y-1 list-none">
          {projects.map((p) => {
            const active = p._id === projectId;
            return (
              <li key={p._id} className="m-0">
                <button
                  onClick={() => onSelect(p._id)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 ${
                    active ? "bg-orange-50 font-medium text-orange-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FolderIcon className={`h-4 w-4 shrink-0 ${active ? "text-orange-500" : "text-gray-400"}`} />
                  <span className="truncate">{p.name}</span>
                  <span className={`ml-auto rounded-full px-1.5 text-xs ${active ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>{p.productCount}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
