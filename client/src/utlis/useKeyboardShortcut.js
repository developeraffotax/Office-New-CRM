import { useEffect, useRef } from "react";

export function useKeyboardShortcut(
  keys,
  callback,
  enabled = true,
) {
  const callbackRef = useRef(callback);

  // Keep latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      const shift = !!keys.shift;
      const ctrl = !!keys.ctrl;
      const alt = !!keys.alt;
      const targetKey = keys.key?.toLowerCase();

      const matched =
        e.shiftKey === shift &&
        e.ctrlKey === ctrl &&
        e.altKey === alt &&
        key === targetKey;

      if (matched) {
        callbackRef.current(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [keys, enabled]);
}