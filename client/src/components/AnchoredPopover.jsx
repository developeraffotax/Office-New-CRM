// components/AnchoredPopover.jsx
import { useLayoutEffect, useState } from "react";
import Popper from "@mui/material/Popper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Fade from "@mui/material/Fade";

export default function AnchoredPopover({ open, anchorEl, onClose, children }) {
  const [panel, setPanel] = useState({ maxHeight: 480, placement: "bottom-end" });

  useLayoutEffect(() => {
    if (!open || !anchorEl) return;

    const measure = () => {
      const rect = anchorEl.getBoundingClientRect();
      const padding = 16;
      const spaceBelow = window.innerHeight - rect.bottom - padding;
      const spaceAbove = rect.top - padding;
      const openBelow = spaceBelow >= 300 || spaceBelow >= spaceAbove;

      setPanel({
        maxHeight: Math.max(260, Math.min(480, openBelow ? spaceBelow : spaceAbove)),
        placement: openBelow ? "bottom-end" : "top-end",
      });
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, anchorEl]);

  if (!open) return null;

  // No anchor (e.g. opened from a ?comment_taskId= deep link) → old fixed fallback
  if (!anchorEl) {
    return (
      <div className="fixed bottom-4 right-4 z-[999]">{children(480)}</div>
    );
  }

  return (
    <Popper
      open
      anchorEl={anchorEl}
      placement={panel.placement}
      transition
      style={{ zIndex: 1300 }}
      modifiers={[
        { name: "offset", options: { offset: [0, 8] } },
        { name: "preventOverflow", options: { boundary: "viewport", padding: 12 } },
      ]}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={150}>
          <div>
            <ClickAwayListener
              mouseEvent="onMouseDown"
              touchEvent="onTouchStart"
              onClickAway={onClose}
            >
              <div>{children(panel.maxHeight)}</div>
            </ClickAwayListener>
          </div>
        </Fade>
      )}
    </Popper>
  );
}