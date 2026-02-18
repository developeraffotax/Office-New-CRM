import React, { useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiInbox,
  FiSend,
  FiChevronRight,
  FiHash,
  FiGrid,
} from "react-icons/fi";

const NavItem = ({ icon, label, folder, count, company }) => {
  const [searchParams] = useSearchParams();
  const activeFolder = searchParams.get("folder") || "inbox";
  const activeCompany = searchParams.get("companyName") || "affotax";
  const isActive = activeFolder === folder && activeCompany === company;

  const params = new URLSearchParams(searchParams);
  params.set("folder", folder);
  params.set("companyName", company);

  return (
    <NavLink
      to={`/mail?${params.toString()}`}
      className={`
        group flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font- transition-all duration-200
        ${
          isActive
            ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }
      `}
    >
      {/* Icon */}
      <span
        className={`text-[17px] transition-all duration-300 ${
          isActive
            ? "scale-105"
            : "text-slate-400 group-hover:text-blue-500 group-hover:scale-110"
        }`}
      >
        {icon}
      </span>

      {/* Label */}
      <span className="flex-1 font-google  tracking-tight">{label}</span>

      {/* Unread Badge */}
      {/* {count > 0 && (
        <span
          className={`min-w-[20px] h-[20px] flex items-center justify-center text-[10px] font-bold rounded-full px-1.5
          transition-all duration-300 bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white `}
        >
          {count}
        </span>
      )} */}
    </NavLink>
  );
};

const WorkspaceGroup = ({
  title,
  unreadCount,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <div className="px-5 mb-2 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 group"
        >
          {/* Icon Bubble */}
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300
            ${
              unreadCount > 0
                ? "bg-blue-100 text-blue-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            <FiHash className="size-3.5" />
          </div>

          {/* Title */}
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 group-hover:text-slate-900 transition-colors">
            {title}
          </span>

          {/* Chevron */}
          <FiChevronRight
            className={`size-3 text-slate-400 transition-transform duration-300 ${
              isOpen ? "rotate-90 text-slate-600" : ""
            }`}
          />
        </button>

        {/* Workspace total badge */}
        {unreadCount > 0 && (
          <div className="min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-blue-600 text-white shadow-sm flex justify-center items-center tabular-nums leading-none">
            {unreadCount}
          </div>
        )}
      </div>

      {/* Collapsible Content */}
      <div
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
        `}
      >
        <div className="overflow-hidden space-y-0.5">{children}</div>
      </div>
    </div>
  );
};

export default function Sidebar() {
  const affotaxUnread = useSelector(
    (state) => state.inboxUnread?.companies?.affotax?.inboxUnread || 0,
  );

  const outsourceUnread = useSelector(
    (state) => state.inboxUnread?.companies?.outsource?.inboxUnread || 0,
  );

  return (
    <div className="w-56 h-full border-r border-slate-100 bg-gradient-to-b from-slate-50 via-white to-slate-50 flex flex-col font-sans antialiased">
      {/* Header */}
      <div className="px-6 py-6 flex items-center gap-3 group cursor-default">
        <FiGrid className="size-4 text-slate-900 transition-transform duration-300 group-hover:rotate-90" />

        {/* Elegant Vertical Divider */}
        <div className="h-4 w-[1px] bg-slate-200" />

        <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
          Workspaces
        </h2>
      </div>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-2 pb-10">
        <WorkspaceGroup title="Affotax" unreadCount={affotaxUnread}>
          <NavItem
            icon={<FiInbox />}
            label="Inbox"
            folder="inbox"
            company="affotax"
            count={affotaxUnread}
          />
          <NavItem
            icon={<FiSend />}
            label="Sent"
            folder="sent"
            company="affotax"
          />
        </WorkspaceGroup>

        <WorkspaceGroup title="Outsource" unreadCount={outsourceUnread}>
          <NavItem
            icon={<FiInbox />}
            label="Inbox"
            folder="inbox"
            company="outsource"
            count={outsourceUnread}
          />
          <NavItem
            icon={<FiSend />}
            label="Sent"
            folder="sent"
            company="outsource"
          />
        </WorkspaceGroup>
      </div>

      {/* Footer Status */}
    </div>
  );
}
