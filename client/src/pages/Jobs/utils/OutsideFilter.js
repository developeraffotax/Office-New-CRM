import { useMemo } from "react";

export default function OutsideFilter({
  columnFilters = [],
  setColumnFromOutsideTable,
  title,
}) {
  // ✅ Derive active preset from MRT filters
  const activePreset = useMemo(() => {
    const filter = columnFilters.find(
      (f) => f.id === title
    );

    if (filter?.value?.type === "preset") {
      return filter.value.value;
    }

    return null;
  }, [columnFilters, title]);

  const handleClick = (value) => {
    if (activePreset === value) {
      // Clear filter
      setColumnFromOutsideTable(title, undefined);
    } else {
      // Apply preset filter (NEW STRUCTURE)
      setColumnFromOutsideTable(title, {
        type: "preset",
        value,
      });
    }
  };


// Added 'border' here so the button size stays consistent
  const btnBase =
    "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all select-none outline-none border-2";

  // Removed solid background, added orange text, border, and a subtle ring for a crisp active state
  const btnActive =
    "bg-orange-50 text-orange-600 border-orange-500 shadow-sm";

  // Removed the duplicate 'border' class since it's now in btnBase
  const btnInactive =
    "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400";


    
  return (
    <div className="flex items-center gap-4">
      <button
        className={`${btnBase} ${
          activePreset === "Expired"
            ? btnActive
            : btnInactive
        }`}
        onClick={() => handleClick("Expired")}
        title="Expired"
      >
        E
      </button>

      <button
        className={`${btnBase} ${
          activePreset === "Today"
            ? btnActive
            : btnInactive
        }`}
        onClick={() => handleClick("Today")}
        title="Today"
      >
        T
      </button>

      <button
        className={`${btnBase} ${
          activePreset === "Tomorrow"
            ? btnActive
            : btnInactive
        }`}
        onClick={() => handleClick("Tomorrow")}
        title="Tomorrow"
      >
        TM
      </button>

      <button
        className={`${btnBase} ${
          activePreset === "Upcoming"
            ? btnActive
            : btnInactive
        }`}
        onClick={() => handleClick("Upcoming")}
        title="Upcoming"
      >
        UP
      </button>
    </div>
  );
}