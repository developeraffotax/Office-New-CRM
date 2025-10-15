import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { FiCalendar } from "react-icons/fi";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const DateRangePopover = ({ anchorRef, type = "range", onClose, onChange }) => {
  const popoverRef = useRef();
  const fromInputRef = useRef();
  const toInputRef = useRef();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Current month/year
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [anchorRef, onClose]);

  // Position popover near select
  const style = anchorRef.current
    ? {
        position: "absolute",
        top:
          anchorRef.current.getBoundingClientRect().bottom + window.scrollY + 4,
        left: anchorRef.current.getBoundingClientRect().left + window.scrollX,
        zIndex: 1000,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "6px",
        padding: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }
    : {};

  return ReactDOM.createPortal(
    <div ref={popoverRef} style={style}>
      {type === "range" ? (
        // 🗓️ Custom Range Mode
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onChange("from", from);
            onChange("to", to);
            onClose();
          }}
          className="flex flex-col gap-3 w-[240px]"
        >
          {/* From Date */}
          <div>
            <label className="text-sm text-gray-600">From</label>
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value={formatDate(from)}
                placeholder="Select from date"
                className="border rounded p-1 w-full bg-white cursor-pointer pr-8"
                onClick={() => fromInputRef.current?.showPicker()}
              />
              <FiCalendar
                className="absolute right-2 text-gray-500 cursor-pointer"
                onClick={() => fromInputRef.current?.showPicker()}
              />
              <input
                type="date"
                value={from}
                ref={fromInputRef}
                onChange={(e) => setFrom(e.target.value)}
                className="absolute opacity-0 pointer-events-none w-full h-full"
                tabIndex={-1}
              />
            </div>
          </div>

          {/* To Date */}
          <div>
            <label className="text-sm text-gray-600">To</label>
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value={formatDate(to)}
                placeholder="Select to date"
                className="border rounded p-1 w-full bg-white cursor-pointer pr-8"
                onClick={() => toInputRef.current?.showPicker()}
              />
              <FiCalendar
                className="absolute right-2 text-gray-500 cursor-pointer"
                onClick={() => toInputRef.current?.showPicker()}
              />
              <input
                type="date"
                value={to}
                ref={toInputRef}
                onChange={(e) => setTo(e.target.value)}
                className="absolute opacity-0 pointer-events-none w-full h-full"
                tabIndex={-1}
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Apply
          </button>
        </form>
      ) : (
        // 📅 Custom Day Mode
       
<div className="p-2 w-[280px]">
  {/* Month/Year header */}
  <div className="text-sm text-gray-600 mb-2 text-center font-medium">
    {new Date(year, month - 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    })}
  </div>

  {/* Weekday headers */}
  <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-500 mb-1">
    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
      <div key={d}>{d}</div>
    ))}
  </div>

  {/* Days grid */}
  <div className="grid grid-cols-7 gap-2">
    {(() => {
      const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 = Sun, 6 = Sat
      const blanks = Array.from({ length: firstDayOfMonth }); // Empty slots before the 1st

      return (
        <>
          {/* Empty slots to align the first date correctly */}
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} />
          ))}

          {/* Actual days */}
          {days.map((day) => {
            const date = new Date(year, month - 1, day);
            const isoDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            return (
              <button
                key={day}
                onClick={() => {
                  onChange("from", isoDate);
                  onChange("to", isoDate);
                  onClose();
                }}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm border border-gray-200
                  hover:bg-blue-500 hover:text-white
                  ${isWeekend ? "text-red-500 font-semibold" : "text-gray-700"}
                `}
                title={date.toLocaleDateString("en-US", { weekday: "long" })}
              >
                {day}
              </button>
            );
          })}
        </>
      );
    })()}
  </div>
</div>

      )}
    </div>,
    document.body
  );
};

export default DateRangePopover;
