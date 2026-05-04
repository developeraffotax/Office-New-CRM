import { useState } from "react";
import { Btn } from "./Btn";

export function SignatureCard({ sig, onEdit, onDelete, onSetDefault }) {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied]           = useState(false);

  const copyHtml = () => {
    navigator.clipboard.writeText(sig.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden transition-colors duration-200 hover:border-[#333]">
      {/* Header */}
      <div className="px-4 py-3.5 flex items-center gap-2.5 border-b border-[#f3f2ef]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-sans font-semibold text-sm text-[#1a1916] truncate">
              {sig.name}
            </span>
            {sig.is_default && (
              <span className="bg-[#ede9fb] text-orange-400 text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0">
                DEFAULT
              </span>
            )}
            <span className="font-sans font-semibold text-sm text-[#1a1916] truncate">
              {sig.company}
            </span>
          </div>
          {/* {sig.tags?.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {sig.tags.map(tag => (
                <span key={tag} className="bg-[#f3f2ef] text-[#666] text-[10px] px-1.5 py-0.5 rounded-full font-mono border border-[#e4e2dc]">
                  {tag}
                </span>
              ))}
            </div>
          )} */}
        </div>
        <div className="flex gap-1">
          <Btn icon="copy"                       title={copied ? "Copied!" : "Copy HTML"} onClick={copyHtml}                     active={copied}          />
          <Btn icon="eye"                        title="Toggle preview"                   onClick={() => setShowPreview(v => !v)} active={showPreview}     />
          <Btn icon={sig.is_default ? "star" : "starOutline"} title="Set as default"     onClick={() => onSetDefault(sig.id)}   accent={sig.is_default}  />
          <Btn icon="edit"                       title="Edit"                             onClick={() => onEdit(sig)}                                      />
          <Btn icon="trash"                      title="Delete"                           onClick={() => onDelete(sig)}           danger                   />
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="bg-white p-5 border-t border-[#f3f2ef]">
          <div dangerouslySetInnerHTML={{ __html: sig.html }} />
        </div>
      )}

      {/* Meta */}
      <div className="px-4 py-2 flex justify-end">
        <span className="text-[10px] text-[#444] font-mono">
          {new Date(sig.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>
    </div>
  );
}
