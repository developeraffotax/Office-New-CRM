import { useEffect } from "react";

export const useClickOutside = (refs, handlers) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if clicked inside modal
      if (event.target.closest("#myModal")) {
        return;
      }

      // Check each ref and call its handler if clicked outside
      Object.entries(refs).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(event.target)) {
          handlers[key]?.();
        }
      });
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        Object.values(handlers).forEach((handler) => handler?.());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [refs, handlers]);
};
