import React, { useState } from "react";
import { useMailModalActions } from "../../context/MailModalsContext";
import { getMyEamilFromCompanyName, parseEmail } from "../../utils/utils";
import {  extractQuoteDetails } from "../../utils/extractQuoteDetails";

export default function LeadButton({
  thread,
 
  handleUpdateThread,
  onViewLead,

  firstMessageForPrefilling = {}
 
}) {
  const [copied, setCopied] = useState(false);

  const { setLead } = useMailModalActions();


  console.log("firstMessageForPrefilling thread:", firstMessageForPrefilling);
  console.log("threadg thread:", thread);

 

const handleCreateLead = (e) => {
  e.stopPropagation();

  const myEmail = parseEmail(getMyEamilFromCompanyName(thread?.companyName));
  const client = thread.participants?.find((p) => p.email !== myEmail);

  let form = {
    clientName: client?.name || "",
    email: client?.email || "",
    phone: "",
  };

  // Try to extract from the quote email
  const body = firstMessageForPrefilling?.payload?.body?.data || "";
  const quoteData = extractQuoteDetails(body, thread?.subject);

  if (quoteData) {
    form = {
      ...form,
      clientName: quoteData.name || form.clientName,
      email: quoteData.email || form.email,
      phone: quoteData.phone || form.phone,
    };
  }

  setLead({
    _id: thread._id,
    isOpen: true,
    form,
    onUpdate: handleUpdateThread,
  });
};

  const handleViewLead = (e) => {
    e.stopPropagation();

    // Copy lead reference to clipboard if available
    const leadText = thread.leadId?.leadRef
      ? `L-${thread.leadId.leadRef}`
      : "Lead Linked";

    navigator.clipboard.writeText(leadText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

    if (onViewLead) {
      onViewLead(thread.leadId);
    }
  };

  // Existing linked lead
  if (thread?.leadId) {
    return (
      <button
        type="button"
        onClick={handleViewLead}
        title={copied ? "Copied!" : "Click to copy lead ID & view lead"}
        className={`w-24 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg shadow-2xs  active:scale-[0.98] transition-all cursor-pointer ${
          copied
            ? "bg-slate-800 text-white"
            : "bg-emerald-600 hover:bg-emerald-700 text-white"
        }`}
      >
        {copied ? (
          <>
            {/* Checkmark Icon for Copied State */}
            <svg
              className="w-3.5 h-3.5 text-emerald-400 shrink-0"
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
              className="w-3.5 h-3.5 text-emerald-100 shrink-0"
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
              {thread.leadId?.leadRef
                ? `L-${thread.leadId.leadRef}`
                : "Lead Linked"}
            </span>
          </>
        )}
      </button>
    );
  }

  // No lead linked — create one
  return (
    <button
      type="button"
      title="Create Lead"
      onClick={handleCreateLead}
      className="w-24 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 hover:text-emerald-700 hover:border-emerald-200 active:scale-[0.98] transition-all cursor-pointer"
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
      <span className="truncate">Lead</span>
    </button>
  );
}
