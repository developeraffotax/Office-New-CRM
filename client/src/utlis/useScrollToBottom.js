import { useCallback, useEffect, useRef } from "react";

export function useScrollToBottom(deps = []) {
  const containerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom, ...deps]);

  return containerRef;
}