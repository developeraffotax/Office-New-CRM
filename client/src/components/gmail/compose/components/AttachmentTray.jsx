import { MdInsertDriveFile, MdClose } from "react-icons/md";
import { formatBytes } from "../utils/formatBytes.js";

export default function AttachmentTray({ files, onRemoveFile }) {
  if (files.length === 0) return null;

  return (
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
            onClick={() => onRemoveFile(id)}
            className="ml-1 p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full"
            aria-label={`Remove ${file.name}`}
          >
            <MdClose size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
