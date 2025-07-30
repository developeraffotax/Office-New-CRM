import React, { useEffect, useRef, useMemo } from "react";
import ReactDOM from "react-dom";

export const NumberFilterPortal = ({
  anchorRef,
  value,
  filterType,
  setValue,
  setFilterType,
  onApply,
  onClose,
}) => {
  const portalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        portalRef.current &&
        !portalRef.current.contains(e.target) &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const style = useMemo(() => {
    if (!anchorRef.current) return {};
    const rect = anchorRef.current.getBoundingClientRect();
    return {
      position: "absolute",
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      zIndex: 1000,
      backgroundColor: "white",
      border: "1px solid #ccc",
      borderRadius: "6px",
      padding: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    };
  }, [anchorRef.current]);

  return ReactDOM.createPortal(
    <div ref={portalRef} style={style}>
      <form onSubmit={onApply}>
        <div className="mb-2">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded p-1 w-full"
        >
          <option value="eq">Equal To</option>
          <option value="gt">Greater Than</option>
          <option value="lt">Less Than</option>
        </select>
      </div>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => setValue(e.target.value)}
        className="border p-1 rounded w-full"
        placeholder="Enter value"
      />
      <button
        className="bg-blue-500 text-white rounded px-3 py-1 mt-2 w-full"
        
      >
        Apply
      </button>
      </form>
    </div>,
    document.body
  );
};




export const NumderFilterFn = (row, id, filterValue) => {
    const val = parseFloat(row.getValue(id));
    const num = parseFloat(filterValue?.value);
    if (filterValue?.type === "eq") return val === num;
    if (filterValue?.type === "gt") return val > num;
    if (filterValue?.type === "lt") return val < num;
    return true;
  }