import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { RiSettings4Fill } from "react-icons/ri";
import { LuFileSpreadsheet } from "react-icons/lu";

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
  const { pathname } = useLocation();
  const [isSheetsOpen, setIsSheetsOpen] = useState(
    pathname.startsWith("/google-sheets"),
  );

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

      {/* Google Sheets group — admin: all sheets + manage, users: only theirs */}
      {items.showSheets && (
        <>
          {compact ? (
            <>
              <button
                type="button"
                title="Google Sheets"
                aria-label="Google Sheets"
                className={`relative h-[2.4rem] w-full border rounded-lg cursor-pointer flex items-center justify-center transition-all duration-100 ${
                  isSheetsOpen
                    ? "bg-white border-black/20"
                    : "hover:bg-white hover:border-black/20 border-transparent"
                }`}
                onClick={() => setIsSheetsOpen((prev) => !prev)}
              >
                <LuFileSpreadsheet className="h-5 w-5 text-gray-900" />
              </button>

              {isSheetsOpen &&
                items.sheets.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    active={active}
                    onNavigate={onNavigate}
                    compact
                  />
                ))}
            </>
          ) : (
            <>
              <button
                type="button"
                className={`text-[14px] font-semibold px-4 py-2 flex items-center justify-between transition-all rounded-lg cursor-pointer ${
                  isSheetsOpen
                    ? "bg-white border-black/20"
                    : "hover:bg-white hover:border-black/20 border-transparent"
                }`}
                onClick={() => setIsSheetsOpen((prev) => !prev)}
              >
                <span className="flex items-center gap-2">
                  <LuFileSpreadsheet className="h-5 w-5 text-gray-900" />
                  <span>Sheets</span>
                </span>
                <IoIosArrowDown
                  className={`h-4 w-4 text-gray-700 transition-transform duration-300 ${
                    isSheetsOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {isSheetsOpen && (
                <div className="flex flex-col gap-1">
                  {items.sheets.map((item) => (
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
              <RiSettings4Fill className="h-5 w-5 text-gray-900" />
            </button>
          ) : (
            <>
              <button
                type="button"
                className={`text-[14px] font-semibold px-4 py-2 flex items-center justify-between transition-all rounded-lg cursor-pointer ${
                  isSettingsOpen
                    ? "bg-white border-black/20"
                  : "hover:bg-white hover:border-black/20 border-transparent"
                }`}
                onClick={() => setIsSettingsOpen((prev) => !prev)}
              >
                <span className="flex items-center gap-2">
                  <RiSettings4Fill className="h-5 w-5 text-gray-900" />
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
  const { pathname } = useLocation();
  const Icon = item.icon;

  // Items with a matchPath (individual sheets) highlight on their exact route,
  // because `active` only holds the first path segment ("google-sheets").
  const currentActive = item.matchPath
    ? pathname === item.matchPath
      ? item.activeKey
      : null
    : active;
  const isActive = currentActive === item.activeKey;

  return (
    <button
      type="button"
      title={compact ? item.label : undefined}
      aria-label={compact ? item.label : undefined}
      className={`${itemBase} ${itemState(currentActive, item.activeKey)} w-full text-left ${
        item.dimmed ? "opacity-60" : ""
      }`}
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
            <span className={`text-[14px] font-[500] truncate `}>
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