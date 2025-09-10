import React, { useEffect, useState } from "react";

export const createProgressColumn = () => ({
  accessorKey: "progress",
  minSize: 100,
  maxSize: 600,
  size: 450,
  grow: true,
  Header: ({ column }) => {
    return (
      <div className="flex flex-col gap-[2px]">
        <span
          className="ml-1 cursor-pointer"
          title="Clear Filter"
          onClick={() => {
            column.setFilterValue("");
          }}
        >
          Progress
        </span>
        <select
          value={column.getFilterValue() || ""}
          onChange={(e) => {
            column.setFilterValue(e.target.value);
          }}
          className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
        >
          <option value="">Select</option>
          <option value="20">0-20%</option>
          <option value="40">21-40%</option>
          <option value="60">41-60%</option>
          <option value="80">61-80%</option>
          <option value="100">81-100%</option>
          <option value="greater">Greater than 100%</option>
        </select>
      </div>
    );
  },
  Cell: ({ row }) => {
    const achievement = parseFloat(row.original.achievement) || 0;
    const initialAchievedCount = parseFloat(row.original.achievedCount) || 0;

    const [currentProgress, setCurrentProgress] = useState(0);

    const calculateProgress = () =>
      achievement > 0 ? ((currentProgress / achievement) * 100).toFixed(2) : 0;

    const progressValue = calculateProgress();

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentProgress((prev) => {
          if (prev >= initialAchievedCount) {
            clearInterval(interval);
            return initialAchievedCount;
          }
          return prev + Math.max(initialAchievedCount / 20, 1);
        });
      }, 100);

      return () => clearInterval(interval);
    }, [initialAchievedCount]);

    return (
      <div className="w-full flex items-center justify-start h-[2.5rem] bg-gray-300 rounded-md overflow-hidden">
        <div className="bg-white border rounded-md p-1 shadow-md drop-shadow-md w-full h-full">
          <div
            style={{
              width: `${progressValue > 100 ? 100 : progressValue}%`,
              background:
                progressValue >= 100
                  ? "linear-gradient(90deg, #00E396, #00C853)"
                  : "linear-gradient(90deg, #FF4560, #FF8A65)",
              transition: "width 0.4s ease-in-out",
            }}
            className={`h-full flex items-center justify-center ${
              progressValue < 15 ? "text-black" : "text-white"
            } font-semibold rounded-md shadow-md`}
          >
            <span className="px-2 text-xs">{progressValue}%</span>
          </div>
        </div>
      </div>
    );
  },
  filterFn: (row, columnId, filterValue) => {
    const achievement = parseFloat(row.original.achievement) || 0;
    const initialAchievedCount = parseFloat(row.original.achievedCount) || 0;
    const progressValue = achievement > 0 ? (initialAchievedCount / achievement) * 100 : 0;
    const ranges = {
      20: [0, 20],
      40: [21, 40],
      60: [41, 60],
      80: [61, 80],
      100: [81, 100],
    };
    if (filterValue === "greater") return progressValue > 100;
    const range = ranges[filterValue];
    if (!range) return true;
    const [min, max] = range;
    return progressValue >= min && progressValue <= max;
  },
  enableColumnFilter: true,
});

export default createProgressColumn;


