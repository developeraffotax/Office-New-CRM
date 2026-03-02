import React, { useState, useRef } from "react";
import { IoClose } from "react-icons/io5";

export default function CompactEmailInput({
  label,
  values = [],
  setValues,
  placeholder = "Add email...",
}) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const addChip = (value) => {
    const trimmed = value.trim().replace(",", "");
    if (!trimmed) return;
    if (!values.includes(trimmed)) setValues((prev) => [...prev, trimmed]);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && values.length > 0) {
      setValues((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div 
      className={`
        group flex items-center w-full transition-all duration-300 border-b py-1
        ${isFocused ? "border-blue-500" : "border-gray-200 hover:border-gray-400"}
      `}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Inline Label */}
      {label && (
        <span className="text-sm font-medium text-gray-500 mr-3 whitespace-nowrap select-none">
          {label}
        </span>
      )}

      {/* Horizontal Scrollable/Wrap Container */}
      <div className="flex flex-wrap items-center gap-1.5 flex-1">
        {values.map((email, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-gray-100 text-gray-700 pl-2 pr-1 py-0.5 rounded-md text-xs border border-gray-200/50"
          >
            <span className="truncate max-w-[150px]">{email}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setValues(values.filter((_, i) => i !== index));
              }}
              className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
            >
              <IoClose size={12} className="text-gray-500" />
            </button>
          </div>
        ))}

        <input
          ref={inputRef}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
          value={inputValue}
          placeholder={values.length === 0 ? placeholder : ""}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            addChip(inputValue);
          }}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}