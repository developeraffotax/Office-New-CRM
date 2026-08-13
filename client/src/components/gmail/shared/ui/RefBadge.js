// components/ui/RefBadge.jsx
import { useState } from "react";
import { LuCopy, LuCheck } from "react-icons/lu";
import toast from "react-hot-toast";
import { formatRef } from "../../../../utlis/formatRef";

export default function RefBadge({ number, prefix = "E", className = "" }) {
  const [copied, setCopied] = useState(false);

  if (!number) return null;

  const cellValue = formatRef(prefix, number);

  const handleCopy = (e) => {
    e.stopPropagation(); // prevent triggering a parent row's onClick, if this ever sits inside one

    navigator.clipboard.writeText(cellValue);
    toast.success(`Copied ${cellValue}`);

    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy"
      className={`group inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 ${className}`}
    >
      <span className="font-google tracking-wide">{cellValue}</span>
      {copied ? (
        <LuCheck className="size-3 text-green-500" />
      ) : (
        <LuCopy className="size-3 text-gray-400 transition-colors group-hover:text-blue-500" />
      )}
    </button>
  );
}