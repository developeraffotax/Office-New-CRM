import React, { useEffect, useState, useMemo } from "react";
import { IoClose, IoTrashOutline } from "react-icons/io5";
import { MdOutlineAttachment } from "react-icons/md";
import { TbLoader2 } from "react-icons/tb";
import Select from "react-select";
import axios from "axios";
import CustomEditorNew from "../../../utlis/CustomEditorNew";
import {
  sortOptions,
  HighlightedOption,
} from "../../Tickets/HighlightedOption";
import { useEmailReply } from "../hooks/useEmailReply";
import EmailChipInput from "./EmailChipInput";
import toast from "react-hot-toast";
import AIReplySelectorNew from "../../ai/AIReplySelectorNew";
import { HiChatAlt2, HiOutlineOfficeBuilding } from "react-icons/hi";
import { useEscapeKey } from "../../../utlis/useEscapeKey";

export default function Reply({
  company,
  emailDetail,
  getEmailDetail,
  setShowReplyEditor,

  ticketId
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
  } = useEmailReply({ companyName: company, emailDetail, ticketId });

  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [inputValue, setInputValue] = useState("");

  // States to control visibility of CC and BCC fields
  const [showCcField, setShowCcField] = useState(false);
  const [showBccField, setShowBccField] = useState(false);

  useEscapeKey(() => {
    setShowReplyEditor(false)
  })

  const handleSend = async (e) => {
    e.preventDefault();
    if (message?.trim()?.length === 0) {
      return toast.error("Message can't be empty!");
    }
    await send();
    setShowReplyEditor(false)
    getEmailDetail();
  };

  const templateOptions = useMemo(
    () =>
      templates.map((t) => ({
        value: t._id,
        label: `${t.name} - ${t.description}`,
        description: t.template,
      })),
    [templates],
  );
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



  return (
    <div className="w-[60%] max-w-[80vw]   items-stretch flex gap-4">

      <ReplyingFrom companyName={company} />
      
      <div className="  w-[70%]  bg-white border   border-red-200 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-pop  ">
        {/* Header Area */}
        <div className="px-4 pt-3 pb-1 space-y-1 bg-white w-full ">
          {/* Reply Mode Toggle */}
          
          <div className="flex items-center gap-3 px-4 pt-3 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode("reply")}
              className={`px-3 py-1 rounded-full transition ${
                mode === "reply"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Reply All
            </button>
          </div>

          {/* To Field */}
          <div className="w-full flex items-center text-sm   group py-1">
            <EmailChipInput label="To" values={to} setValues={setTo} />

            <div className="flex gap-3 text-xs font-medium text-gray-400">
              {!showCcField && (
                <button
                  type="button"
                  className="hover:text-blue-600 hover:underline"
                  onClick={() => setShowCcField(true)}
                >
                  Cc
                </button>
              )}
              {!showBccField && (
                <button
                  type="button"
                  className="hover:text-blue-600 hover:underline"
                  onClick={() => setShowBccField(true)}
                >
                  Bcc
                </button>
              )}
            </div>
          </div>

          {/* Conditional CC Field */}
          {showCcField && (
            <div className="flex items-center text-sm  py-1 animate-pop ">
              <EmailChipInput label="Cc" values={cc} setValues={setCc} />
              <button
                onClick={() => {
                  setShowCcField(false);
                  setCc(undefined);
                }}
              >
                <IoClose className="text-gray-400 hover:text-red-500" />
              </button>
            </div>
          )}

          {/* Conditional BCC Field */}
          {showBccField && (
            <div className="flex items-center text-sm py-1  animate-pop  ">
              <EmailChipInput label="Bcc" values={bcc} setValues={setBcc} />
              <button
                onClick={() => {
                  setShowBccField(false);
                  setBcc(undefined);
                }}
              >
                <IoClose className="text-gray-400 hover:text-red-500" />
              </button>
            </div>
          )}

          {/* Template Selector - Integrated into Header */}
          <div className="flex items-center text-sm py-1">
            <span className="w-20 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              Template
            </span>
            <div className="flex-1">
              <Select
                placeholder="Select a response template..."
                value={templateOptions.find((opt) => opt.value === templateId)}
                options={sortOptions(templateOptions, inputValue)}
                onChange={(opt) => {
                  setTemplateId(opt.value);
                  setMessage(opt.description);
                }}
                onInputChange={(val) => setInputValue(val)}
                components={{ Option: HighlightedOption }}
                styles={{
                  control: (base) => ({
                    ...base,
                    background: "transparent",
                    border: "none",
                    boxShadow: "none",
                    fontSize: "13px",
                    minHeight: "30px",
                    cursor: "pointer",
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                  placeholder: (base) => ({ ...base, color: "#9ca3af" }),
                }}
              />
            </div>
          </div>


          
        </div>

        {/* Editor Body */}
        <div className="px-4 py-2 w-full  ">
          <CustomEditorNew template={message} setTemplate={setMessage} />
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
                  className="cursor-pointer text-gray-400 hover:text-red-500"
                  onClick={() => removeFile(f.name)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer Action Bar */}
        <div className="px-4 py-4 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              {loading ? (
                <TbLoader2 className="animate-spin text-lg" />
              ) : (
                "Send"
              )}
            </button>

            <input
              type="file"
              id="gmail-attach"
              multiple
              hidden
              onChange={(e) => addFiles(e.target.files)}
            />
            <label
              htmlFor="gmail-attach"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-600"
              title="Attach files"
            >
              <MdOutlineAttachment size={22} />
            </label>
          </div>

          

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReplyEditor(false)}
              className="p-2 hover:bg-gray-100 hover:text-red-600 rounded-full transition-colors text-gray-500"
              title="Discard draft"
            >
              <IoTrashOutline size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-[30%]  max-h-[650px] ">
        <AIReplySelectorNew
          threadId={emailDetail?.threadId}
          onSelect={setMessage}
        />
      </div>
    </div>
  );
}
























const ReplyingFrom = ({ companyName }) => {
  return (
    <div className="fixed bottom-4 right-2 group flex items-center gap-[10px] bg-white border border-[#fde8d8] rounded-[100px] py-[7px] pl-2 pr-3.5 shadow-[0_1px_3px_rgba(220,100,40,0.06),0_4px_12px_rgba(220,100,40,0.05)] transition-all duration-200 ease-in-out hover:shadow-[0_2px_8px_rgba(220,100,40,0.1),0_6px_20px_rgba(220,100,40,0.06)] hover:-translate-y-px cursor-default">
      {/* Icon Wrap with Gradient */}
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-[#e85d20] to-[#f0884a] flex-shrink-0">
        <HiChatAlt2 className="w-3.5 h-3.5 text-white" />
      </div>

      {/* Label (Mono) */}
      <span className="font-mono text-[9px] font-medium tracking-[0.12em] uppercase text-[#c8947a] leading-none whitespace-nowrap">
        Replying from
      </span>

      {/* Divider */}
      <div className="w-[1px] h-3.5 bg-[#fde8d8] flex-shrink-0" />

      {/* Company Name */}
      <span className="text-[13px] font-bold text-[#1a1a1a] tracking-[-0.01em] whitespace-nowrap capitalize">
        {companyName}
      </span>
    </div>
  );
};
