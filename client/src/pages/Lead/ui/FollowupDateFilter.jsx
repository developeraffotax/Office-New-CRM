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
    "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all select-none outline-none border-2";

  const btnActive =
    "bg-orange-50 text-orange-600 border-orange-500 shadow-sm";

  const btnInactive =
    "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400";


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

      <button
        className={`${btnBase} ${active === "2 days later" ? btnActive : btnInactive}`}
        onClick={() => handleClick("2 days later")}
        title="2 days later"
      >
        2D
      </button>

      <button
        className={`${btnBase} ${active === "3 days later" ? btnActive : btnInactive}`}
        onClick={() => handleClick("3 days later")}
        title="3 days later"
      >
        3D
      </button>

      <button
        className={`${btnBase} ${active === "Upcoming" ? btnActive : btnInactive}`}
        onClick={() => handleClick("Upcoming")}
        title="Upcoming"
      >
        UP
      </button>
    </div>
  );
}
