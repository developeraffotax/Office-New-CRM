import { useState } from "react";

export default function FollowupDateFilter({ setColumnFromOutsideTable }) {
  const [active, setActive] = useState(null);

  const handleClick = (value) => {
    if (active === value) {
      setActive(null);
      setColumnFromOutsideTable("followUpDate", undefined);
    } else {
      setActive(value);
      setColumnFromOutsideTable("followUpDate", value);
    }
  };

  const btnBase =
    "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all select-none outline-none";

  const btnActive =
    "bg-orange-600 text-white shadow-sm shadow-orange-300 ";
  const btnInactive =
    "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 hover:border-gray-400";

  return (
    <div className="flex items-center gap-4  ">
      <button
        className={`${btnBase} ${active === "Expired" ? btnActive : btnInactive}`}
        onClick={() => handleClick("Expired")}
        title="Expired"
      >
        E
      </button>

      <button
        className={`${btnBase} ${active === "Today" ? btnActive : btnInactive}`}
        onClick={() => handleClick("Today")}
        title="Today"
      >
        T
      </button>

      <button
        className={`${btnBase} ${active === "Tomorrow" ? btnActive : btnInactive}`}
        onClick={() => handleClick("Tomorrow")}
        title="Tomorrow"
      >
        TM
      </button>
    </div>
  );
}
