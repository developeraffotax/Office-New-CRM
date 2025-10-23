import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export const ModalPortal = ({ isOpen, onClose, children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-[90%] max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};
