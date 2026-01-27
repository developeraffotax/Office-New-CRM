import { getAttachmentMeta } from "./AttachmentIcon";

export default function AttachmentChip({ attachment }) {
  const { icon: Icon, color } = getAttachmentMeta(attachment.mimeType);

  return (
    <div
      className="
        group flex items-center gap-1.5 px-2.5 py-1
        border rounded-full bg-white
        text-xs max-w-[160px]
        hover:shadow-sm hover:bg-gray-50
        transition cursor-pointer
      "
      title={attachment.filename}
    >
      <Icon className={`${color}  text-sm`} />

      <span className="truncate">
        {attachment.filename}
      </span>

      {attachment.size && (
        <span className="text-[10px] text-gray-400 ml-1 hidden group-hover:inline">
          {(attachment.size / 1024).toFixed(0)}kb
        </span>
      )}
    </div>
  );
}
