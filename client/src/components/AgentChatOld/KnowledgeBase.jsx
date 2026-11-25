// src/pages/KnowledgeBase.jsx
// Admin page: Project > Product > description + documents. Everything here feeds the AI assistant.
// Stack: React, Tailwind, react-hot-toast. Auth: see aiApi.js (getToken).
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { kbHttp, errMsg } from "./aiApi.js";

const api = kbHttp;

// Role names come from your Role collection (cached after the first fetch).
let rolesPromise;
function useRoles() {
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    rolesPromise ??= api.get("/roles").then((r) => r.data);
    rolesPromise.then(setRoles).catch(() => { rolesPromise = undefined; });
  }, []);
  return roles;
}
const ACCEPT = ".pdf,.docx,.txt,.md,.csv,.xlsx";
const fmtSize = (b = 0) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

const STATUS = {
  queued: ["Queued", "bg-gray-100 text-gray-600"],
  processing: ["Processing", "bg-blue-50 text-blue-700"],
  ready: ["Ready", "bg-green-50 text-green-700"],
  failed: ["Failed", "bg-red-50 text-red-700"],
};

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200";
const primaryBtn =
  "rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-50";
const ghostBtn =
  "rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-200";

function RoleChips({ value, onChange }) {
  const roles = useRoles();
  const toggle = (r) => onChange(value.includes(r) ? value.filter((x) => x !== r) : [...value, r]);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {roles.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => toggle(r)}
            aria-pressed={value.includes(r)}
            className={`rounded-full border px-3 py-1 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-orange-200 ${
              value.includes(r)
                ? "border-orange-500 bg-orange-50 text-orange-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-gray-500">
        {value.length ? "Only these roles can get answers from this product." : "No roles selected: everyone can get answers from this product."}
      </p>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function FormModal({ kind, initial, onSubmit, onClose }) {
  const isProduct = kind === "product";
  const [form, setForm] = useState({ name: "", description: "", allowedRoles: [], ...initial });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  const title = initial?._id ? `Edit ${kind}` : `New ${kind}`;
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Name
          <input
            autoFocus
            required
            className={`${inputCls} mt-1`}
            value={form.name}
            onChange={set("name")}
            placeholder={isProduct ? "Payroll" : "Accounting"}
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Description {!isProduct && <span className="font-normal text-gray-400">(optional)</span>}
          <textarea
            rows={isProduct ? 6 : 3}
            className={`${inputCls} mt-1`}
            value={form.description}
            onChange={set("description")}
            placeholder={
              isProduct
                ? "What this product is, how it works, rules and common questions. The assistant reads this text."
                : "What this project covers"
            }
          />
        </label>
        {isProduct && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700">Who can ask about this</p>
            <RoleChips value={form.allowedRoles} onChange={(allowedRoles) => setForm((f) => ({ ...f, allowedRoles }))} />
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={ghostBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={primaryBtn} disabled={saving || !form.name.trim()}>
            {saving ? "Saving…" : initial?._id ? "Save changes" : isProduct ? "Create product" : "Create project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ProductPanel({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", allowedRoles: [] });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const load = useCallback(
    async (resetForm) => {
      try {
        const { data } = await api.get(`/products/${productId}`);
        setDocs(data.documents);
        if (resetForm) {
          setProduct(data.product);
          setForm({
            name: data.product.name,
            description: data.product.description || "",
            allowedRoles: data.product.allowedRoles || [],
          });
        }
      } catch (e) {
        toast.error(errMsg(e));
      }
    },
    [productId]
  );

  useEffect(() => {
    setProduct(null);
    load(true);
  }, [load]);

  // Poll while any file is still being indexed.
  const busy = docs.some((d) => d.status === "queued" || d.status === "processing");
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => load(false), 3000);
    return () => clearInterval(t);
  }, [busy, load]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dirty =
    product &&
    (form.name !== product.name ||
      form.description !== (product.description || "") ||
      JSON.stringify([...form.allowedRoles].sort()) !== JSON.stringify([...(product.allowedRoles || [])].sort()));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/products/${productId}`, form);
      setProduct(data);
      toast.success("Product saved");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const upload = async (fileList) => {
    const files = [...fileList];
    if (!files.length) return;
    const body = new FormData();
    files.forEach((f) => body.append("files", f));
    setUploading(true);
    try {
      await api.post(`/products/${productId}/documents`, body);
      toast.success(`${files.length} file${files.length > 1 ? "s" : ""} uploaded`);
      await load(false);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeDoc = async (d) => {
    if (!window.confirm(`Delete "${d.filename}"? The assistant will stop using it.`)) return;
    try {
      await api.delete(`/documents/${d._id}`);
      setDocs((x) => x.filter((y) => y._id !== d._id));
      toast.success("Document deleted");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const retryDoc = async (d) => {
    try {
      await api.post(`/documents/${d._id}/retry`);
      await load(false);
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onMouseDown={onClose}>
      <aside
        role="dialog"
        aria-label="Product details"
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{product?.name || "Loading…"}</h2>
          <button className={ghostBtn} onClick={onClose}>
            Close
          </button>
        </header>

        {product && (
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <section className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Name
                <input className={`${inputCls} mt-1`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Description
                <textarea
                  rows={7}
                  className={`${inputCls} mt-1`}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Explain this product in plain language. The assistant reads this text."
                />
                <span className="mt-1 block text-xs font-normal text-gray-500">Changes are re-indexed within a few seconds of saving.</span>
              </label>
              <div>
                <p className="mb-1.5 text-sm font-medium text-gray-700">Who can ask about this</p>
                <RoleChips value={form.allowedRoles} onChange={(allowedRoles) => setForm({ ...form, allowedRoles })} />
              </div>
              <div className="flex justify-end">
                <button className={primaryBtn} onClick={save} disabled={!dirty || saving || !form.name.trim()}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Documents</h3>
              <div
                onDragOver={(e) => (e.preventDefault(), setDragging(true))}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => (e.preventDefault(), setDragging(false), upload(e.dataTransfer.files))}
                className={`rounded-xl border-2 border-dashed p-6 text-center text-sm ${
                  dragging ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-gray-50"
                }`}
              >
                <p className="text-gray-600">Drop files here, or</p>
                <button type="button" className="mt-2 font-medium text-orange-600 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-200" onClick={() => inputRef.current?.click()} disabled={uploading}>
                  {uploading ? "Uploading…" : "choose files"}
                </button>
                <p className="mt-2 text-xs text-gray-500">PDF, DOCX, TXT, MD, XLSX or CSV, up to 25 MB each</p>
                <p className="mt-1 text-xs text-gray-500">Spreadsheets become data the assistant can look up, filter and total.</p>
                <input ref={inputRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => upload(e.target.files)} />
              </div>

              {docs.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">No documents yet. Upload policies, guides, SOPs or spreadsheets for this product.</p>
              ) : (
                <ul className="mt-3 divide-y rounded-xl border">
                  {docs.map((d) => {
                    const [label, cls] = STATUS[d.status] || STATUS.queued;
                    return (
                      <li key={d._id} className="flex items-start justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900" title={d.filename}>{d.filename}</p>
                          <p className="text-xs text-gray-500">
                            {d.isDataset && "Spreadsheet · "}
                            {fmtSize(d.size)}
                            {d.status === "ready" && (d.isDataset ? ` · ${d.rowCount.toLocaleString()} rows` : ` · ${d.chunkCount} passages`)}
                          </p>
                          {d.status === "failed" && d.error && <p className="mt-1 text-xs text-red-600">{d.error}</p>}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
                          {d.status === "failed" && (
                            <button className="text-xs font-medium text-orange-600 hover:underline" onClick={() => retryDoc(d)}>Retry</button>
                          )}
                          <button className="text-xs text-gray-500 hover:text-red-600" onClick={() => removeDoc(d)}>Delete</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}

export default function KnowledgeBase() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(null);
  const [modal, setModal] = useState(null); // { kind: "project" | "product", item? }
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async (selectId) => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
      setProjectId((cur) => selectId ?? (data.some((p) => p._id === cur) ? cur : data[0]?._id ?? null));
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    if (!projectId) return setProducts([]);
    try {
      const { data } = await api.get(`/projects/${projectId}/products`);
      setProducts(data);
    } catch (e) {
      toast.error(errMsg(e));
    }
  }, [projectId]);

  useEffect(() => { loadProjects(); }, [loadProjects]);
  useEffect(() => { setProductId(null); loadProducts(); }, [loadProducts]);

  const project = projects.find((p) => p._id === projectId);

  const submitProject = async (form) => {
    try {
      if (modal.item) {
        await api.patch(`/projects/${modal.item._id}`, { name: form.name, description: form.description });
        await loadProjects();
        toast.success("Project updated");
      } else {
        const { data } = await api.post("/projects", { name: form.name, description: form.description });
        await loadProjects(data._id);
        toast.success("Project created");
      }
      setModal(null);
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const submitProduct = async (form) => {
    try {
      const { data } = await api.post(`/projects/${projectId}/products`, form);
      setModal(null);
      await Promise.all([loadProducts(), loadProjects(projectId)]);
      setProductId(data._id); // open it straight away so files can be added
      toast.success("Product created");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const deleteProject = async (p) => {
    if (!window.confirm(`Delete "${p.name}" with all its products and documents? This cannot be undone.`)) return;
    try {
      await api.delete(`/projects/${p._id}`);
      await loadProjects();
      toast.success("Project deleted");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const deleteProduct = async (p) => {
    if (!window.confirm(`Delete "${p.name}" and its documents? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      await Promise.all([loadProducts(), loadProjects(projectId)]);
      toast.success("Product deleted");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div className="flex min-h-[600px] bg-gray-50">
      <aside className="w-64 shrink-0 border-r bg-white p-3">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-gray-900">Projects</h2>
          <button className="text-sm font-medium text-orange-600 hover:underline" onClick={() => setModal({ kind: "project" })}>
            New project
          </button>
        </div>
        {loading ? (
          <p className="px-1 text-sm text-gray-500">Loading…</p>
        ) : projects.length === 0 ? (
          <p className="px-1 text-sm text-gray-500">No projects yet. Create one, like Accounting.</p>
        ) : (
          <ul className="space-y-1">
            {projects.map((p) => (
              <li key={p._id}>
                <button
                  onClick={() => setProjectId(p._id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 ${
                    p._id === projectId ? "bg-orange-50 font-medium text-orange-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  <span className="ml-2 text-xs text-gray-400">{p.productCount}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {!project ? (
          <div className="mx-auto mt-16 max-w-md text-center">
            <h1 className="text-xl font-semibold text-gray-900">Teach the assistant about your work</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create a project like Accounting, add products such as Payroll, then attach a description and documents. Employees can ask the assistant about anything you add here.
            </p>
            <button className={`${primaryBtn} mt-5`} onClick={() => setModal({ kind: "project" })}>
              Create your first project
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
                {project.description && <p className="mt-1 text-sm text-gray-600">{project.description}</p>}
                <div className="mt-2 flex gap-3 text-xs">
                  <button className="text-gray-500 hover:text-gray-800" onClick={() => setModal({ kind: "project", item: project })}>Rename or edit</button>
                  <button className="text-gray-500 hover:text-red-600" onClick={() => deleteProject(project)}>Delete project</button>
                </div>
              </div>
              <button className={primaryBtn} onClick={() => setModal({ kind: "product" })}>New product</button>
            </div>

            {products.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-600">
                No products in {project.name} yet. Add one, like Payroll, then attach its description and documents.
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <li key={p._id} className="flex flex-col rounded-xl border bg-white p-4">
                    <button
                      className="flex-1 text-left focus:outline-none focus:ring-2 focus:ring-orange-200 rounded"
                      onClick={() => setProductId(p._id)}
                    >
                      <h3 className="font-medium text-gray-900">{p.name}</h3>
                      <p className="mt-1 line-clamp-3 text-sm text-gray-600">{p.description || "No description yet."}</p>
                    </button>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {p.documentCount} file{p.documentCount === 1 ? "" : "s"}
                        {p.allowedRoles?.length ? ` · ${p.allowedRoles.join(", ")}` : " · everyone"}
                      </span>
                      <button className="hover:text-red-600" onClick={() => deleteProduct(p)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      {modal?.kind === "project" && (
        <FormModal kind="project" initial={modal.item} onSubmit={submitProject} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "product" && (
        <FormModal kind="product" onSubmit={submitProduct} onClose={() => setModal(null)} />
      )}
      {productId && (
        <ProductPanel
          productId={productId}
          onClose={() => {
            setProductId(null);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}
