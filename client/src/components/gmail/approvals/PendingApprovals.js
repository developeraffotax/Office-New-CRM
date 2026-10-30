// mail/approvals/PendingApprovals.js
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FiCheck, FiEdit3, FiExternalLink, FiRefreshCw, FiX } from "react-icons/fi";
import CustomEditorVeryNew from "../../../utlis/CustomEditorVeryNew";  
import { notifyApprovalsChanged } from "./PendingApprovalsButton";

const API = `${process.env.REACT_APP_API_URL}/api/v1/gmail/auto-emails`;

const isEmpty = (html = "") =>
  !html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

// Sandboxed iframe: shows the email the way a client would, and can never run scripts
function EmailPreview({ html }) {
  const doc = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;padding:16px 20px;font:14px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#111827}
    p{margin:0 0 .75em}a{color:#2563eb}ul,ol{padding-left:1.25em}
  </style></head><body>${html}</body></html>`;

  return (
    <iframe
      title="Email preview"
      sandbox=""
      srcDoc={doc}
      className="h-60 w-full rounded-xl border border-gray-200 bg-white"
    />
  );
}

export default function PendingApprovals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [edits, setEdits] = useState({});
  const [editingId, setEditingId] = useState(null);

  const bodyOf = (item) => edits[item._id] ?? item.draftBody;

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/pending`);
      setItems(data.items || []);
            notifyApprovalsChanged();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (item, action) => {
    setBusyId(item._id);
    try {
      await axios.post(
        `${API}/${item._id}/${action}`,
        action === "approve" ? { body: bodyOf(item) } : {},
      );
      toast.success(action === "approve" ? "Sent" : "Rejected");
      setItems((prev) => prev.filter((i) => i._id !== item._id));
      setEditingId((cur) => (cur === item._id ? null : cur));
            notifyApprovalsChanged();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
      if (e.response?.status === 409) load(); // someone else handled it, or the thread changed
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="p-6 text-sm text-gray-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">
          Pending approvals <span className="text-gray-400">({items.length})</span>
        </h1>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-orange-300 hover:text-orange-600"
        >
          <FiRefreshCw className="size-3.5" /> Refresh
        </button>
      </div>

      {!items.length && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          Nothing waiting for approval.
        </div>
      )}

      {items.map((item) => {
        const editing = editingId === item._id;
        const busy = busyId === item._id;
        const empty = isEmpty(bodyOf(item));

        return (
          <div
            key={item._id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      item.kind === "reply"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    {item.kind === "reply" ? "Auto-reply" : `Follow-up #${item.followUpNumber}`}
                  </span>
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {item.subject || "(no subject)"}
                  </p>
                </div>
                <p className="mt-1 truncate text-xs text-gray-500">To: {item.to}</p>
              </div>

              {/* adjust to your thread route */}
              <Link
                to={`/mail/${item.threadId}?companyName=${encodeURIComponent(item.companyName || "affotax")}`}
                className="inline-flex shrink-0 items-center gap-1 text-xs text-orange-600 hover:underline"
              >
                Open thread <FiExternalLink className="size-3" />
              </Link>
            </div>

            {editing ? (
              <CustomEditorVeryNew
                template={bodyOf(item)}
                setTemplate={(html) => setEdits((p) => ({ ...p, [item._id]: html }))}
                minHeight={220}
                softLimit={5000}
                placeholder="Edit the email..."
              />
            ) : (
              <EmailPreview html={bodyOf(item)} />
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => decide(item, "approve")}
                disabled={busy || empty}
                title={empty ? "The email body is empty" : ""}
                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                <FiCheck className="size-4" /> Approve & send
              </button>

              <button
                onClick={() => setEditingId(editing ? null : item._id)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <FiEdit3 className="size-4" /> {editing ? "Done" : "Edit"}
              </button>

              <button
                onClick={() => decide(item, "reject")}
                disabled={busy}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <FiX className="size-4" /> Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}