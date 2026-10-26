import { useEffect, useState } from "react";

export function useKeyboardInset(enabled = true) {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!enabled || !vv) {
      setInset(0);
      return;
    }
    const update = () => {
      const v = Math.round(window.innerHeight - vv.height - vv.offsetTop);
      setInset(v > 100 ? v : 0); // ignore browser-toolbar jitter
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [enabled]);

  return inset;
}