import { MdRemove, MdOpenInFull, MdCloseFullscreen, MdClose } from "react-icons/md";

export default function ComposeHeader({
  subject,
  minimized,
  fullscreen,
  onToggleMinimize,
  onToggleFullscreen,
  onClose,
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 bg-[#404040] text-white cursor-pointer select-none rounded-t-lg shrink-0"
      onClick={() => minimized && onToggleMinimize()}
    >
      <span className="text-sm font-medium truncate">
        {subject.trim() ? subject : "New Message"}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMinimize();
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
            onToggleFullscreen();
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
            onClose();
          }}
          className="p-1 hover:bg-white/10 rounded"
          aria-label="Close"
        >
          <MdClose size={16} />
        </button>
      </div>
    </div>
  );
}
