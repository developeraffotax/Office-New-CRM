import { useState } from "react";
import { ACCEPT } from "../constants.js";
import Spinner from "../../shared/ui/Spinner.jsx";
import { UploadIcon } from "../../shared/ui/Icons.jsx";

export default function DocumentUploader({ uploading, onUpload, inputRef }) {
  const [dragging, setDragging] = useState(false);
  return (
    <div
      onDragOver={(e) => (e.preventDefault(), setDragging(true))}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => (e.preventDefault(), setDragging(false), onUpload(e.dataTransfer.files))}
      className={`relative rounded-2xl border-2 border-dashed p-6 text-center text-sm transition ${
        dragging ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-gray-50/70 hover:border-gray-300"
      }`}
    >
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm ring-1 ring-gray-200">
        {uploading ? <Spinner className="h-5 w-5" /> : <UploadIcon className="h-5 w-5" />}
      </span>
      <p className="mt-3 text-gray-600">
        {uploading ? "Uploading…" : "Drop files here, or"}
        {!uploading && (
          <button
            type="button"
            className="ml-1 font-medium text-orange-600 hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            choose files
          </button>
        )}
      </p>
      <p className="mt-2 text-xs text-gray-500">PDF, DOCX, TXT, MD, XLSX or CSV, up to 25 MB each</p>
      <p className="mt-1 text-xs text-gray-500">Spreadsheets become data the assistant can look up, filter and total.</p>
      <input ref={inputRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => onUpload(e.target.files)} />
    </div>
  );
}
