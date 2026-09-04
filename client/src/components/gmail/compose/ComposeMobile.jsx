import { useState, useRef, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { MdClose, MdKeyboardArrowDown } from "react-icons/md";

import { useEmailCompose } from "./hooks/useEmailCompose";
import { useComposeUIState } from "./hooks/useComposeUIState";
import { useGetSignaturesQuery } from "../../../redux/api/signaturesApi";
import { useGetTemplatesQuery } from "../../../redux/api/templatesApi";

import RecipientsFields from "./components/RecipientsFields";
import SubjectTemplateRow from "./components/SubjectTemplateRow";
import AttachmentTray from "./components/AttachmentTray";
import FormattingToolbar from "./components/FormattingToolbar";
import ComposeFooter from "./components/ComposeFooter";
import SignaturePopover from "./components/SignaturePopover";

/**
 * Mobile compose — full-width bottom sheet.
 *
 * Same props as ComposeWindow:
 *  - open: boolean
 *  - onClose: () => void
 *  - companyName: string
 *  - onSent: (data) => void
 */
export default function ComposeMobile({ open, onClose, companyName, onSent }) {
  const ui = useComposeUIState();
  const [error, setError] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [signatureId, setSignatureId] = useState("");

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

  const bodyRef = useRef(null);
  const fileInputRef = useRef(null);
  const signatureBtnRef = useRef(null);
  const signaturePopoverRef = useRef(null);
  const sheetRef = useRef(null);

  const { data: templates = [], isError: templatesFailed } = useGetTemplatesQuery(
    companyName,
    { skip: !companyName }
  );
  const { data: signatures = [], isError: signaturesFailed } = useGetSignaturesQuery(
    companyName,
    { skip: !companyName }
  );

  useEffect(() => {
    if (templatesFailed) toast.error("Failed to load templates");
  }, [templatesFailed]);

  useEffect(() => {
    if (signaturesFailed) toast.error("Failed to load signatures");
  }, [signaturesFailed]);

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

  // Sync contentEditable when sheet opens
  useEffect(() => {
    if (open && bodyRef.current) {
      if (bodyRef.current.innerHTML !== message) {
        bodyRef.current.innerHTML = message || "";
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close signature popover on outside click
  useEffect(() => {
    if (!ui.signaturePopoverOpen) return;
    const handleClick = (e) => {
      if (
        signaturePopoverRef.current?.contains(e.target) ||
        signatureBtnRef.current?.contains(e.target)
      )
        return;
      ui.closeSignaturePopover();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.signaturePopoverOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const exec = (command, value = null) => {
    bodyRef.current?.focus();
    document.execCommand(command, false, value);
    setMessage(bodyRef.current?.innerHTML || "");
  };

  const handleBodyInput = () => setMessage(bodyRef.current?.innerHTML || "");

  const handleInsertLink = () => {
    const url = window.prompt("Paste a URL");
    if (url) exec("createLink", url);
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFilesSelected = (e) => {
    addFiles(e.target.files || []);
    e.target.value = "";
  };

  const handleSelectTemplate = (opt) => {
    setTemplateId(opt?.value || "");
    const html = opt?.description || "";
    setMessage(html);
    if (bodyRef.current) bodyRef.current.innerHTML = html;
  };

  const handleSelectSignature = (opt) => {
    setSignatureId(opt?.value || "");
    setSignature(opt?.html || "");
  };

  const handleDiscard = () => {
    ui.reset();
    setTemplateId("");
    setSignatureId("");
    setSignature("");
    setError("");
    setMessage("");
    if (bodyRef.current) bodyRef.current.innerHTML = "";
    onClose?.();
  };

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
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleDiscard}
      />

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        className={clsx(
          "fixed inset-x-0 bottom-0 z-[70] flex flex-col bg-white rounded-t-2xl shadow-2xl",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "h-[92dvh] max-h-[92dvh]",
          open ? "translate-y-0" : "translate-y-full pointer-events-none"
        )}
      >
        {/* Drag handle + header */}
        <div className="shrink-0 border-b border-gray-200">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          <div className="flex items-center justify-between px-4 pb-3">
            <button
              type="button"
              onClick={handleDiscard}
              className="p-2 -ml-2 rounded-full active:bg-gray-100 text-gray-600"
              aria-label="Close"
            >
              <MdClose size={22} />
            </button>

            <span className="text-sm font-semibold text-gray-900 truncate max-w-[60%]">
              {subject.trim() ? subject : "New Message"}
            </span>

            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="text-sm font-semibold text-[#0b57d0] disabled:opacity-50 px-2 py-1"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="border-b border-gray-100">
            <RecipientsFields
              to={to}
              setTo={setTo}
              cc={cc}
              setCc={setCc}
              bcc={bcc}
              setBcc={setBcc}
              showCc={ui.showCc}
              showBcc={ui.showBcc}
              onShowCc={ui.openCc}
              onShowBcc={ui.openBcc}
            />
            <SubjectTemplateRow
              subject={subject}
              setSubject={setSubject}
              templateId={templateId}
              templateOptions={templateOptions}
              onSelectTemplate={handleSelectTemplate}
            />
          </div>

          {/* Body */}
          <div className="px-4 py-3 min-h-[180px]">
            <div
              ref={bodyRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleBodyInput}
              className="min-h-[160px] text-[15px] text-gray-800 outline-none leading-relaxed"
              data-placeholder="Compose your message..."
            />
          </div>

          <AttachmentTray files={files} onRemoveFile={removeFile} />

          {error && (
            <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">
              {error}
            </div>
          )}
        </div>

        {/* Sticky bottom chrome */}
        <div className="shrink-0 border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)]">
          <FormattingToolbar onExec={exec} onInsertLink={handleInsertLink} />

          <ComposeFooter
            sending={sending}
            onSend={handleSend}
            fileInputRef={fileInputRef}
            onFilesSelected={handleFilesSelected}
            onAttachClick={handleAttachClick}
            signatureId={signatureId}
            selectedSignature={selectedSignature}
            signatureBtnRef={signatureBtnRef}
            onToggleSignaturePopover={ui.toggleSignaturePopover}
            onDiscard={handleDiscard}
          />
        </div>

        {/* Signature popover — repositioned for mobile */}
        {ui.signaturePopoverOpen && (
          <div className="absolute inset-x-0 bottom-0 z-20">
            {/* Mobile-friendly sheet for signature instead of desktop popover position */}
            <div
              className="fixed inset-0 bg-black/30 z-20"
              onClick={ui.closeSignaturePopover}
            />
            <div
              ref={signaturePopoverRef}
              className="fixed inset-x-0 bottom-0 z-30 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-800">Signature</span>
                <button
                  type="button"
                  onClick={ui.closeSignaturePopover}
                  className="p-1.5 rounded-full active:bg-gray-100 text-gray-500"
                >
                  <MdKeyboardArrowDown size={22} />
                </button>
              </div>

              {/* Reuse SignaturePopover content by rendering options here,
                  or keep SignaturePopover if you adjust its positioning.
                  For simplicity, inline a mobile-friendly list: */}
              <div className="p-3 overflow-y-auto flex-1">
                <SignaturePopover
                  ref={signaturePopoverRef}
                  signatureId={signatureId}
                  signatureOptions={signatureOptions}
                  selectedSignature={selectedSignature}
                  onSelect={(opt) => {
                    handleSelectSignature(opt);
                    ui.closeSignaturePopover();
                  }}
                  onClose={ui.closeSignaturePopover}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}