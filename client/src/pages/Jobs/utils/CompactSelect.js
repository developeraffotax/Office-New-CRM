import { useRef } from "react";
import { FaListUl } from "react-icons/fa";

export function CompactSelect({ value, onChange, options }) {
  const selectRef = useRef(null);

  const handleIconClick = () => {
    // Focus and open select (works on visible elements only)
    selectRef.current?.focus();
    selectRef.current?.showPicker?.(); // modern browsers (Chrome, Edge)
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Compact visible select (styled small & transparent) */}
      <select
        ref={selectRef}
        value={value}
        onChange={onChange}
        className="absolute top-0 left-0 opacity-0 w-full h-full cursor-pointer"
      >
        <option  value="">No Template</option>
         
        {options.map((el) => (
          <option key={el} value={el}>
            {el}
          </option>
        ))}
      </select>

      {/* Icon trigger */}
      <button
        type="button"
        onClick={handleIconClick}
        className={`p-2 rounded-md border border-gray-300  hover:bg-gray-50 text-gray-600 ${value ? 'bg-orange-100 border-orange-400 text-orange-700' : 'bg-white'}`}
        title="Choose Template"
      >
        <FaListUl className="text-lg" />
      </button>
    </div>
  );
}
