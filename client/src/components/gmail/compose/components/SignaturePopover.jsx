import { forwardRef } from "react";
import { MdClose } from "react-icons/md";
import CustomSelect from "../../../../utlis/CustomSelect"; // adjust to your actual path

const SignaturePopover = forwardRef(function SignaturePopover(
  { signatureId, signatureOptions, selectedSignature, onSelect, onClose },
  ref
) {
  return (
    <div
      ref={ref}
      className="absolute bottom-14 left-0 -translate-x-[calc(100%+12px)] w-72 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-10"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Signature</span>
        <button
          type="button"
          onClick={onClose}
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
          onChange={onSelect}
        />

        {selectedSignature?.html ? (
          <div className="mt-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preview</span>
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
  );
});

export default SignaturePopover;
