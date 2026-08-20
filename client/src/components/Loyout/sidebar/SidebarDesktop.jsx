import React from "react";
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import SidebarMenu from "./SidebarMenu";

export default function SidebarDesktop(props) {
  const {
    items,
    active,
    onNavigate,
    hide = false,
    setHide,
    isSettingsOpen,
    setIsSettingsOpen,
  } = props;

  return (
    <aside
      className={`relative hidden md:flex  w-full h-full py-2 bg-[#f9f9f9] border-r transition-[width] duration-200 ease-in-out `}
    >
      <div className="relative w-full h-full py-2 overflow-y-auto message">
        

        <SidebarMenu
          items={items}
          active={active}
          onNavigate={onNavigate}
          compact={hide}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
        />

        <div className="fixed bottom-2 left-2">
          <button
            type="button"
            onClick={() => setHide?.(!hide)}
            className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-white transition-colors"
            aria-label={hide ? "Expand sidebar" : "Collapse sidebar"}
            title={hide ? "Expand sidebar" : "Collapse sidebar"}
          >
            {hide ? (
              <AiOutlineMenuUnfold className="h-5 w-5 cursor-pointer hover:text-orange-600" />
            ) : (
              <AiOutlineMenuFold className="h-5 w-5 cursor-pointer hover:text-orange-600" />
            )}
          </button>
        </div>


      </div>
    </aside>
  );
}
