// components/shared/CustomSelect.jsx

import React from "react";
import Select, { components } from "react-select";

// Highlight matching text
export const HighlightedOption = (props) => {
  const {
    data,
    selectProps: { inputValue },
  } = props;

  const label = data.label || "";

  // No search → return normal label
  if (!inputValue) {
    return (
      <components.Option {...props}>
        {label}
      </components.Option>
    );
  }

  // Split search into words
  const words = inputValue
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  // Escape regex special chars
  const escapedWords = words.map(word =>
    word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  // Create regex like: (tax|return)
  const regex = new RegExp(
    `(${escapedWords.join("|")})`,
    "ig"
  );

  const parts = label.split(regex);

  return (
    <components.Option {...props}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-yellow-200 text-black px-[1px] rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </components.Option>
  );
};

const defaultStyles = {
  control: (provided) => ({
      ...provided,
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      boxShadow: "none",
      minHeight: "36px",
      fontSize: "14px",
      "&:hover": { border: "1px solid #f97316" },
    }),
    menu: (provided) => ({ ...provided, zIndex: 9999 }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af",
  }),
};




// Multi-word search filter
export const filterOption = (option, rawInput) => {
  if (!rawInput) return true;

  // Split input into words
  const searchWords = rawInput
    .toLowerCase()
    .trim()
    .split(/\s+/); // split by spaces

  const label = option.label.toLowerCase();

  // Check every word exists in label
  return searchWords.every(word =>
    label.includes(word)
  );
};




export const sortOptions = (options, inputValue) => {
  if (!inputValue) return options;
  return [...options].sort((a, b) => {
    const aIndex = a.label.toLowerCase().indexOf(inputValue.toLowerCase());
    const bIndex = b.label.toLowerCase().indexOf(inputValue.toLowerCase());
    return aIndex - bIndex; // lower index = earlier match = higher priority
  });
};




const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  styles = {},
  isSearchable = true,
  isClearable = true,
  className = "",
  menuPortalTarget,
  ...props
}) => {
  const [inputValue, setInputValue] = React.useState("");

  return (
    <div className={className}>
      <Select
        value={options.find((opt) => opt?.value === value) || null}
        options={sortOptions(options, inputValue)}
        placeholder={placeholder}
        filterOption={filterOption}
        isSearchable={isSearchable}
        isClearable={isClearable}
        onInputChange={(val) => setInputValue(val)}
        onChange={(opt) => onChange?.(opt)}
        components={{ Option: HighlightedOption }}
        styles={{
          ...defaultStyles,
          ...styles,
        }}
        menuPortalTarget={menuPortalTarget}
        {...props}
      />
    </div>
  );
};

export default CustomSelect;