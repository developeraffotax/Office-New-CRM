import { useEffect, useRef } from "react";

const overlayStack = [];

export function useOverlayStack({ ref, onClose, isOpen }) {
  const idRef = useRef(Symbol());

  useEffect(() => {
    if (!isOpen || !ref.current) return;

    const overlay = { id: idRef.current, ref, onClose };
    overlayStack.push(overlay);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        const top = overlayStack[overlayStack.length - 1];
        if (top?.id === idRef.current) {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }
      }
    };

    const handleClick = (e) => {
      const top = overlayStack[overlayStack.length - 1];
      if (top?.id !== idRef.current) return;
      if (ref.current && !ref.current.contains(e.target)) {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("mousedown", handleClick, true);

    return () => {
      const index = overlayStack.findIndex((o) => o.id === idRef.current);
      if (index > -1) overlayStack.splice(index, 1);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("mousedown", handleClick, true);
    };
  }, [isOpen, onClose, ref]);
}