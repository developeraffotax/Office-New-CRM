import { useEffect } from "react";

// Calls onClose when Escape is pressed (used by modals and side panels).
export default function useEscapeKey(onClose) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}
