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

  const btnBase =
    "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all select-none outline-none";

  const btnActive =
    "bg-orange-600 text-white shadow-sm shadow-orange-300";

  const btnInactive =
    "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 hover:border-gray-400";

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