import React, { useEffect, useState } from "react";
import { IoClose, IoAdd } from "react-icons/io5";
import { RiUploadCloud2Fill } from "react-icons/ri";
import { TbLoader2 } from "react-icons/tb";
import Select from "react-select";
import axios from "axios";
import { useSelector } from "react-redux";

import CustomEditor from "../../../utlis/CustomEditor";
import { style } from "../../../utlis/CommonStyle";
import AIReplySelector from "../../ai/AIReplySelector";
import {
  filterOption,
  HighlightedOption,
  sortOptions
} from "../../Tickets/HighlightedOption";
import { useEmailReply } from "../hooks/useEmailReply";

/* ---------------- modern helper input ---------------- */
const EmailField = ({ label, value, onChange, placeholder }) => (
  <div className="group w-full flex items-center border-b border-gray-100 py-1.5 focus-within:border-orange-400 transition-colors">
    <span className="w-24 text-xs font-medium text-gray-400 uppercase tracking-wider  ">{label}</span>
    <input
      value={Array.isArray(value) ? value.join(", ") : value}
      onChange={(e) => {
        const val = e.target.value;
        onChange(Array.isArray(value) ? val.split(",").map(v => v.trim()).filter(Boolean) : val);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault(); // <--- Prevent Enter from submitting form
        }
      }}
      className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-300  "
      placeholder={placeholder}
    />
  </div>
);


export default function Reply({ setShowReply, company, emailDetail, getEmailDetail }) {
  const auth = useSelector((state) => state.auth.auth);
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showExtras, setShowExtras] = useState(false); // For Cc/Bcc toggle

  const {
    mode, setMode, to, setTo, cc, setCc, bcc, setBcc,
    replyTo, setReplyTo, message, setMessage,
    files, addFiles, removeFile, send, loading
  } = useEmailReply({ companyName: company, emailDetail });

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/v1/templates/get/all/template`)
      .then((res) => setTemplates(res.data?.templates || []))
      .catch(console.error);
    
    // Esc to close
    const esc = (e) => e.key === "Escape" && setShowReply(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const templateOptions = templates.map((t) => ({
    value: t._id,
    label: t.name,
    description: t.template
  }));

  const handleTemplateChange = (opt) => {
    setTemplateId(opt?.value || "");
    if (opt?.description) setMessage(opt.description);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-sm flex justify-center items-start overflow-y-auto ">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-xl  animate-in fade-in zoom-in duration-200 relative mt-24">
          <AIReplySelector threadId={emailDetail?.threadId} onSelect={setMessage} />
        {/* Compact Header */}
        <div className="bg-slate-50 px-5 py-3 flex justify-between items-center border-b rounded-xl">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-slate-700">New Reply</h2>
            <div className="flex bg-slate-200/60 p-1 rounded-lg">
              <button 
                onClick={() => setMode("reply")}
                className={`px-3 py-1 text-xs rounded-md transition ${mode === 'reply' ? 'bg-white shadow-sm font-semibold text-orange-600' : 'text-slate-500'}`}
              >Reply</button>
              <button 
                onClick={() => setMode("replyAll")}
                className={`px-3 py-1 text-xs rounded-md transition ${mode === 'replyAll' ? 'bg-white shadow-sm font-semibold text-orange-600' : 'text-slate-500'}`}
              >Reply All</button>
            </div>
          </div>
          <button onClick={() => setShowReply(false)} className="hover:bg-slate-200 p-1 rounded-full transition">
            <IoClose className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onKeyDown={(e) => {
    // Prevent form submit on Enter key unless Shift+Enter
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }} onSubmit={(e) => { e.preventDefault(); send().then(getEmailDetail);  }} className="flex flex-col">
          
          <div className="px-5 py-2 space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <EmailField label="To" value={to} onChange={setTo} placeholder="Recipient email" />
              </div>
              {!showExtras && (
                <button 
                  type="button" 
                  onClick={() => setShowExtras(true)}
                  className="text-[10px] font-bold text-slate-400 hover:text-orange-500 border rounded px-1.5 py-0.5"
                >Cc/Bcc</button>
              )}
            </div>

            {showExtras && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <EmailField label="Cc" value={cc} onChange={setCc} />
                <EmailField label="Bcc" value={bcc} onChange={setBcc} />
                <EmailField label="Reply-To" value={replyTo} onChange={setReplyTo} />
              </div>
            )}
          </div>

          {/* AI and Templates Row */}
          <div className="px-5 py-2 flex gap-3 border-b border-gray-50 bg-white">
            <div className="w-full">
              <Select
                styles={{ control: (base) => ({ ...base, border: 'none', boxShadow: 'none', fontSize: '14px', background: '#f8fafc' }) }}
                value={templateOptions.find(o => o.value === templateId)}
                onChange={handleTemplateChange}
                options={sortOptions(templateOptions, inputValue)}
                placeholder="Insert Template..."
                components={{ Option: HighlightedOption }}
                onInputChange={setInputValue}
              />
            </div>
            
          </div>

          {/* Editor Area */}
          <div className="px-5 py-4 min-h-[300px]">
            <CustomEditor template={message} setTemplate={setMessage} />
          </div>

          {/* Bottom Bar */}
          <div className="px-5 py-3 bg-slate-50 flex items-center justify-between border-t rounded-xl">
            <div className="flex items-center gap-3">
              <input type="file" id="file" multiple hidden onChange={(e) => addFiles(e.target.files)} />
              <label htmlFor="file" className="flex items-center gap-2 text-slate-600 hover:text-orange-600 cursor-pointer bg-white border px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition">
                <RiUploadCloud2Fill className="text-lg" />
                <span>Attach</span>
              </label>

              <div className="flex flex-wrap gap-1 max-w-[300px]">
                {files.map((f) => (
                  <div key={f.name} className="flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded text-[11px] font-medium">
                    <span className="truncate max-w-[80px]">{f.name}</span>
                    <IoClose className="cursor-pointer hover:text-red-500" onClick={() => removeFile(f.name)} />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center gap-2"
            >
              {loading ? <TbLoader2 className="animate-spin text-lg" /> : "Send Reply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}