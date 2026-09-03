import React, { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { useWhatsappModalActions } from "../../context/WhatsappModalsContext";

export default function LeadButton({ chat, handleUpdate, onViewLead }) {
  const [copied, setCopied] = useState(false);

  const { openLead } = useWhatsappModalActions();

  const handleCreateLead = (e) => {
    e.stopPropagation();

    openLead({
      _id: chat._id,
      companyName: chat.companyName,
      form: {
        clientName: chat?.profileName || "",
        phoneNumber: chat?.phone || "",
      },
      onUpdate: handleUpdate,
    });
  };

  const handleViewLead = (e) => {
    e.stopPropagation();

    // Copy lead reference to clipboard if available
    const leadText = chat.leadId?.leadRef
      ? `L-${chat.leadId.leadRef}`
      : "Lead Linked";

    navigator.clipboard.writeText(leadText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

    if (onViewLead) {
      onViewLead(chat.leadId);
    }
  };

  // Existing linked lead
  if (chat?.leadId) {
    return (
      <button
        type="button"
        onClick={handleViewLead}
        title={copied ? "Copied!" : "Click to copy lead ID & view lead"}
        className={`w-7 h-7 flex items-center justify-center rounded-lg shadow-2xs active:scale-[0.98] transition-all cursor-pointer ${
          copied
            ? "bg-slate-800 text-emerald-400"
            : "bg-gray-200 hover:bg-gray-300 text-slate-800"
        }`}
      >
        {copied ? <FiCheck className="w-4 h-4 shrink-0" /> : "L"}
      </button>
    );
  }

  // No lead linked — create one
  return (
    <button
      type="button"
      title="Create Lead"
      onClick={handleCreateLead}
      className="w-7 h-7 flex items-center justify-center text-slate-500 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 hover:text-emerald-700 hover:border-emerald-200 active:scale-[0.98] transition-all cursor-pointer"
    >
      L
    </button>
  );
}
