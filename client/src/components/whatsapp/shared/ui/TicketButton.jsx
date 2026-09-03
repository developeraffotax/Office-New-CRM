import React, { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { useWhatsappModalActions } from "../../context/WhatsappModalsContext";

export default function TicketButton({ chat, handleUpdate, onViewTicket }) {
  const [copied, setCopied] = useState(false);

  const { openTicket } = useWhatsappModalActions();

  const handleCreateTicket = (e) => {
    e.stopPropagation();

    openTicket({
      _id: chat._id,
      companyName: chat.companyName,
      form: {
        clientName: chat?.profileName || "",
        phoneNumber: chat?.phone || "",
      },
      onUpdate: handleUpdate,
    });
  };

  const handleViewTicket = (e) => {
    e.stopPropagation();

    // Copy ticket reference to clipboard if available
    const ticketText = chat.ticketId?.ticketRef
      ? `T-${chat.ticketId.ticketRef}`
      : "Ticket Linked";

    navigator.clipboard.writeText(ticketText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

    if (onViewTicket) {
      onViewTicket(chat.ticketId);
    }
  };

  // Existing linked ticket
  if (chat?.ticketId) {
    return (
      <button
        type="button"
        onClick={handleViewTicket}
        title={copied ? "Copied!" : "Click to copy ticket ID & view ticket"}
        className={`w-7 h-7 flex items-center justify-center rounded-lg shadow-2xs active:scale-[0.98] transition-all cursor-pointer ${
          copied
            ? "bg-slate-800 text-blue-400"
            : "bg-gray-200 hover:bg-gray-300 text-slate-800"
        }`}
      >
        {copied ? <FiCheck className="w-4 h-4 shrink-0" /> : "T"}
      </button>
    );
  }

  // No ticket linked — create one
  return (
    <button
      type="button"
      title="Create Ticket"
      onClick={handleCreateTicket}
      className="w-7 h-7 flex items-center justify-center text-slate-500 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 active:scale-[0.98] transition-all cursor-pointer"
    >
      T
    </button>
  );
}
