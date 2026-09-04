import { getAttachmentMeta } from "./AttachmentIcon";

export default function AttachmentChip({ attachment, compact = false }) {
  const { icon: Icon, color } = getAttachmentMeta(attachment.mimeType);

  return (
    <div
      className={
        compact
          ? `
            group inline-flex items-center h-6 gap-1 px-1.5
            border border-gray-200 rounded-full bg-white
            text-[10px] font-medium text-gray-700
            max-w-[120px] shadow-sm
            active:bg-gray-100
            transition-all duration-200 cursor-pointer
          `
          : `
            group inline-flex items-center h-8 gap-2 px-2
            border border-gray-200 rounded-xl bg-white
            text-sm font-medium text-gray-700
            max-w-[160px] shadow-sm
            hover:border-gray-300 hover:bg-gray-50
            transition-all duration-200 cursor-pointer
          `
      }
      title={attachment.filename}
    >
      <div className={`flex-shrink-0 flex items-center justify-center ${color}`}>
        <Icon size={compact ? 14 : 16} />
      </div>

      <span className="truncate flex-1 min-w-0">
        {attachment.filename}
      </span>

      {attachment.size && (
        <span className="text-[10px] text-gray-400 font-normal flex-shrink-0">
          {(attachment.size / 1024).toFixed(0)}KB
        </span>
      )}
    </div>
  );
}