import React, { useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  FiInbox,
  FiChevronRight,
  FiHash,
  FiGrid,
  FiX,
} from "react-icons/fi";

const NavItem = ({ icon, label, company, onNavigate }) => {
  const [searchParams] = useSearchParams();

  const activeCompany = searchParams.get("companyName") || "affotax";
  const isActive = activeCompany === company;

  const params = new URLSearchParams(searchParams);
  params.set("companyName", company);

  return (
    <NavLink
      to={`/whatsapp?${params.toString()}`}
      onClick={onNavigate}
      className={`
        group flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm transition-all duration-200
        ${
          isActive
            ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-100"
        }
      `}
    >
      <span
        className={`text-[18px] transition-all duration-300 ${
          isActive
            ? "scale-105 text-blue-600"
            : "text-slate-400 group-hover:text-blue-500"
        }`}
      >
        {icon}
      </span>

      <span className="flex-1 font-medium tracking-tight">{label}</span>
    </NavLink>
  );
};

const WorkspaceGroup = ({
  title,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="py-3 border-t border-slate-100">
      <div className="px-5 mb-2 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 group"
        >
          <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-slate-100 text-slate-400">
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
      </div>

      <div
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden space-y-0.5">{children}</div>
      </div>
    </div>
  );
};

export default function SidebarMobile({ onNavigate, onClose }) {
  return (
    <div className="w-72 h-full bg-white flex flex-col font-sans antialiased shadow-xl">
      {/* Header */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <FiGrid className="size-4 text-slate-900" />
          <div className="h-4 w-[1px] bg-slate-200" />
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
            Workspaces
          </h2>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 active:bg-slate-200 transition-colors"
          aria-label="Close menu"
        >
          <FiX className="size-5" />
        </button>
      </div>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto pt-2 pb-10">
        <WorkspaceGroup title="Affotax">
          <NavItem
            icon={<FiInbox />}
            label="Chats"
            company="affotax"
            onNavigate={onNavigate}
          />
        </WorkspaceGroup>

        <WorkspaceGroup title="Outsource">
          <NavItem
            icon={<FiInbox />}
            label="Chats"
            company="outsource"
            onNavigate={onNavigate}
          />
        </WorkspaceGroup>
      </div>
    </div>
  );
}