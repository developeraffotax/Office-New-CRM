import { AiOutlineArrowDown, AiOutlineArrowUp, AiOutlineBarChart } from "react-icons/ai";

export const SummaryCard = ({ title, value, subValue, prevValue, prevSubValue, bg = "bg-white", border = "border-gray-200", text = "text-gray-700",  }) => {


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






 

  const { change: valueChange, isPositive: isValuePositive } = getPercentageChange(value, prevValue);
  const { change: subValueChange, isPositive: isSubValuePositive } = getPercentageChange(subValue, prevSubValue);


return (
 













<div
  className={`relative w-full   p-4 rounded-xl border ${bg} ${border} hover:shadow-md transition-all duration-300 group cursor-pointer shadow-md   hover:scale-[1.1]  `}
>
  {/* Header */}
  <div className="w-full flex items-center justify-between mb-6">
    <div className={`text-sm font-semibold uppercase tracking-wider ${text}`}>
      {title}
    </div>
    <AiOutlineBarChart className="text-gray-400 group-hover:text-black" size={18} />
  </div>

  {/* Main Stat Grid */}
  <div className="w-full grid grid-cols-1 gap-y-4 gap-x-4 items-start text-sm text-gray-600">
    {/* Total Clients */}
     
    <div className="w-full text-2xl font-semibold text-gray-800 flex items-center justify-center gap-2">
      {value}
      <span
        className={`text-base flex items-center gap-0.5 ${
          isValuePositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isValuePositive ? <AiOutlineArrowUp size={12} /> : <AiOutlineArrowDown size={12} />}
        {Math.abs(valueChange.toFixed(0))}%
      </span>
    </div>

    {/*SUBVALUE */}
     
    {
        subValue && (
            <div className="w-full text-2xl font-semibold text-gray-800 flex items-center justify-center gap-2">
            ${parseFloat(subValue).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            })}
            <span
                className={`text-base flex items-center gap-0.5 ${
                isSubValuePositive ? "text-green-600" : "text-red-600"
                }`}
            >
                {isSubValuePositive ? <AiOutlineArrowUp size={12} /> : <AiOutlineArrowDown size={12} />}
                {Math.abs(subValueChange.toFixed(0))}%
            </span>
            </div>
        )
    }
  </div>
</div>








)
}

