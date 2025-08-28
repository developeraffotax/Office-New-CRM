import { createPortal } from "react-dom";
import React, { useEffect, useRef, useState } from "react";

const TimeEditor = ({ anchorRef, initialValue, onApply, onClose }) => {
  const popupRef = useRef(null);
  const [position, setPosition] = useState(null);
  const [hours, setHours] = useState(Math.floor(initialValue));
  const [minutes, setMinutes] = useState(Math.round((initialValue % 1) * 60));

  useEffect(() => {
    const anchor = anchorRef?.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    setPosition({
      top: rect.top + rect.height + scrollTop + 4,
      left: rect.left + scrollLeft,
    });
  }, [anchorRef]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !anchorRef?.current?.contains(event.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApply = () => {
    const total = hours + minutes / 60;
    onApply(Number(total.toFixed(2)));
    onClose();
  };

  if (!position) return null;

  return createPortal(
    <div
      ref={popupRef}
      className="fixed z-[9999] w-64 bg-white p-4 border border-gray-300 rounded-md shadow-xl"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="flex gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm">Hours</label>
          <select
            className="border rounded px-2 py-1"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          >
            {Array.from({ length: 13 }, (_, i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Minutes</label>
          <select
            className="border rounded px-2 py-1"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          >
            {[0, 1, 5, 10, 15, 30, 45, 50, 55].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleApply}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 rounded"
      >
        Apply
      </button>
    </div>,
    document.body
  );
};

export default TimeEditor;
