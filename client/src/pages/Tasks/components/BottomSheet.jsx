import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { useKeyboardInset } from "../hooks/useKeyboardInset";

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  tall = false,
  flush = false, // body is a flex column and children manage their own scrolling
  zIndex = 1000,
}) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef(null);
  const keyboard = useKeyboardInset(open);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const onTouchStart = (e) => (startY.current = e.touches[0].clientY);
  const onTouchMove = (e) => {
    if (startY.current == null) return;
    setDragY(Math.max(0, e.touches[0].clientY - startY.current));
  };
  const onTouchEnd = () => {
    if (dragY > 100) onClose?.();
    setDragY(0);
    startY.current = null;
  };

  return createPortal(
    // bottom: keyboard → the whole overlay shrinks to the space above the keyboard
    <div className="fixed inset-0" style={{ zIndex, bottom: keyboard }}>
      <style>{`
        @keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes sheetFade{from{opacity:0}to{opacity:1}}
      `}</style>

      <div
        className="absolute inset-0 bg-black/40"
        style={{ animation: "sheetFade .15s ease-out" }}
        onClick={onClose}
      />

      <div
        className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-2xl bg-white shadow-2xl"
        style={{
          height: tall ? "92%" : undefined,
          maxHeight: tall ? undefined : "85%",
          transform: `translateY(${dragY}px)`,
          transition: dragY ? "none" : "transform .2s ease",
          animation: "sheetUp .22s cubic-bezier(.32,.72,0,1)",
          paddingBottom: keyboard ? 0 : "env(safe-area-inset-bottom)",
        }}
      >
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="shrink-0 touch-none"
        >
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-300" />
          <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
            <h3 className="truncate text-[15px] font-semibold text-slate-800">
              {title}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"
            >
              <IoClose className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          className={`min-h-0 flex-1 border-t border-slate-100 ${
            flush
              ? "flex flex-col overflow-hidden"
              : "overflow-y-auto overscroll-contain"
          }`}
        >
          {children}
        </div>

        {footer && <div className="shrink-0 border-t border-slate-100">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}