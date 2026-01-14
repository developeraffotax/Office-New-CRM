import { useEffect, useRef } from "react";

export function useEscapeKey(callback, enabled = true) {
  const callbackRef = useRef(callback);

  // Always keep latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        callbackRef.current(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}