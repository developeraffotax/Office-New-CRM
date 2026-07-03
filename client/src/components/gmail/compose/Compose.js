import { useState, useRef, useMemo, useEffect } from "react";
import {
  MdClose,
  MdRemove,
  MdOpenInFull,
  MdCloseFullscreen,
  MdAttachFile,
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdInsertLink,
  MdFormatClear,
  MdKeyboardArrowDown,
  MdDelete,
  MdMoreVert,
  MdInsertDriveFile,
  MdEdit,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { useEmailCompose } from "../hooks/useEmailCompose.js";
import EmailChipInput from "./EmailChipInput.js";
import axios from "axios";
import toast from "react-hot-toast";
import CustomSelect from "../../../utlis/CustomSelect.js";
import { useClickOutside } from "../../../utlis/useClickOutside.js";
import { useEscapeKey } from "../../../utlis/useEscapeKey.js";

/**
 * Gmail-style compose window.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - companyName: string (passed straight through to the backend)
 *  - onSent: (data) => void
 */
export default function ComposeWindow({ open, onClose, companyName, onSent }) {
  const [minimized, setMinimized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [signaturePopoverOpen, setSignaturePopoverOpen] = useState(false);

  const {
    to,
    setTo,
    cc,
    setCc,
    bcc,
    setBcc,
    subject,
    setSubject,
    message,
    setMessage,
    files,
    addFiles,
    removeFile,
    send,
    loading: sending,
    setSignature,
  } = useEmailCompose({ companyName });

  
  const [error, setError] = useState("");
  
  const mainRef = useRef(null);
  const bodyRef = useRef(null);
  const fileInputRef = useRef(null);
  const signatureBtnRef = useRef(null);
  const signaturePopoverRef = useRef(null);

  useClickOutside(mainRef, onClose)
  useEscapeKey(onClose)

  const [signatures, setSignatures] = useState([]);
  const [signatureId, setSignatureId] = useState("");

  const getAllSignatures = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/signatures`,
        { params: { companyName } }
      );
      setSignatures(data?.data || []);
    } catch (error) {
      toast.error("Failed to load signatures");
    }
  };

  useEffect(() => {
    getAllSignatures();
  }, [companyName]);

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

 
useEffect(() => {
  if (open && !minimized && bodyRef.current) {
    if (bodyRef.current.innerHTML !== message) {
      bodyRef.current.innerHTML = message || "";
    }
  }
}, [open, minimized]);




  // close signature popover on outside click
  useEffect(() => {
    if (!signaturePopoverOpen) return;
    const handleClick = (e) => {
      if (
        signaturePopoverRef.current?.contains(e.target) ||
        signatureBtnRef.current?.contains(e.target)
      )
        return;
      setSignaturePopoverOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [signaturePopoverOpen]);

  if (!open) return null;

  // ---------- formatting toolbar ----------
  const exec = (command, value = null) => {
    bodyRef.current?.focus();
    document.execCommand(command, false, value);
    setMessage(bodyRef.current?.innerHTML || "");
  };

  const handleBodyInput = () => {
    setMessage(bodyRef.current?.innerHTML || "");
  };

  const handleInsertLink = () => {
    const url = window.prompt("Paste a URL");
    if (url) exec("createLink", url);
  };

  // ---------- attachments ----------
  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFilesSelected = (e) => {
    addFiles(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file(s)
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ---------- discard ----------
  const handleDiscard = () => {
    setShowCc(false);
    setShowBcc(false);
    setSignaturePopoverOpen(false);
    if (bodyRef.current) bodyRef.current.innerHTML = "";
    onClose?.();
  };

  // ---------- send ----------
  const handleSend = async () => {
    setError("");
    const html = bodyRef.current?.innerHTML || "";
    const result = await send({ html });

    if (result.success) {
      onSent?.(result.data);
      handleDiscard();
    } else if (result.error) {
      setError(
        result.error.response?.data?.message ||
          result.error.message ||
          "Something went wrong while sending"
      );
    }
  };

  return (
    <div className={`${fullscreen ? "fixed inset-16" : "fixed bottom-0 right-6"} z-50`} ref={mainRef}>
      <div
        className={`${
          fullscreen ? "w-full h-full" : minimized ? "w-[360px]" : "w-[660px] h-[760px]"
        } relative bg-white rounded-t-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-2.5 bg-[#404040] text-white cursor-pointer select-none rounded-t-lg shrink-0"
          onClick={() => minimized && setMinimized(false)}
        >
          <span className="text-sm font-medium truncate">
            {subject.trim() ? subject : "New Message"}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMinimized((m) => !m);
              }}
              className="p-1 hover:bg-white/10 rounded"
              aria-label="Minimize"
            >
              <MdRemove size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreen((f) => !f);
                setMinimized(false);
              }}
              className="p-1 hover:bg-white/10 rounded"
              aria-label="Toggle fullscreen"
            >
              {fullscreen ? <MdCloseFullscreen size={14} /> : <MdOpenInFull size={14} />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDiscard();
              }}
              className="p-1 hover:bg-white/10 rounded"
              aria-label="Close"
            >
              <MdClose size={16} />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Recipients */}
            <div className="border-b border-gray-200 shrink-0">
              <div className="flex items-center px-4 py-2 border-b border-gray-100">
                <EmailChipInput label="To" values={to} setValues={setTo} />
                <div className="flex gap-2 text-sm text-gray-500">
                  {!showCc && (
                    <button
                      type="button"
                      onClick={() => setShowCc(true)}
                      className="hover:text-gray-700"
                    >
                      Cc
                    </button>
                  )}
                  {!showBcc && (
                    <button
                      type="button"
                      onClick={() => setShowBcc(true)}
                      className="hover:text-gray-700"
                    >
                      Bcc
                    </button>
                  )}
                </div>
              </div>

              {showCc && (
                <div className="flex items-center px-4 py-2 border-b border-gray-100">
                  <EmailChipInput label="Cc" values={cc} setValues={setCc} />
                </div>
              )}

              {showBcc && (
                <div className="flex items-center px-4 py-2 border-b border-gray-100">
                  <EmailChipInput label="Bcc" values={bcc} setValues={setBcc} />
                </div>
              )}

              <div className="flex items-center px-4 py-2">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="flex-1 text-sm outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Body — the only scrollable region */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
              <div
                ref={bodyRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleBodyInput}
                // dangerouslySetInnerHTML={{ __html: "" }}
                className="min-h-[140px] text-sm text-gray-800 outline-none"
                data-placeholder="Compose your message..."
              />
            </div>

            {/* Attachment tray — Gmail-style, pinned below body, never scrolls away */}
            {files.length > 0 && (
              <div className="shrink-0 px-4 py-2 border-t border-gray-100 flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                {files.map(({ id, file }) => (
                  <div
                    key={id}
                    className="group flex items-center gap-2 border border-gray-200 rounded-lg pl-2 pr-1 py-1.5 text-xs bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center shrink-0">
                      <MdInsertDriveFile size={13} className="text-gray-500" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="truncate max-w-[140px] text-gray-700">{file.name}</span>
                      <span className="text-gray-400 text-[10px]">{formatBytes(file.size)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(id)}
                      className="ml-1 p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full"
                      aria-label={`Remove ${file.name}`}
                    >
                      <MdClose size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="shrink-0 px-4 py-1.5 text-xs text-red-600 bg-red-50 border-t border-red-100">
                {error}
              </div>
            )}

            {/* Formatting toolbar */}
            <div className="shrink-0 flex items-center gap-0.5 px-3 py-1.5 border-t border-gray-100 text-gray-600">
              <ToolbarButton onClick={() => exec("bold")} label="Bold">
                <MdFormatBold size={15} />
              </ToolbarButton>
              <ToolbarButton onClick={() => exec("italic")} label="Italic">
                <MdFormatItalic size={15} />
              </ToolbarButton>
              <ToolbarButton onClick={() => exec("underline")} label="Underline">
                <MdFormatUnderlined size={15} />
              </ToolbarButton>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <ToolbarButton onClick={handleInsertLink} label="Insert link">
                <MdInsertLink size={15} />
              </ToolbarButton>
              <ToolbarButton onClick={() => exec("insertUnorderedList")} label="Bulleted list">
                <MdFormatListBulleted size={15} />
              </ToolbarButton>
              <ToolbarButton onClick={() => exec("insertOrderedList")} label="Numbered list">
                <MdFormatListNumbered size={15} />
              </ToolbarButton>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <ToolbarButton onClick={() => exec("removeFormat")} label="Clear formatting">
                <MdFormatClear size={15} />
              </ToolbarButton>
            </div>

            {/* Footer actions */}
            <div className="shrink-0 flex items-center justify-between px-3 py-2 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  className="flex items-center gap-1.5 bg-[#0b57d0] hover:bg-[#0a4bbd] disabled:opacity-60 text-white text-sm font-medium pl-4 pr-3 py-2 rounded-full transition-colors"
                >
                  {sending ? "Sending..." : "Send"}
                  {!sending && <MdKeyboardArrowRight size={16} />}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFilesSelected}
                />
                <ToolbarButton onClick={handleAttachClick} label="Attach files">
                  <MdAttachFile size={17} />
                </ToolbarButton>

                {/* Signature trigger — small pill button, opens the outside popover */}
                <button
                  ref={signatureBtnRef}
                  type="button"
                  onClick={() => setSignaturePopoverOpen((o) => !o)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium border transition-colors ${
                    signatureId
                      ? "border-[#0b57d0]/30 bg-[#0b57d0]/5 text-[#0b57d0]"
                      : "border-transparent text-gray-500 hover:bg-gray-100"
                  }`}
                  aria-label="Signature"
                >
                  <MdEdit size={14} />
                  {selectedSignature ? selectedSignature.label : "Signature"}
                </button>

                <ToolbarButton label="More options">
                  <MdMoreVert size={17} />
                </ToolbarButton>
              </div>

              <button
                type="button"
                onClick={handleDiscard}
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                aria-label="Discard draft"
              >
                <MdDelete size={17} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* -------- Signature popover: sibling of the card, so overflow-hidden can't clip it -------- */}
      {signaturePopoverOpen && !minimized && (
        <div
          ref={signaturePopoverRef}
          className="absolute bottom-14 left-0 -translate-x-[calc(100%+12px)] w-72 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-10"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Signature
            </span>
            <button
              type="button"
              onClick={() => setSignaturePopoverOpen(false)}
              className="p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded"
              aria-label="Close signature panel"
            >
              <MdClose size={14} />
            </button>
          </div>

          <div className="p-3 h-[600px]">
            <CustomSelect
              value={signatureId}
              options={signatureOptions}
              placeholder="Select signature..."
              onChange={(selectedOption) => {
                setSignatureId(selectedOption?.value || "");
                setSignature(selectedOption?.html || "");
              }}
              className="  "
            />

            {selectedSignature?.html ? (
              <div className="mt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Preview
                </span>
                <div
                  className="mt-1 text-xs text-gray-700 bg-slate-50 rounded-lg border border-slate-100 p-2.5 max-h-64 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: selectedSignature.html }}
                />
              </div>
            ) : (
              <p className="mt-3 text-xs text-gray-400 italic">
                No signature selected — pick one above to append it to your message.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="p-1.5 hover:bg-gray-100 rounded"
    >
      {children}
    </button>
  );
}