import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export function ImageModal({ src, alt, takenAt, onClose, onNext, onPrev }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext?.();
      if (e.key === "ArrowLeft") onPrev?.();
    };

    document.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onNext, onPrev]);

  if (typeof document === "undefined") return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/90" />

      {/* image container */}
      <div
        className="relative max-w-[95vw] max-h-[95vh] z-10 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          style={{ maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain" }}
          className="block select-none"
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-20 rounded px-2 py-1 bg-red-500 backdrop-blur text-white text-sm hover:bg-red-600"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Prev Button */}
        {onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Previous image"
          >
            <FaChevronLeft className="text-lg" />
          </button>
        )}

        {/* Next Button */}
        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Next image"
          >
            <FaChevronRight className="text-lg" />
          </button>
        )}
      </div>

      <div className="absolute bottom-4 text-center text-white text-sm z-20 w-full px-4">
        {alt && <div className="font-medium">{alt}</div>}
        {takenAt && <div className="mt-1 text-xs">Taken at: {takenAt}</div>}
      </div>
    </div>,
    document.body
  );
}
