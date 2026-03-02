import React, { useState, useRef } from "react";
import { FaCaretDown } from "react-icons/fa";
import { useClickOutside } from "../../utlis/useClickOutside";
 

const formatDate = (internalDate) => {
  if (!internalDate) return "";
  const date = new Date(parseInt(internalDate));
  
  const dayMonthYear = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return `${dayMonthYear}, ${time}`;
};

export default function EmailHeaderDetails({ details }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useClickOutside(popoverRef, () => setIsOpen(false));

  const parseOnlyEmails = (str) => {
    if (!str) return "";
    const emails = str.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
    return emails ? emails.join(", ") : str;
  };

  const detailRows = [
    { label: "from:", value: parseOnlyEmails(details.from) },
    { label: "to:", value: parseOnlyEmails(details.to) },
    { label: "cc:", value: parseOnlyEmails(details.cc) },
    { label: "bcc:", value: parseOnlyEmails(details.bcc) },
    { label: "date:", value: formatDate(details.date) },
    { label: "subject:", value: details.subject },
  ];

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button - Minimalist */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-900 transition-colors py-0.5"
      >
        <span className="truncate max-w-[300px]">
          to {details.toShort || parseOnlyEmails(details.to)}
        </span>
        <FaCaretDown className={`text-[10px] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Enterprise Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-1 z-[70] w-[460px] bg-white border border-gray-300 shadow-lg rounded-md overflow-hidden animate-in fade-in duration-150">
          <div className="p-4 flex flex-col gap-2">
            {detailRows.map((row, idx) => (
              row.value ? (
                <div key={idx} className="grid grid-cols-[70px_1fr] items-start gap-2">
                  <span className="text-[12px] text-gray-500 font-normal">
                    {row.label}
                  </span>
                  <span className="text-[12px] text-gray-900 break-all leading-tight">
                    {row.value}
                  </span>
                </div>
              ) : null
            ))}
          </div>
          
          {/* Minimal Footer */}
          {/* <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-gray-600">
              <span className="w-2 h-2 bg-gray-400 rounded-full" />
              Standard encryption (TLS)
            </div>
            <button className="text-[11px] font-medium text-gray-800 hover:underline">
              Learn more
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
}