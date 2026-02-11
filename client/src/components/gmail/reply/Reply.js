import React, { useEffect, useState, useMemo } from "react";
import { IoClose } from "react-icons/io5";
import { RiUploadCloud2Fill } from "react-icons/ri";
import { TbLoader2 } from "react-icons/tb";
import Select from "react-select";
import axios from "axios";
import CustomEditor from "../../../utlis/CustomEditor";
import { sortOptions, HighlightedOption } from "../../Tickets/HighlightedOption";
import { useEmailReply } from "../hooks/useEmailReply";

export default function Reply({ company, emailDetail, getEmailDetail, setShowReplyEditor }) {
  const { to, setTo, cc, setCc, bcc, setBcc, message, setMessage, files, addFiles, removeFile, send, loading } = useEmailReply({ companyName: company, emailDetail });
  
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/v1/templates/get/all/template`)
      .then(res => setTemplates(res.data?.templates || []));
  }, []);

  const templateOptions = useMemo(() => 
    templates.map(t => ({ value: t._id, label: t.name, description: t.template })), [templates]);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header with To/Cc/Bcc AND Template Selector */}
      <div className="px-4 py-2 bg-white space-y-1">
        <div className="flex items-center text-sm border-b border-gray-100 py-2">
          <span className="w-12 text-gray-500 font-medium">To</span>
          <input className="flex-1 outline-none text-gray-800" value={to} onChange={(e) => setTo(e.target.value)} />
          <div className="flex gap-3 text-xs font-medium text-gray-400">
            <button type="button" onClick={() => setCc(cc === undefined ? "" : undefined)}>Cc</button>
            <button type="button" onClick={() => setBcc(bcc === undefined ? "" : undefined)}>Bcc</button>
            <button onClick={() => setShowReplyEditor(false)} className="text-gray-400 hover:text-red-500"><IoClose className="text-lg"/></button>
          </div>
        </div>
        
        {cc !== undefined && (
          <div className="flex items-center text-sm border-b border-gray-100 py-2">
            <span className="w-12 text-gray-500 font-medium">Cc</span>
            <input className="flex-1 outline-none text-gray-800" value={cc} onChange={(e) => setCc(e.target.value)} />
          </div>
        )}
        
        {bcc !== undefined && (
          <div className="flex items-center text-sm border-b border-gray-100 py-2">
            <span className="w-12 text-gray-500 font-medium">Bcc</span>
            <input className="flex-1 outline-none text-gray-800" value={bcc} onChange={(e) => setBcc(e.target.value)} />
          </div>
        )}

        {/* Template Selector placed directly below headers */}
        <div className="flex items-center text-sm py-2 bg-gray-50/50 px-2 rounded-md mt-1">
          <span className="w-20 text-gray-500 text-xs font-bold uppercase tracking-wider">Template:</span>
          <div className="flex-1">
            <Select
              placeholder="Search and select a template..."
              value={templateOptions.find(opt => opt.value === templateId)}
              options={sortOptions(templateOptions, inputValue)}
              onChange={(opt) => { setTemplateId(opt.value); setMessage(opt.description); }}
              onInputChange={(val) => setInputValue(val)}
              components={{ Option: HighlightedOption }}
              styles={{ 
                control: (base) => ({ ...base, background: 'transparent', border: 'none', boxShadow: 'none', fontSize: '13px' }),
                menu: (base) => ({ ...base, zIndex: 9999 })
              }}
            />
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="px-1 py-2 min-h-[300px] bg-white">
        <CustomEditor template={message} setTemplate={setMessage} />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-[#f6f8fc] flex items-center justify-between border-t border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={async (e) => { e.preventDefault(); await send(); getEmailDetail(); }}
            disabled={loading}
            className="bg-[#0b57d0] hover:bg-[#0842a0] text-white px-8 py-2 rounded-full font-bold text-sm shadow-sm transition-all flex items-center gap-2"
          >
            {loading ? <TbLoader2 className="animate-spin text-lg" /> : "Send"}
          </button>
          
          <input type="file" id="gmail-file-input" multiple hidden onChange={(e) => addFiles(e.target.files)} />
          <label htmlFor="gmail-file-input" className="cursor-pointer text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
            <RiUploadCloud2Fill className="text-xl" />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {files.map(f => (
            <div key={f.name} className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-md text-[11px] font-medium shadow-sm">
              <span className="truncate max-w-[120px]">{f.name}</span>
              <IoClose className="cursor-pointer hover:text-red-500 text-gray-400" onClick={() => removeFile(f.name)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}