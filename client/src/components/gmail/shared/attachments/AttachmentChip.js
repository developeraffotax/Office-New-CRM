import { getAttachmentMeta } from "./AttachmentIcon";

export default function AttachmentChip({ attachment }) {
  const { icon: Icon, color } = getAttachmentMeta(attachment.mimeType);

  return (
    <div
      className="
        group inline-flex items-center h-8 gap-2 px-2
        border border-gray-200 rounded-xl bg-white
        text-sm font-medium text-gray-700
        max-w-[160px] shadow-sm
        hover:border-gray-300 hover:bg-gray-50
        transition-all duration-200 cursor-pointer
      "
      title={attachment.filename}
    >
      {/* Icon Wrapper ensures same size every time */}
      <div className={`flex-shrink-0 flex items-center justify-center ${color}`}>
        <Icon size={16} /> 
      </div>

      <span className="truncate flex-1">
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