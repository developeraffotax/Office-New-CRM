import { useState, useRef, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { useEmailCompose } from "./hooks/useEmailCompose";
import { useClickOutside } from "../../../utlis/useClickOutside";
import { useEscapeKey } from "../../../utlis/useEscapeKey";
import { useComposeUIState } from "./hooks/useComposeUIState";
 
import ComposeHeader from "./components/ComposeHeader";
import RecipientsFields from "./components/RecipientsFields";
import SubjectTemplateRow from "./components/SubjectTemplateRow";
import AttachmentTray from "./components/AttachmentTray";
import FormattingToolbar from "./components/FormattingToolbar";
import ComposeFooter from "./components/ComposeFooter";
import SignaturePopover from "./components/SignaturePopover";
import { useGetSignaturesQuery } from "../../../redux/api/signaturesApi";
import { useGetTemplatesQuery } from "../../../redux/api/templatesApi";

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

  const mainRef = useRef(null);
  const bodyRef = useRef(null);
  const fileInputRef = useRef(null);
  const signatureBtnRef = useRef(null);
  const signaturePopoverRef = useRef(null);

  // NOTE: preserved from the original — these fire straight on the raw
  // `onClose` prop, not `handleDiscard`, so clicking outside / Escape skips
  // the draft cleanup that the X button and Send both do. Was already the
  // case before this refactor; worth deciding if that's intentional.
  useClickOutside(mainRef, onClose);
  useEscapeKey(onClose);

  // Templates & signatures now live in RTK Query (see ./store) instead of
  // local useState + axios. ChatWindow's reply picker and this window share
  // one cached request per companyName — mount both, get one network call.
  const { data: templates = [], isError: templatesFailed } = useGetTemplatesQuery(companyName, {
    skip: !companyName,
  });
  const { data: signatures = [], isError: signaturesFailed } = useGetSignaturesQuery(companyName, {
    skip: !companyName,
  });

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
    () => signatures.map((sig) => ({ value: sig._id, label: sig.name, html: sig.html })),
    [signatures]
  );

  const selectedSignature = useMemo(() => {
    if (!signatureId || signatureOptions.length === 0) return null;
    return signatureOptions.find((option) => option.value === signatureId) ?? null;
  }, [signatureOptions, signatureId]);

  // Keep the contentEditable body in sync when the window opens or
  // un-minimizes. (The original had this effect duplicated verbatim twice —
  // collapsed to one here.)
  useEffect(() => {
    if (open && !ui.minimized && bodyRef.current) {
      if (bodyRef.current.innerHTML !== message) {
        bodyRef.current.innerHTML = message || "";
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ui.minimized]);

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

  if (!open) return null;

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
    e.target.value = ""; // allow re-selecting the same file(s)
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

  // FIX vs. original: also resets signatureId/signature and error, which
  // previously leaked into the next compose session because this component
  // stays mounted across `open` toggles.
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
        result.error.response?.data?.message || result.error.message || "Something went wrong while sending"
      );
    }
  };

  return (
    <div className={`${ui.fullscreen ? "fixed inset-16" : "fixed bottom-0 right-6"} z-50`} ref={mainRef}>
      <div
        className={`${
          ui.fullscreen ? "w-full h-full" : ui.minimized ? "w-[360px]" : "w-[660px] h-[760px]"
        } relative bg-white rounded-t-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden`}
      >
        <ComposeHeader
          subject={subject}
          minimized={ui.minimized}
          fullscreen={ui.fullscreen}
          onToggleMinimize={ui.toggleMinimized}
          onToggleFullscreen={ui.toggleFullscreen}
          onClose={handleDiscard}
        />

        {!ui.minimized && (
          <>
            <div className="border-b border-gray-200 shrink-0">
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

            {/* Body — the only scrollable region */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
              <div
                ref={bodyRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleBodyInput}
                className="min-h-[140px] text-sm text-gray-800 outline-none"
                data-placeholder="Compose your message..."
              />
            </div>

            <AttachmentTray files={files} onRemoveFile={removeFile} />

            {error && (
              <div className="shrink-0 px-4 py-1.5 text-xs text-red-600 bg-red-50 border-t border-red-100">
                {error}
              </div>
            )}

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
          </>
        )}
      </div>

      {/* Sibling of the card, so overflow-hidden can't clip it */}
      {ui.signaturePopoverOpen && !ui.minimized && (
        <SignaturePopover
          ref={signaturePopoverRef}
          signatureId={signatureId}
          signatureOptions={signatureOptions}
          selectedSignature={selectedSignature}
          onSelect={handleSelectSignature}
          onClose={ui.closeSignaturePopover}
        />
      )}
    </div>
  );
}
