import React from "react";
import { IoIosArrowDown } from "react-icons/io";
import { RiSettings4Fill } from "react-icons/ri";

const itemBase =
  "relative h-[2.4rem] border rounded-lg cursor-pointer overflow-hidden transition-all duration-100";

const itemState = (active, key) =>
  active === key
    ? "bg-white border-black/20"
    : "hover:bg-white hover:border-black/20 border-transparent";

export default function SidebarMenu({
  items,
  active,
  onNavigate,
  compact = false,
  isSettingsOpen,
  setIsSettingsOpen,
}) {
  return (
    <div className="relative w-full pb-[5rem] flex flex-col gap-1 px-2">
      {items.main.map((item) => (
        <SidebarItem
          key={item.id}
          item={item}
          active={active}
          onNavigate={onNavigate}
          compact={compact}
        />
      ))}

      {items.showSettingsDivider && <hr className="my-1" />}

      {items.showSettings && (
        <>
          {compact ? (
            <button
              type="button"
              title="Settings"
              aria-label="Settings"
              className={`relative h-[2.4rem] w-full border rounded-lg cursor-pointer flex items-center justify-center transition-all duration-100 ${
                isSettingsOpen
                  ? "bg-white border-black/20"
                  : "hover:bg-white hover:border-black/20 border-transparent"
              }`}
              onClick={() => setIsSettingsOpen((prev) => !prev)}
            >
              <RiSettings4Fill className="h-6 w-6 text-gray-900" />
            </button>
          ) : (
            <>
              <button
                type="button"
                className={`text-[16px] font-semibold px-4 py-2 flex items-center justify-between transition-all rounded-lg cursor-pointer ${
                  isSettingsOpen
                    ? "bg-white border-black/20"
                  : "hover:bg-white hover:border-black/20 border-transparent"
                }`}
                onClick={() => setIsSettingsOpen((prev) => !prev)}
              >
                <span className="flex items-center gap-2">
                  <RiSettings4Fill className="h-6 w-6 text-gray-900" />
                  <span>Settings</span>
                </span>
                <IoIosArrowDown
                  className={`h-4 w-4 text-gray-700 transition-transform duration-300 ${
                    isSettingsOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {isSettingsOpen && (
                <div className="flex flex-col gap-1">
                  {items.settings.map((item) => (
                    <SidebarItem
                      key={item.id}
                      item={item}
                      active={active}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function SidebarItem({ item, active, onNavigate, compact = false }) {
  const Icon = item.icon;
  const isActive = active === item.activeKey;

  return (
    <button
      type="button"
      title={compact ? item.label : undefined}
      aria-label={compact ? item.label : undefined}
      className={`${itemBase} ${itemState(active, item.activeKey)} w-full text-left `}
      onClick={() => onNavigate(item)}
    >
      <div
        className={`relative w-full h-full flex items-center z-30 bg-transparent ${isActive ? "text-black" : "text-gray-700"} ${
          compact ? "justify-center px-1" : "justify-between px-3"
        }`}
      >
        <span
          className={`flex items-center min-w-0 ${
            compact ? "justify-center" : "gap-2"
          }`}
        >
          <Icon className="h-5 w-5 shrink-0" />

          {!compact && (
            <span className={`text-[15px] font-[500] truncate `}>
              {item.label}
            </span>
          )}
        </span>

        {!compact && item.badges?.length > 0 && (
          <span className="flex items-center gap-1 shrink-0">
            {item.badges.map((badge) => (
              <span
                key={badge.key}
                title={badge.title}
                className={`w-[20px] h-[20px] text-[12px] font-semibold rounded-full flex items-center justify-center ${
                  badge.className
                }`}
              >
                {badge.count}
              </span>
            ))}
          </span>
        )}
      </div>
    </button>
  );
}
