export function DeleteConfirm({ sig, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/85 z-[1000] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white border border-red-950 rounded-[14px] p-7 max-w-[400px] w-full mx-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="text-[15px] font-sans font-bold text-red-500 mb-2">
          Delete signature?
        </div>
        <div className="text-[13px] text-[#666] font-mono mb-6 leading-relaxed">
          <span className="text-[#999]">"{sig.name}"</span> will be permanently removed.
        </div>
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onClose}
            className="bg-transparent border border-[#e4e2dc] rounded-[9px] text-[#555] cursor-pointer font-mono text-[13px] px-[18px] py-[9px]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-950 text-red-300 border border-red-800 rounded-[9px] px-[18px] py-[9px] cursor-pointer font-mono text-[13px] hover:bg-red-900 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
