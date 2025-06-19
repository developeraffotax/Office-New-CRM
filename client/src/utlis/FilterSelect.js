import { useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { FaCheck } from 'react-icons/fa';

const FilterSelect = ({ options = [], onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSelect = (option) => {
    console.log('Selected option:', option);
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };
 
  return (
    <div className="relative inline-block text-left z-[999]">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full border border-gray-300"
      >
        <FiFilter size={20} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[999]">
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center m-0 ${
                  selected === option ? 'bg-gray-100 font-medium' : ''
                }`}
                onClick={() => handleSelect(option)}
              >
                {option}
                {selected === option && <FaCheck className="text-green-500 text-xs" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterSelect;
