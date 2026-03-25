import React, { useState, useRef, useEffect } from 'react';
import { HiChevronDown, HiCheckCircle, HiClock, HiCollection } from 'react-icons/hi';

const StatusDropdown = ({ filters, handleUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: '', label: 'All', icon: HiCollection, color: 'text-gray-400' },
    { value: 'progress', label: 'Progress', icon: HiClock, color: 'text-amber-500' },
    { value: 'completed', label: 'Completed', icon: HiCheckCircle, color: 'text-emerald-500' },
  ];

  const currentStatus = options.find(opt => opt.value === (filters.status || ''));
  const StatusIcon = currentStatus.icon;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between gap-1.5 px-2 py-1 rounded-md border border-gray-200   min-w-28
          bg-white hover:bg-gray-50 transition-all duration-200
          text-[12px] font-semibold text-gray-700 shadow-sm
          ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-400' : ''}
        `}
      >
        <div className='flex items-center gap-1.5'>
          <StatusIcon className={`text-[14px] ${currentStatus.color}`} />
        <span className="truncate max-w-[70px]">{currentStatus.label}</span>
        </div>
        <HiChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-gray-400`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-40 origin-top-left bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-100">
          <div className="py-1">
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected = filters.status === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    handleUpdate({ status: option.value });
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] transition-colors
                    ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}
                  `}
                >
                  <Icon className={`text-[15px] ${option.color} ${isSelected ? 'opacity-100' : 'opacity-80'}`} />
                  <span className={isSelected ? 'font-bold' : 'font-medium'}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;