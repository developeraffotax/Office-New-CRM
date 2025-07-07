import React from "react";
import {
  AiOutlineArrowUp,
  AiOutlineArrowDown,
  AiOutlineBarChart,
} from "react-icons/ai";

const getColorSet = (department) => {
  const sets = {
    Bookkeeping: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
    },
    Payroll: {
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      text: "text-cyan-800",
    },
    "Vat Return": {
      bg: "bg-slate-50",
      border: "border-slate-200",
      text: "text-slate-800",
    },
    "Personal Tax": {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      text: "text-indigo-800",
    },
    Accounts: {
      bg: "bg-sky-50",
      border: "border-sky-200",
      text: "text-sky-800",
    },
    "Company Sec": {
      bg: "bg-teal-50",
      border: "border-teal-200",
      text: "text-teal-800",
    },
  };

  return  {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-800",
  };
};


function getPercentageChange(current, previous) {
  if (isNaN(current) || isNaN(previous)) {
    return { change: 0, isPositive: true };
  }

  const change =
    previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;

  return {
    change,
    isPositive: change >= 0,
  };
}

const StatCard = ({ job, clientsForPastMonthOrYear }) => {
  if (job?.department === "Training" || job?.department === "CRM.Affotax") return null;

  const currentFee = parseFloat(job?.totalFee || 0);
  const previousFee = parseFloat(
    clientsForPastMonthOrYear.find((el) => el.department === job.department)?.totalFee || 0
  );

  const currentCount = job?.totalDepartmentCount || 0;
  const previousCount =
    clientsForPastMonthOrYear.find((el) => el.department === job.department)
      ?.totalDepartmentCount || 0;

  const { change: feeChange, isPositive: isFeePositive } = getPercentageChange(currentFee, previousFee);
  const { change: countChange, isPositive: isCountPositive } = getPercentageChange(currentCount, previousCount);

  const { bg, border, text } = getColorSet(job.department);

  return (
<div
  className={`relative w-full   p-2 rounded-xl border ${bg} ${border} hover:shadow-md transition-all duration-300 group cursor-pointer backdrop-blur-sm hover:scale-[1.1]`}
>
  {/* Header */}
  <div className="w-full flex items-center justify-between mb-6">
    <div className={`text-sm font-semibold uppercase tracking-wider ${text}`}>
      {job?.department}
    </div>
    <AiOutlineBarChart className="text-gray-400 group-hover:text-black" size={18} />
  </div>

  {/* Main Stat Grid */}
  <div className="w-full grid grid-cols-1 gap-y-4 gap-x-4 items-center text-sm text-gray-600">
    {/* Total Clients */}
     
    <div className="w-full text-2xl font-semibold text-gray-800 flex items-center justify-center gap-2">
      {currentCount}
      <span
        className={`text-base flex items-center gap-0.5 ${
          isCountPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isCountPositive ? <AiOutlineArrowUp size={12} /> : <AiOutlineArrowDown size={12} />}
        {Math.abs(countChange.toFixed(0))}%
      </span>
    </div>

    {/* Total Fee */}
     
    <div className="w-full text-2xl font-semibold text-gray-800 flex items-center justify-center gap-2">
      ${currentFee.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}
      <span
        className={`text-base flex items-center gap-0.5 ${
          isFeePositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isFeePositive ? <AiOutlineArrowUp size={12} /> : <AiOutlineArrowDown size={12} />}
        {Math.abs(feeChange.toFixed(0))}%
      </span>
    </div>
  </div>
</div>
  );
};

export default StatCard;
