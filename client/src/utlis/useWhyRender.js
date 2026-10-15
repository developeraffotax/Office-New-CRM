import { useEffect, useRef } from "react";

export function useWhyRender(name, tracked) {
  const prev = useRef(tracked);
  useEffect(() => {
    const changed = {};
    Object.keys(tracked).forEach((k) => {
      if (!Object.is(prev.current[k], tracked[k])) {
        changed[k] = { from: prev.current[k], to: tracked[k] };
      }
    });
    if (Object.keys(changed).length) {
      console.log(`[${name}] changed:`, changed);
    } else {
      console.log(`[${name}] re-rendered, NO tracked value changed`);
    }
    prev.current = tracked;
  });
}