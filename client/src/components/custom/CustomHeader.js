import React, { useState } from "react";

export const CustomHeader = ({ column, filterOptions, onFilterChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleHeaderClick = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSelectChange = (event) => {
    onFilterChange(event.target.value);
    setIsDropdownOpen(false); // Close the dropdown after selection
  };

  return (
    <div>
      <div onClick={handleHeaderClick} style={{ cursor: "pointer" }}>
        {column.header}
      </div>
      {isDropdownOpen && (
        <select
          onChange={handleSelectChange}
          className="w-[7rem] h-[2rem] rounded-md border outline-none"
        >
          <option value="">All</option>
          {filterOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
