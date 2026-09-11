import React, { useEffect, useState, useMemo } from "react";
import { HiReply, HiOutlineSparkles } from "react-icons/hi";
import { IoClose, IoTrashOutline, IoChevronDown } from "react-icons/io5";
import { MdOutlineAttachment } from "react-icons/md";
import { TbLoader2 } from "react-icons/tb";
import axios from "axios";
import CustomEditorNew from "../../../utlis/CustomEditorNew";
import { useEmailReply } from "../hooks/useEmailReply";
import EmailChipInput from "./EmailChipInput";
import toast from "react-hot-toast";
import AIReplySelectorNew from "../../ai/AIReplySelectorNew";
import CustomSelect from "../../../utlis/CustomSelect";

export default function ReplyMobile({
  company,
  emailDetail,
  subject,
  expanded,
  onExpand,
  onCollapse,
  getEmailDetail,
}) {
  const {
    mode,
    setMode,
    to,
    setTo,
    cc,
    setCc,
    bcc,
    setBcc,
    message,
    setMessage,
    files,
    addFiles,
    removeFile,
    send,
    loading,
    signature,
    setSignature,
  } = useEmailReply({ companyName: company, emailDetail });

  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");

  const [showCcField, setShowCcField] = useState(false);
  const [showBccField, setShowBccField] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  const [signatures, setSignatures] = useState([]);
  const [signatureId, setSignatureId] = useState("");

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/templates/get/all/template`)
      .then((res) => setTemplates(res.data?.templates || []));
  }, []);

  useEffect(() => {
    if (mode === "replyAll") {
      setShowCcField(true);
    }
  }, [mode, cc]);

  const getAllSignatures = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/signatures`,
        { params: { company } }
      );
      setSignatures(data?.data || []);
    } catch (error) {
      toast.error("Failed to load signatures");
    }
  };

  useEffect(() => {
    getAllSignatures();
  }, [company]);

  const templateOptions = useMemo(
    () =>
      templates.map((t) => ({
        value: t._id,
        label: `${t.name} - ${t.description} `,
        description: t.template,
      })),
    [templates]
  );

  const signatureOptions = useMemo(
    () =>
      signatures.map((sig) => ({
        value: sig._id,
        label: sig.name,
        html: sig.html,
      })),
    [signatures]
  );

  const selectedSignature = useMemo(() => {
    if (!signatureId || signatureOptions.length === 0) return null;
    return signatureOptions.find((option) => option.value === signatureId) ?? null;
  }, [signatureOptions, signatureId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (message?.trim()?.length === 0) {
      return toast.error("Message can't be empty!");
    }
    await send();
    getEmailDetail();
  };

  const handleDiscard = () => {
    onCollapse();
  };

  return (
    <>
      {/* Backdrop behind the expanded sheet — tap to collapse without losing the draft */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40"
          onClick={onCollapse}
        />
      )}

      {expanded ? (
        // ---- Expanded: full compose sheet, docked to the bottom ----
        <div className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] bg-white rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-pop">
          {/* Drag handle */}
          <div className="pt-2 pb-1 flex justify-center shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Header */}
          <div className="px-4 pb-2 flex items-center justify-between shrink-0 border-b border-gray-100">
            <div className="flex items-center gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => setMode("reply")}
                className={`px-3 py-1 rounded-full transition ${
                  mode === "reply"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 active:bg-gray-200"
                }`}
              >
                Reply
              </button>
              <button
                type="button"
                onClick={() => setMode("replyAll")}
                className={`px-3 py-1 rounded-full transition ${
                  mode === "replyAll"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 active:bg-gray-200"
                }`}
              >
                Reply All
              </button>
            </div>

            <button
              onClick={onCollapse}
              className="p-1.5 rounded-full text-gray-400 active:bg-gray-100 active:text-gray-600"
              title="Minimize"
            >
              <IoChevronDown className="text-lg" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-2 space-y-1">
              {/* To Field */}
              <div className="w-full flex items-center text-sm group py-1">
                <EmailChipInput label="To" values={to} setValues={setTo} />
                <div className="flex gap-3 text-xs font-medium text-gray-400">
                  {!showCcField && (
                    <button
                      type="button"
                      className="active:text-blue-600"
                      onClick={() => setShowCcField(true)}
                    >
                      Cc
                    </button>
                  )}
                  {!showBccField && (
                    <button
                      type="button"
                      className="active:text-blue-600"
                      onClick={() => setShowBccField(true)}
                    >
                      Bcc
                    </button>
                  )}
                </div>
              </div>

              {showCcField && (
                <div className="flex items-center text-sm py-1 animate-pop">
                  <EmailChipInput label="Cc" values={cc} setValues={setCc} />
                  <button
                    onClick={() => {
                      setShowCcField(false);
                      setCc(undefined);
                    }}
                  >
                    <IoClose className="text-gray-400 active:text-red-500" />
                  </button>
                </div>
              )}

              {showBccField && (
                <div className="flex items-center text-sm py-1 animate-pop">
                  <EmailChipInput label="Bcc" values={bcc} setValues={setBcc} />
                  <button
                    onClick={() => {
                      setShowBccField(false);
                      setBcc(undefined);
                    }}
                  >
                    <IoClose className="text-gray-400 active:text-red-500" />
                  </button>
                </div>
              )}

              {/* Template + Signature selectors, stacked for mobile width */}
              <div className="w-full space-y-2 py-1">
                <CustomSelect
                  value={templateId}
                  options={templateOptions}
                  placeholder="Select a response template..."
                  onChange={(opt) => {
                    setTemplateId(opt?.value);
                    setMessage(opt?.description);
                  }}
                />
                <CustomSelect
                  value={signatureId}
                  options={signatureOptions}
                  placeholder="Select Signature..."
                  onChange={(selectedOption) => {
                    setSignatureId(selectedOption?.value || "");
                    setSignature(selectedOption?.html || "");
                  }}
                />
              </div>
            </div>

            {/* Editor */}
            <div className="px-4 py-2 w-full">
              <CustomEditorNew template={message} setTemplate={setMessage} />

              {selectedSignature?.html && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 relative">
                  <span className="absolute -top-2 left-3 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Signature Preview
                  </span>
                  <div
                    className="text-xs opacity-70 italic pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: selectedSignature.html }}
                  />
                </div>
              )}
            </div>

            {/* Attachment Chips */}
            {files.length > 0 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-gray-50 bg-[#f8f9fa]">
                {files.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 shadow-sm"
                  >
                    <span className="truncate max-w-[150px]">{f.name}</span>
                    <IoClose
                      className="cursor-pointer text-gray-400 active:text-red-500"
                      onClick={() => removeFile(f.name)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* AI Suggestions — collapsible, mobile has no room for a side panel */}
            <div className="px-4 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAiSuggestions((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-orange-600"
              >
                <HiOutlineSparkles className="text-sm" />
                {showAiSuggestions ? "Hide AI suggestions" : "Suggest with AI"}
              </button>

              {showAiSuggestions && (
                <div className="mt-3">
                  <AIReplySelectorNew
                    threadId={emailDetail?.threadId}
                    onSelect={setMessage}
                    companyName={company}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Action Bar — stays pinned to the bottom of the sheet */}
          <div className="p-4 flex items-center justify-between border-t border-gray-100 shrink-0 bg-white">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-orange-500 active:bg-orange-600 text-white px-10 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm flex items-center gap-2"
              >
                {loading ? (
                  <TbLoader2 className="animate-spin text-lg" />
                ) : (
                  "Send"
                )}
              </button>

              <input
                type="file"
                id="gmail-attach-mobile"
                multiple
                hidden
                onChange={(e) => addFiles(e.target.files)}
              />
              <label
                htmlFor="gmail-attach-mobile"
                className="p-2 active:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-600"
                title="Attach files"
              >
                <MdOutlineAttachment size={22} />
              </label>
            </div>

            <button
              onClick={handleDiscard}
              className="p-2 active:bg-gray-100 active:text-red-600 rounded-full transition-colors text-gray-500"
              title="Minimize draft"
            >
              <IoTrashOutline size={20} />
            </button>
          </div>
        </div>
      ) : (
        // ---- Collapsed: slim peek bar, always docked to the bottom ----
        <button
          onClick={onExpand}
          className="fixed inset-x-0 bottom-0 z-40 w-full bg-white border-t border-gray-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] flex items-center gap-3 text-left"
        >
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            <HiReply className="text-sm" />
          </div>
          <span className="flex-1 min-w-0 text-sm text-gray-400 truncate">
            {message?.trim() ? message.replace(/<[^>]+>/g, "") : "Reply..."}
          </span>
          {subject && (
            <span className="text-xs font-medium text-gray-400 truncate max-w-[100px] shrink-0">
              {subject}
            </span>
          )}
        </button>
      )}
    </>
  );
}