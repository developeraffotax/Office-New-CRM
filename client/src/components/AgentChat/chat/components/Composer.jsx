import { useEffect, useRef } from "react";
import { ACCEPTED_FILES } from "../constants.js";
import Spinner from "../../shared/ui/Spinner.jsx";
import { ArrowUpIcon, FileIcon, PaperclipIcon, StopIcon, XIcon } from "../../shared/ui/Icons.jsx";

export default function Composer({ input, onInput, onSend, busy, onStop, attachments, onRemoveAttachment, uploading, fileRef, onAttach }) {
  const taRef = useRef(null);

  // Grow the textarea with its content (up to max height).
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  return (
    <form onSubmit={(e) => (e.preventDefault(), onSend(input))} className="px-4 pb-4 pt-2">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-lg shadow-gray-200/60 transition focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100">
          {(attachments.length > 0 || uploading) && (
            <div className="flex flex-wrap gap-2 px-4 pt-3">
              {attachments.map((a) => (
                <span key={a.id} className="inline-flex max-w-full items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 py-1.5 pl-2.5 pr-1.5 text-xs text-orange-900">
                  <FileIcon className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  <span className="truncate">{a.filename}{a.summary ? ` · ${a.summary}` : ""}</span>
                  <button type="button" aria-label={`Remove ${a.filename}`} className="rounded-md p-0.5 text-orange-500 transition hover:bg-orange-100 hover:text-orange-800" onClick={() => onRemoveAttachment(a.id)}>
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {uploading && (
                <span className="inline-flex animate-pulse items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500" role="status">
                  <Spinner className="h-3.5 w-3.5 text-orange-500" /> Reading file…
                </span>
              )}
            </div>
          )}

          <textarea
            ref={taRef}
            rows={1}
            value={input}
            onChange={(e) => onInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(input); } }}
            placeholder={attachments.length ? "What should I do with the file? e.g. Fill in the fees from our stored data" : "Ask a question…"}
            aria-label="Message"
            className="block max-h-40 w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-[15px] leading-6 text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />

          <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1">
            <input ref={fileRef} type="file" accept={ACCEPTED_FILES} className="hidden" onChange={(e) => onAttach(e.target.files?.[0])} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || busy}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? <Spinner /> : <PaperclipIcon />}
              {uploading ? "Reading…" : "Attach file"}
            </button>

            {busy ? (
              <button type="button" onClick={onStop} aria-label="Stop generating" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-300">
                <StopIcon className="h-4 w-4" />
              </button>
            ) : (
              <button type="submit" aria-label="Send message" disabled={!input.trim()} className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none">
                <ArrowUpIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-gray-400">Enter to send · Shift + Enter for a new line · Check important answers before acting on them</p>
      </div>
    </form>
  );
}
