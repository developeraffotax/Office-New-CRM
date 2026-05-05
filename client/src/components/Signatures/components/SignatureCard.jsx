import { useState } from "react";
import { Btn } from "./Btn";

export function SignatureCard({ sig, onEdit, onDelete, onSetDefault }) {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyHtml = () => {
    navigator.clipboard.writeText(sig.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className=" group relative bg-white font-google border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-300">
      
      {/* Header Section */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-base text-slate-900 truncate">
              {sig.name}
            </h3>
            
            {sig.is_default && (
              <span className="inline-flex items-center bg-orange-50 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase border border-orange-100">
                Default
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-500">
           <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider uppercase truncate max-w-[180px]">
  {sig.company}
</span>
            {/* <span className="text-slate-300">•</span>
            <span className="font-mono text-[11px] opacity-70">
              {new Date(sig.updatedAt).toLocaleDateString("en-US", { 
                month: "short", 
                day: "numeric" 
              })}
            </span> */}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-center bg-slate-50 p-1 rounded-xl border border-slate-100">
          <Btn 
            icon="copy" 
            title={copied ? "Copied!" : "Copy HTML"} 
            onClick={copyHtml} 
            active={copied} 
          />
          <Btn 
            icon="eye" 
            title="Toggle preview" 
            onClick={() => setShowPreview(v => !v)} 
            active={showPreview} 
          />
          <div className="w-px h-4 bg-slate-200 mx-1" /> {/* Visual Separator */}
          <Btn 
            icon={sig.is_default ? "star" : "starOutline"} 
            title="Set as default" 
            onClick={() => onSetDefault(sig._id)} 
            accent={sig.is_default} 
          />
          <Btn 
            icon="edit" 
            title="Edit" 
            onClick={() => onEdit(sig)} 
          />
          <Btn 
            icon="trash" 
            title="Delete" 
            onClick={() => onDelete(sig)} 
            danger 
          />
        </div>
      </div>

      {/* Modern Preview Area */}
      {showPreview && (
        <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="relative group/canvas">
            <div className="absolute -top-2.5 left-4 px-2 bg-white text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              Live Preview
            </div>
            <div 
              className="p-6 border border-slate-100 bg-slate-50/50 rounded-xl overflow-x-auto ring-1 ring-inset ring-slate-900/5" 
              dangerouslySetInnerHTML={{ __html: sig.html }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}