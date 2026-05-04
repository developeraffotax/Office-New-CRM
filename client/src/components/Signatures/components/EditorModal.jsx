import { useState, useRef } from "react";
import { Icon } from "./Icon";

export function EditorModal({ sig, onSave, onClose, saving }) {
  const [name,      setName]      = useState(sig?.name || "");
  const [company, setCompany] = useState(sig?.company || "");
  const [html,      setHtml]      = useState(sig?.html || "");
  const [tagsInput, setTagsInput] = useState(sig?.tags?.join(", ") || "");
  const [isDefault, setIsDefault] = useState(sig?.is_default || false);
  const [tab,       setTab]       = useState("code");
  const textareaRef               = useRef();

  const handleSave = () => {
    // const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    onSave({ 
      name,
       html, 
       company,
      //  tags, 
       is_default: isDefault });
  };

  const disabled = saving || !name.trim() || !html.trim();

  return (
    <div className="fixed inset-0 bg-black/85 z-[1000] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-white border border-[#222] rounded-2xl w-full max-w-[820px] max-h-[90vh] flex flex-col overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.6)]">

        {/* Modal Header */}
        <div className="px-5 py-[18px] border-b border-[#f3f2ef] flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-orange-600" />
          <span className="font-sans font-bold text-[15px] text-[#1a1916] flex-1">
            {sig ? "Edit Signature" : "New Signature"}
          </span>
          <button onClick={onClose} className="bg-transparent border-none text-[#555] cursor-pointer p-1 flex">
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">

          {/* Name + Default toggle */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block font-mono text-[11px] text-[#555] mb-1.5 uppercase tracking-wide">
                Signature Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sales Team Footer"
                className="w-full bg-[#f8f7f5] border border-[#e4e2dc] rounded-[10px] text-[#1a1916] font-sans text-[13px] px-3.5 py-2.5 outline-none box-border transition-colors focus:border-orange-400"
              />
            </div>

            {/* Company Selection */}
            <div className="flex flex-col">
              <label className="text-[13px] font-semibold text-slate-700 mb-2">Assign Company</label>
              <div className="flex p-1 bg-slate-100 rounded-lg w-fit border border-slate-200">
                {["affotax", "outsource"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCompany(c)}
                    className={`px-4 py-1.5 rounded-md text-[12px] font-bold capitalize transition-all ${
                      company === c
                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>


            <label className="flex items-center gap-2 cursor-pointer pb-2.5 text-[#888] text-[13px] font-mono shrink-0">
              <div
                onClick={() => setIsDefault(v => !v)}
                className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer shrink-0 border ${
                  isDefault ? "bg-orange-600 border-orange-400" : "bg-[#222] border-[#333]"
                }`}
              >
                <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all duration-200 ${isDefault ? "left-[17px]" : "left-0.5"}`} />
              </div>
              Set as default
            </label>
          </div>

          {/* Tags */}
          {/* <div>
            <label className="block font-mono text-[11px] text-[#555] mb-1.5 uppercase tracking-wide">
              Tags <span className="text-[#444] normal-case">(comma separated)</span>
            </label>
            <input
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g. sales, newsletter, support"
              className="w-full bg-[#f8f7f5] border border-[#e4e2dc] rounded-[10px] text-[#1a1916] font-sans text-[13px] px-3.5 py-2.5 outline-none box-border transition-colors focus:border-orange-400"
            />
          </div> */}

          {/* Code / Preview tabs */}
          <div>
            <div className="flex gap-0.5 mb-2.5">
              {["code", "preview"].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-[12px] font-mono cursor-pointer transition-all duration-150 ${
                    tab === t
                      ? "bg-[#1a1040] border-orange-600 text-orange-300"
                      : "bg-transparent border-[#e4e2dc] text-[#555]"
                  }`}
                >
                  <Icon name={t === "code" ? "code" : "eye"} size={12} />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {tab === "code" ? (
              <textarea
                ref={textareaRef}
                value={html}
                onChange={e => setHtml(e.target.value)}
                placeholder="Paste your HTML signature here…"
                className="w-full bg-[#f8f7f5] border border-[#e4e2dc] rounded-[10px] text-orange-300 font-mono text-[12px] px-3.5 py-2.5 outline-none box-border leading-relaxed resize-y h-[260px] focus:border-orange-400"
              />
            ) : (
              <div className="border border-[#e4e2dc] rounded-[10px] bg-white min-h-[260px] p-5 overflow-auto">
                {html ? (
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                ) : (
                  <span className="text-[#bbb] text-[13px] font-mono">Nothing to preview yet…</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#f3f2ef] flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="bg-transparent border border-[#e4e2dc] rounded-[9px] text-[#555] cursor-pointer font-mono text-[13px] px-[18px] py-[9px] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={disabled}
            className={`flex items-center gap-1.5 border-none rounded-[9px] px-5 py-[9px] font-mono text-[13px] transition-all duration-150 ${
              disabled
                ? "bg-[#2a1f4a] text-[#6d5ea0] cursor-not-allowed"
                : "bg-orange-600 text-white cursor-pointer hover:bg-orange-700"
            }`}
          >
            <Icon name="save" size={14} />
            {saving ? "Saving…" : "Save Signature"}
          </button>
        </div>
      </div>
    </div>
  );
}
