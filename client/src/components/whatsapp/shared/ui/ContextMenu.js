import React, { useState, useRef, useEffect } from "react";

export default function ContextMenu({
  trigger,
  items = [],
  width = "w-56",
  align = "right",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alignment =
    align === "left" ? "left-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "right-0";

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <div onClick={() => setOpen((prev) => !prev)}>{trigger}</div>

      {open && (
        <div
          className={`
            absolute ${alignment} mt-2 ${width}
            bg-white
            border border-gray-200
            rounded-xl
            shadow-xl
            py-1
            z-50
            animate-in fade-in zoom-in-95
          `}
        >
          {items.map((item, index) => {
            if (item.type === "divider") {
              return <div key={index} className="my-1 border-t border-gray-200" />;
            }

            if (item.type === "label") {
              return (
                <div
                  key={index}
                  className="px-3 py-1 text-[11px] font-semibold text-gray-400 tracking-wide"
                >
                  {item.label}
                </div>
              );
            }

            return (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}