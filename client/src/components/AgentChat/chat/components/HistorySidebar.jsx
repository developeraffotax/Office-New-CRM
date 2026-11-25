import Button from "../../shared/ui/Button.jsx";
import Skeleton from "../../shared/ui/Skeleton.jsx";
import { ChatIcon, PlusIcon, TrashIcon, XIcon } from "../../shared/ui/Icons.jsx";
import { groupConversations } from "../utils/groupConversations.js";

// Saved chats. A fixed column on desktop, a slide-over drawer on small screens.
export default function HistorySidebar({ conversations, activeId, loading, busy, open, onClose, onNew, onOpen, onDelete }) {
  const groups = groupConversations(conversations);

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-gray-900/30 md:hidden" onMouseDown={onClose} aria-hidden="true" />}
      <aside
        aria-label="Chat history"
        className={`${open ? "fixed inset-y-0 left-0 z-30 flex shadow-2xl" : "hidden"} w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-3 md:static md:z-auto md:flex md:shadow-none`}
      >
        <div className="flex items-center gap-2">
          <Button onClick={onNew} disabled={busy} icon={<PlusIcon />} className="flex-1">New chat</Button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat history"
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 md:hidden"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-1.5" role="status" aria-label="Loading chats">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-9 w-full" />)}
            </div>
          ) : conversations.length === 0 ? (
            <p className="px-1 text-sm text-gray-500">No chats yet. Your conversations are saved here.</p>
          ) : (
            groups.map((g) => (
              <section key={g.label} className="mb-4">
                <h2 className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{g.label}</h2>
                <ul className="list-none space-y-0.5 p-0">
                  {g.items.map((c) => {
                    const active = c.id === activeId;
                    return (
                      <li key={c.id} className="group relative m-0">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onOpen(c.id)}
                          aria-current={active ? "true" : undefined}
                          title={c.title}
                          className={`flex w-full items-center gap-2.5 rounded-xl py-2 pl-3 pr-9 text-left text-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60 ${
                            active ? "bg-orange-50 font-medium text-orange-700" : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <ChatIcon className={`h-4 w-4 shrink-0 ${active ? "text-orange-500" : "text-gray-400"}`} />
                          <span className="truncate">{c.title}</span>
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          aria-label={`Delete ${c.title}`}
                          onClick={() => onDelete(c)}
                          className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 focus:opacity-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:hidden group-hover:opacity-100 ${
                            active ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      </aside>
    </>
  );
}