import { useState, useEffect, useCallback } from "react";
import { signaturesApi } from "./api/signaturesApi";
 
import { Icon }          from "./components/Icon";
import { Toaster }       from "./components/Toaster";
import { SignatureCard } from "./components/SignatureCard";
import { EditorModal }   from "./components/EditorModal";
import { DeleteConfirm } from "./components/DeleteConfirm";
import { useToast } from "./components/useToast";

export default function SignaturesModule() {
  const [signatures,   setSignatures]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [editTarget,   setEditTarget]   = useState(null); // null | "new" | sig
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving,       setSaving]       = useState(false);
  const { toasts, toast }               = useToast();

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await signaturesApi.list(q ? { search: q } : {});
      setSignatures(res.data || []);
    } catch {
      toast("Failed to load signatures", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editTarget === "new") {
        const res = await signaturesApi.create(data);
        if (res.error) throw new Error(res.error);
        toast("Signature created ✓");
      } else {
        const res = await signaturesApi.update(editTarget.id, data);
        if (res.error) throw new Error(res.error);
        toast("Signature updated ✓");
      }
      setEditTarget(null);
      load(search);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await signaturesApi.remove(deleteTarget.id);
      toast("Signature deleted");
      setDeleteTarget(null);
      load(search);
    } catch {
      toast("Delete failed", "error");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await signaturesApi.setDefault(id);
      toast("Default updated ✓");
      load(search);
    } catch {
      toast("Failed to set default", "error");
    }
  };

 

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-[#f8f7f5] text-[#1a1916] font-sans">

        {/* Top Bar */}
        <div className="border-b border-[#161616] px-7 flex items-center gap-4 h-[60px]">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <span className="font-bold text-[15px] text-[#1a1916] tracking-tight">Signatures</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-[340px] relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none">
              <Icon name="search" size={14} />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search signatures…"
              className="w-full   border border-[#e4e2dc] rounded-[10px] font-sans text-[12px] pl-8 pr-3 h-9 outline-none box-border transition-colors focus:border-orange-500"
            />
          </div>

          {/* New button */}
          <div className="ml-auto">
            <button
              onClick={() => setEditTarget("new")}
              className="bg-orange-600 hover:bg-orange-700 text-white border-none rounded-[9px] px-4 py-2 cursor-pointer font-mono text-[12px] flex items-center gap-1.5 transition-colors duration-150"
            >
              <Icon name="plus" size={14} />
              New Signature
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-7 max-w-[1100px] mx-auto">

           

          {/* Grid */}
          {loading ? (
            <div className="text-center py-16 text-[#333] font-mono text-[13px]">Loading…</div>
          ) : signatures.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-[#e4e2dc] text-5xl mb-4">✉</div>
              <div className="text-[#444] font-mono text-[13px]">
                {search ? "No signatures match your search" : "No signatures yet — create one to get started"}
              </div>
              {!search && (
                <button
                  onClick={() => setEditTarget("new")}
                  className="mt-5 bg-transparent border border-[#3a2070] text-orange-600 rounded-[9px] px-[18px] py-[9px] cursor-pointer font-mono text-[13px] transition-all"
                >
                  + Create first signature
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))" }}>
              {signatures.map(sig => (
                <div key={sig.id} className="animate-[fadeIn_0.2s_ease]">
                  <SignatureCard
                    sig={sig}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                    onSetDefault={handleSetDefault}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editTarget && (
        <EditorModal
          sig={editTarget === "new" ? null : editTarget}
          onSave={handleSave}
          onClose={() => setEditTarget(null)}
          saving={saving}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          sig={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      <Toaster toasts={toasts} />
    </>
  );
}
