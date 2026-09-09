// hooks/useSwipeToClose.js
import { useRef, useState, useCallback, useEffect } from "react";

export function useSwipeToClose({
  onClose,
  threshold = 120,
  enabled = true,
}) {
  const startY = useRef(0);
  const currentY = useRef(0);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const onTouchStart = useCallback(
    (e) => {
      if (!enabled) return;
      startY.current = e.touches[0].clientY;
      currentY.current = startY.current;
      setIsDragging(true);
    },
    [enabled],
  );

  // Global move / end so the gesture continues even if finger leaves the handle
  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e) => {
      const y = e.touches[0].clientY;
      const delta = y - startY.current;
      if (delta > 0) {
        currentY.current = y;
        setOffset(delta);
      }
    };

    const onEnd = () => {
      const delta = currentY.current - startY.current;
      if (delta > threshold) {
        onClose();
      }
      setOffset(0);
      setIsDragging(false);
      startY.current = 0;
      currentY.current = 0;
    };

    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);

    return () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [isDragging, threshold, onClose]);

  return {
    offset,
    isDragging,
    handlers: {
      onTouchStart, // only this is needed on the handle
    },
  };
}