"use client";
import { useState, useRef, useEffect,  } from "react";

 
import { CiViewTimeline } from "react-icons/ci";
 
import OverviewDropdown from "./OverviewDropdown";

export default function OverviewForPages () {
  

  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="relative inline-block mt-2" ref={wrapperRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        title="Quick Overview"
      >
        <CiViewTimeline
          className={`w-7 h-7 hover:text-orange-600   transition-all duration-200 outline-none  ${
            showDropdown ? "  text-orange-600 " : "  text-black"
          }`}
        />
      </button>

      {/* Dropdown */}
      {showDropdown && (
       <OverviewDropdown setShowDropdown={setShowDropdown}/>
      )}
    </div>
  );
}
