import React, { useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiInbox,
  FiSend,
  FiChevronRight,
  FiHash,
  FiGrid,
  FiX,
} from "react-icons/fi";

const NavItem = ({ icon, label, folder, count, company, onNavigate }) => {
  const [searchParams] = useSearchParams();
  const activeFolder = searchParams.get("folder") || "inbox";
  const activeCompany = searchParams.get("companyName") || "affotax";
  const isActive = activeFolder === folder && activeCompany === company;

  const params = new URLSearchParams(searchParams);
  params.set("folder", folder);
  params.set("companyName", company);
  params.delete("mailThreadId");

  return (
    <NavLink
      to={`/mail?${params.toString()}`}
      onClick={() => onNavigate?.()}
      className={`
        group flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-[15px] transition-all duration-200
        ${
          isActive
            ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
            : "text-slate-600 active:bg-slate-100 active:text-slate-900"
        }
      `}
    >
      <span
        className={`text-[18px] transition-all duration-300 ${
          isActive
            ? "scale-105"
            : "text-slate-400 group-active:text-blue-500"
        }`}
      >
        {icon}
      </span>

      <span className="flex-1 font-google tracking-tight">{label}</span>
    </NavLink>
  );
};

const WorkspaceGroup = ({
  title,
  unreadCount,
  children,
  defaultOpen = true,
  showUnreadCount = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="py-3 border-t border-slate-100">
      <div className="px-5 mb-2 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 group"
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300
            ${
              showUnreadCount && unreadCount > 0
                ? "bg-blue-100 text-blue-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            <FiHash className="size-3.5" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            {title}
          </span>

          <FiChevronRight
            className={`size-3.5 text-slate-400 transition-transform duration-300 ${
              isOpen ? "rotate-90 text-slate-600" : ""
            }`}
          />
        </button>

        {showUnreadCount && unreadCount > 0 && (
          <div className="min-w-[22px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-blue-600 text-white shadow-sm flex justify-center items-center tabular-nums leading-none">
            {unreadCount}
          </div>
        )}
      </div>

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

export default function SidebarMobile({ onNavigate, onClose }) {
  const affotaxUnread = useSelector(
    (state) => state.inboxUnread?.companies?.affotax?.inboxUnread || 0
  );

  const outsourceUnread = useSelector(
    (state) => state.inboxUnread?.companies?.outsource?.inboxUnread || 0
  );

  const { settings } = useSelector((state) => state.settings);
  const {
    inboxConfig: { inboxUnreadCount = true } = {},
  } = settings || {};

  return (
    <div className="w-[280px] max-w-[85vw] h-full bg-white flex flex-col font-sans antialiased shadow-xl">
      {/* Header with close button */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <FiGrid className="size-4 text-slate-900" />
          <div className="h-4 w-[1px] bg-slate-200" />
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
            Workspaces
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 -mr-1 rounded-full active:bg-slate-100"
          aria-label="Close menu"
        >
          <FiX className="size-5 text-slate-500" />
        </button>
      </div>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-1 pb-10">
        <WorkspaceGroup
          title="Affotax"
          unreadCount={affotaxUnread}
          showUnreadCount={inboxUnreadCount}
        >
          <NavItem
            icon={<FiInbox />}
            label="Inbox"
            folder="inbox"
            company="affotax"
            count={affotaxUnread}
            onNavigate={onNavigate}
          />
          <NavItem
            icon={<FiSend />}
            label="Sent"
            folder="sent"
            company="affotax"
            onNavigate={onNavigate}
          />
        </WorkspaceGroup>

        <WorkspaceGroup
          title="Outsource"
          unreadCount={outsourceUnread}
          showUnreadCount={inboxUnreadCount}
        >
          <NavItem
            icon={<FiInbox />}
            label="Inbox"
            folder="inbox"
            company="outsource"
            count={outsourceUnread}
            onNavigate={onNavigate}
          />
          <NavItem
            icon={<FiSend />}
            label="Sent"
            folder="sent"
            company="outsource"
            onNavigate={onNavigate}
          />
        </WorkspaceGroup>
      </div>
    </div>
  );
}