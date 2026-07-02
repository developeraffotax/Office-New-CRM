import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { LabelsList } from "../../utils/LabelsList";
import { IoIosArrowDown } from "react-icons/io";

const DROPDOWN_WIDTH = 224;
const DROPDOWN_HEIGHT = 320;
const PADDING = 8;

// Reads the zoom factor applied on body (or any ancestor) so we can
// compensate when positioning elements portaled into that zoomed subtree.
const getZoomFactor = () => {
  const bodyZoom = parseFloat(getComputedStyle(document.body).zoom);
  return Number.isFinite(bodyZoom) && bodyZoom > 0 ? bodyZoom : 1;
};

const LabelDropdownPortal = ({ position, onClose, children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999]" onClick={onClose}>
      <div
        className="absolute"
        style={{ top: position.top, left: position.left }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

// Clamp so the dropdown never overflows viewport edges, then correct
// for any zoom applied on the container we're portaling into (body).
const getClampedPosition = (
  clientX,
  clientY,
  width = DROPDOWN_WIDTH,
  height = DROPDOWN_HEIGHT
) => {
  let left = clientX;
  let top = clientY;

  // Clamp using REAL viewport pixels first (window.innerWidth/Height are
  // already real viewport units, unaffected by body's zoom).
  if (left + width > window.innerWidth - PADDING) {
    left = window.innerWidth - width - PADDING;
  }
  if (top + height > window.innerHeight - PADDING) {
    top = clientY - height;
  }

  left = Math.max(PADDING, left);
  top = Math.max(PADDING, top);

  // Now correct for zoom: since the portal is a child of a zoomed body,
  // any px value we assign gets multiplied by the zoom factor on paint.
  // Divide so the final rendered position matches real viewport pixels.
  const zoom = getZoomFactor();
  return { top: top / zoom, left: left / zoom };
};

const useLabelDropdown = () => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const anchorPoint = useRef({ x: 0, y: 0 });

  const open = useCallback((x, y) => {
    anchorPoint.current = { x, y };
    setPosition(getClampedPosition(x, y));
    setShow(true);
  }, []);

  const close = useCallback(() => setShow(false), []);

  useEffect(() => {
    if (!show) return;

    const reposition = () => {
      setPosition(getClampedPosition(anchorPoint.current.x, anchorPoint.current.y));
    };

    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [show]);

  return { show, position, open, close };
};

export const labelsColumn = ({ labelData, addJoblabel }) => {
  return {
    id: "Labels",
    accessorKey: "label",

    Header: ({ column }) => {
      const { show, position, open, close } = useLabelDropdown();
      const btnRef = useRef(null);
      const currentFilter = column.getFilterValue() || "";

      const openDropdown = () => {
        const rect = btnRef.current?.getBoundingClientRect();
        if (rect) open(rect.left, rect.bottom + 4);
      };

      return (
        <div className="relative flex flex-col gap-1 w-full">
          <span
            className="cursor-pointer ml-1  "
            onClick={() => column.setFilterValue("")}
          >
            Labels
          </span>

          <button
            ref={btnRef}
            onClick={openDropdown}
            className="h-[30px] min-w-full font-normal flex items-center gap-2 justify-between  rounded-md border border-gray-200 bg-gray-50 px-2 text-xs text-left hover:bg-gray-100"
          >
            {currentFilter || "Select"}
            <span><IoIosArrowDown /></span>
          </button>

          {show && (
            <LabelDropdownPortal position={position} onClose={close}>
              <LabelsList
                labels={labelData}
                currentLabel={currentFilter}
                onClose={close}
                onSelect={(label) => {
                  column.setFilterValue(label?.name || "");
                  close();
                }}
              />
            </LabelDropdownPortal>
          )}
        </div>
      );
    },

    Cell: ({ row }) => {
      const { show, position, open, close } = useLabelDropdown();
      const jobLabel = row.original.label || {};
      const { name, color } = jobLabel;

      const openDropdown = (e) => {
        e.stopPropagation();
        open(e.clientX, e.clientY);
      };

      const handleSelect = (label) => {
        if (label) {
          addJoblabel(row.original._id, label.name, label.color);
        } else {
          addJoblabel(row.original._id, "", "");
        }
        close();
      };

      return (
        <div className="flex justify-center relative w-full">
          <div onDoubleClick={openDropdown} className="cursor-pointer w-full">
            {name ? (
              <span
                className="px-2 py-1 rounded-md text-white text-xs  "
                style={{ background: color }}
              >
                {name}
              </span>
            ) : (
              <span className=" inline-block     w-full">
                 
              </span>
            )}
          </div>

          {show && (
            <LabelDropdownPortal position={position} onClose={close}>
              <LabelsList
                labels={labelData}
                currentLabel={name}
                onClose={close}
                onSelect={handleSelect}
              />
            </LabelDropdownPortal>
          )}
        </div>
      );
    },

    filterFn: (row, id, value) => {
      if (!value) return true;
      return row.original.label?.name === value;
    },

    size: 140,
    minSize: 100,
    maxSize: 210,
    grow: false,
  };
};