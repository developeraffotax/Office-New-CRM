import { useRef, useState, useMemo, useEffect } from "react";
import { useClickOutside } from "../../../utlis/useClickOutside";

export const LabelsList = ({ labels, currentLabel, onSelect, onClose }) => {
  const ref = useRef();
  const inputRef = useRef();
  const listRef = useRef();
  const itemRefs = useRef([]);

  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useClickOutside(ref, onClose);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredLabels = useMemo(() => {
    if (!search.trim()) return labels || [];

    return (labels || []).filter((l) =>
      l.name.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [labels, search]);

  // "No Label" only renders when there's no active search
  const showNoLabelOption = !search;
  const offset = showNoLabelOption ? 1 : 0;
  const totalItems = filteredLabels.length + offset;

  // Reset highlight to the first real item whenever the list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [search, labels]);

  // Keep the highlighted item scrolled into view
  useEffect(() => {
    itemRefs.current[highlightedIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [highlightedIndex, filteredLabels]);

  const selectByIndex = (index) => {
    if (showNoLabelOption && index === 0) {
      onSelect(null);
      return;
    }
    const label = filteredLabels[index - offset];
    if (label) onSelect(label);
  };

  const handleKeyDown = (e) => {
    if (!totalItems) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalItems);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    }

    if (e.key === "Enter") {
      e.preventDefault();
      selectByIndex(highlightedIndex);
    }

    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      className="w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
    >
      <div className="p-2 border-b">
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search label..."
          className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-200 outline-none focus:ring-1 focus:ring-orange-200"
        />
      </div>

      <div ref={listRef} className="max-h-96 overflow-y-auto p-1">
        {showNoLabelOption && (
          <button
            ref={(el) => (itemRefs.current[0] = el)}
            onClick={() => onSelect(null)}
            onMouseEnter={() => setHighlightedIndex(0)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs ${
              highlightedIndex === 0 ? "bg-orange-50" : "hover:bg-gray-50"
            }`}
          >
            ❌ No Label
          </button>
        )}

        {filteredLabels.map((label, i) => {
          const itemIndex = i + offset;
          return (
            <button
              key={label._id}
              ref={(el) => (itemRefs.current[itemIndex] = el)}
              onClick={() => onSelect(label)}
              onMouseEnter={() => setHighlightedIndex(itemIndex)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs ${
                highlightedIndex === itemIndex ? "bg-orange-50" : "hover:bg-gray-50"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: label.color }}
              />

              <span className="flex-1 text-xs font-medium">{label.name}</span>

              {currentLabel === label.name && (
                <span className="text-green-500 text-xs">✓</span>
              )}
            </button>
          );
        })}

        {!filteredLabels.length && (
          <div className="py-4 text-center text-xs text-gray-400">
            No labels found
          </div>
        )}
      </div>
    </div>
  );
};