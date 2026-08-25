import { MdKeyboardArrowRight, MdAttachFile, MdEdit, MdMoreVert, MdDelete } from "react-icons/md";
import ToolbarButton from "./ToolbarButton";

export default function ComposeFooter({
  sending,
  onSend,
  fileInputRef,
  onFilesSelected,
  onAttachClick,
  signatureId,
  selectedSignature,
  signatureBtnRef,
  onToggleSignaturePopover,
  onDiscard,
}) {
  return (
    <div className="shrink-0 flex items-center justify-between px-3 py-2 border-t border-gray-100">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onSend}
          disabled={sending}
          className="flex items-center gap-1.5 bg-[#0b57d0] hover:bg-[#0a4bbd] disabled:opacity-60 text-white text-sm font-medium pl-4 pr-3 py-2 rounded-full transition-colors"
        >
          {sending ? "Sending..." : "Send"}
          {!sending && <MdKeyboardArrowRight size={16} />}
        </button>

        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFilesSelected} />
        <ToolbarButton onClick={onAttachClick} label="Attach files">
          <MdAttachFile size={17} />
        </ToolbarButton>

        <button
          ref={signatureBtnRef}
          type="button"
          onClick={onToggleSignaturePopover}
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
        onClick={onDiscard}
        className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
        aria-label="Discard draft"
      >
        <MdDelete size={17} />
      </button>
    </div>
  );
}
