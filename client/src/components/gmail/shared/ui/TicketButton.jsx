import React, { useState } from "react";
import { useMailModalActions } from "../../context/MailModalsContext";
import { getMyEamilFromCompanyName, parseEmail } from "../../utils/utils";

export default function TicketButton({
  thread,
 
  handleUpdateThread,
  onViewTicket,
 
}) {
  const [copied, setCopied] = useState(false);

  const { setTicket } = useMailModalActions();

  const handleCreateTicket = (e) => {
    e.stopPropagation();

    const client = thread.participants.find(
      (p) => p.email !== parseEmail(getMyEamilFromCompanyName(thread?.companyName)),
    );

    setTicket({
      _id: thread._id,
      isOpen: true,
      form: {
        subject: thread.subject || "",
        clientName: client?.name || "",
        email: client?.email || "",
        mailThreadId: thread.threadId,
      },

      onUpdate: handleUpdateThread,
    });
  };

  const handleViewTicket = (e) => {
    e.stopPropagation();

    // Copy ticket reference to clipboard if available
    const ticketText = thread.ticketId?.ticketRef
      ? `T-${thread.ticketId.ticketRef}`
      : "Ticket Linked";

    navigator.clipboard.writeText(ticketText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

    if (onViewTicket) {
      onViewTicket(thread.ticketId);
    }
  };

  // Existing linked ticket
  if (thread?.ticketId) {
    return (
      <button
        type="button"
        onClick={handleViewTicket}
        title={copied ? "Copied!" : "Click to copy ticket ID & view ticket"}
        className={`w-24 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg shadow-2xs active:scale-[0.98] transition-all cursor-pointer ${
          copied
            ? "bg-slate-800 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-black/90"
        }`}
      >
        {copied ? (
          <>
            {/* Checkmark Icon for Copied State */}
            <svg
              className="w-3.5 h-3.5 text-blue-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="truncate">Copied!</span>
          </>
        ) : (
          <>
            {/* Copy / Link Icon */}
            <svg
              className="w-3.5 h-3.5 text-black shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="truncate">
              {thread.ticketId?.ticketRef
                ? `T-${thread.ticketId.ticketRef}`
                : "Ticket Linked"}
            </span>
          </>
        )}
      </button>
    );
  }

  // No ticket linked — create one
  return (
    <button
      type="button"
      title="Create Ticket"
      onClick={handleCreateTicket}
      className="w-24 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-lg shadow-2xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 active:scale-[0.98] transition-all cursor-pointer"
    >
      {/* Plus Icon for Creation */}
      <svg
        className="w-3.5 h-3.5 text-slate-400 shrink-0 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
      <span className="truncate">Ticket</span>
    </button>
  );
}
