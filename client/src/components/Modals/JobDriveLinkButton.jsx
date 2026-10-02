import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FaGoogleDrive } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

const isGoogleLink = (url) =>
  /^https:\/\/(docs|drive|sheets|slides)\.google\.com\/.+/i.test(url);

function DriveLinkModal({ jobName, initialValue, onSave, onClose }) {
  const [value, setValue] = useState(initialValue || "");
  const [error, setError] = useState("");

  const handleSave = () => {
    const link = value.trim();
    if (link && !isGoogleLink(link)) {
      return setError("Enter a valid Google Drive / Docs link");
    }
    onSave(link);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-[480px] rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-lg font-medium text-[#254e7f]">
          {jobName} – Google Drive Link
        </h3>

        <input
          type="url"
          autoFocus
          placeholder="https://docs.google.com/..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-orange-500"
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-[#254e7f] px-4 py-2 text-white hover:bg-orange-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function JobDriveLinkButton({ jobName, enabled, link, onSave }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button" // important: we're inside a <form>
        disabled={!enabled}
        onClick={() => setOpen(true)}
        title={enabled ? "Add Google Drive link" : "Select the job first"}
        className={`flex items-center gap-1 rounded-md px-3 py-[7px] text-sm text-white transition
          ${enabled ? (link ? "bg-green-600 hover:bg-green-700" : "bg-[#254e7f] hover:bg-orange-500") : "bg-gray-400 cursor-not-allowed"}`}
      >
        <FaGoogleDrive />
        {link ? "Edit Link" : "Add Link"}
      </button>

      {enabled && link && (
        <a href={link} target="_blank" rel="noreferrer" title="Open link" className="text-[#254e7f] hover:text-orange-500">
          <FiExternalLink size={18} />
        </a>
      )}

      {open && (
        <DriveLinkModal
          jobName={jobName}
          initialValue={link}
          onSave={onSave}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}