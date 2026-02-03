import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { RiUploadCloud2Fill } from "react-icons/ri";
import { TbLoader2 } from "react-icons/tb";
import { useSelector } from "react-redux";

import CustomEditor from "../../../utlis/CustomEditor";
import { useEmailForward } from "../hooks/useEmailForward";

/* ---------------- helper ---------------- */
const EmailField = ({ label, value, onChange, placeholder }) => (
  <div className="group w-full flex items-center border-b border-gray-100 py-1.5 focus-within:border-orange-400 transition-colors">
    <span className="w-24 text-xs font-medium text-gray-400 uppercase tracking-wider">
      {label}
    </span>
    <input
      value={Array.isArray(value) ? value.join(", ") : value}
      onChange={(e) => {
        const val = e.target.value;
        onChange(
          Array.isArray(value)
            ? val.split(",").map((v) => v.trim()).filter(Boolean)
            : val
        );
      }}
      onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
      className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-300"
      placeholder={placeholder}
    />
  </div>
);

export default function Forward({
  setShowForward,
  company,
  emailDetail,
  getEmailDetail,
  forwardMessageId
}) {
  const auth = useSelector((state) => state.auth.auth);
  const [showExtras, setShowExtras] = useState(false);

  const {
    to, setTo,
    cc, setCc,
    bcc, setBcc,
    subject, setSubject,
    message, setMessage,
    files, addFiles, removeFile,
    originalAttachments, removeOriginalAttachment,
    send, loading
  } = useEmailForward({ companyName: company, emailDetail, forwardMessageId, setShowForward });

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setShowForward(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {


      await send();
      getEmailDetail();
      

    } catch (error) {
      console.log("Error while forwarding message", error)
    }




  }

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-sm flex justify-center items-start overflow-y-auto">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-xl animate-in fade-in zoom-in duration-200 relative mt-24">

        {/* Header */}
        <div className="bg-slate-50 px-5 py-3 flex justify-between items-center border-b rounded-xl">
          <h2 className="text-sm font-bold text-slate-700">Forward Message</h2>
          <button
            onClick={() => setShowForward(false)}
            className="hover:bg-slate-200 p-1 rounded-full transition"
          >
            <IoClose className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col"
        >
          {/* Recipients */}
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
                >
                  Cc/Bcc
                </button>
              )}
            </div>

            {showExtras && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <EmailField label="Cc" value={cc} onChange={setCc} />
                <EmailField label="Bcc" value={bcc} onChange={setBcc} />
              </div>
            )}

            <EmailField label="Subject" value={subject} onChange={setSubject} placeholder="Fwd: Subject" />
          </div>

          {/* Editor */}
          <div className="px-5 py-4 min-h-[300px]">
            <CustomEditor template={message} setTemplate={setMessage} />
          </div>

          {/* Attachments */}
          <div className="px-5 py-3 flex flex-col gap-2">
            {/* New uploads */}
            <div className="flex items-center gap-3">
              <input
                type="file"
                id="forward-file"
                multiple
                hidden
                onChange={(e) => addFiles(e.target.files)}
              />
              <label
                htmlFor="forward-file"
                className="flex items-center gap-2 text-slate-600 hover:text-orange-600 cursor-pointer bg-white border px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition"
              >
                <RiUploadCloud2Fill className="text-lg" />
                <span>Attach</span>
              </label>

              <div className="flex flex-wrap gap-1 max-w-[300px]">
                {files.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded text-[11px] font-medium"
                  >
                    <span className="truncate max-w-[80px]">{f.name}</span>
                    <IoClose className="cursor-pointer hover:text-red-500" onClick={() => removeFile(f.name)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Original attachments */}
            {originalAttachments.length > 0 && (
              <div className="flex flex-wrap gap-1 max-w-[300px] mt-1">
                {originalAttachments.map((a) => (
                  <div
                    key={a.attachmentId}
                    className="flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium"
                  >
                    <span className="truncate max-w-[80px]">{a.attachmentFileName}</span>
                    <IoClose
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => removeOriginalAttachment(a.attachmentId)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-slate-50 flex items-center justify-end border-t rounded-xl">
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center gap-2"
            >
              {loading ? <TbLoader2 className="animate-spin text-lg" /> : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
