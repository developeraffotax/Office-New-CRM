import React from "react";
import SidebarMenu from "./SidebarMenu";

export default function SidebarMobile({
  items,
  active,
  onNavigate,
  isSettingsOpen,
  setIsSettingsOpen,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-[998] md:hidden">
      <button
        type="button"
        aria-label="Close sidebar"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <aside className="relative z-[999] h-full w-[280px] py-2 bg-[#f9f9f9] border-r shadow-xl">
        <div className="relative w-full h-full py-3 overflow-y-auto message">
          <SidebarMenu
            items={items}
            active={active}
            onNavigate={onNavigate}
            compact={false}
            isSettingsOpen={isSettingsOpen}
            setIsSettingsOpen={setIsSettingsOpen}
          />
        </div>
      </aside>
    </div>
  );
}
