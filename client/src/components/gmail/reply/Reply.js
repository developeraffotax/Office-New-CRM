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
  filterOption,
} from "../../Tickets/HighlightedOption";
import { useEmailReply } from "../hooks/useEmailReply";
import EmailChipInput from "./EmailChipInput";
import toast from "react-hot-toast";
import AIReplySelectorNew from "../../ai/AIReplySelectorNew";
import CustomSelect from "../../../utlis/CustomSelect";

export default function Reply({
  company,
  emailDetail,
  getEmailDetail,
  setShowReplyEditor,

  inline,
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
  const [inputValue, setInputValue] = useState("");

  // States to control visibility of CC and BCC fields
  const [showCcField, setShowCcField] = useState(false);
  const [showBccField, setShowBccField] = useState(false);



  const handleSend = async (e) => {
    e.preventDefault();
    if (message?.trim()?.length === 0) {
      return toast.error("Message can't be empty!");
    }
    await send();
    getEmailDetail();
  };

  const templateOptions = useMemo(
    () =>
      templates.map((t) => ({
        value: t._id,
        label: `${t.name} - ${t.description} `,
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




  

  const [signatures, setSignatures] = useState([]);
  const [signatureId, setSignatureId] = useState("");


  const getAllSignatures = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/signatures`,
        { params: { company } },
      );
      setSignatures(data?.data || []);
    } catch (error) {
      toast.error("Failed to load signatures");
    }
  };

  useEffect(() => {
    getAllSignatures();
  }, [company]);



  
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
  
    return (
      signatureOptions.find(
        (option) => option.value === signatureId
      ) ?? null
    );
  }, [signatureOptions, signatureId]);
  
 
  
  
  



  return (
    <div className="w-full h-[600px] flex justify-start items-start gap-4">
      <div
        className={` ${
          inline ? "w-full" : "w-[70%] rounded-xl "
        }   bg-white border   border-gray-200 shadow-2xl flex flex-col overflow-hidden animate-pop`}
      >
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
          {!inline && (
            <div className="w-full flex items-center justify-between gap-3  text-sm py-1">
             
              <div className="flex-1">
                <CustomSelect
                  value={templateId}
                  options={templateOptions}
                  placeholder="Select a response template..."
                  onChange={(opt) => {
                    setTemplateId(opt?.value);
                    setMessage(opt?.description);
                  }}
                />
              </div>
             

             
              <div className="flex-1">
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
          )}
        </div>

        {/* Editor Body */}
        <div className="px-4 py-2 w-full  ">
          <CustomEditorNew template={message} setTemplate={setMessage} />

          {selectedSignature?.html && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 relative group">
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
                  className="cursor-pointer text-gray-400 hover:text-red-500"
                  onClick={() => removeFile(f.name)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer Action Bar */}
        <div className={`p-4 flex items-center justify-between border-t border-gray-100`}>
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

      {!inline && (
        <div className="w-[30%] h-full z-[50] ">
          <AIReplySelectorNew
            threadId={emailDetail?.threadId}
            onSelect={setMessage}
            companyName={company}
          />
        </div>
      )}
    </div>
  );
}
