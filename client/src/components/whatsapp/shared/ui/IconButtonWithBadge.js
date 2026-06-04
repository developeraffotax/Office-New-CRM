import React from "react";

const IconButtonWithBadge = ({
  icon: Icon,
  onClick,
  unreadCount = 0,
  title = "",
  className = "",
  badgeClass = "",
  max = 99,
  size = 20,
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group active:scale-95 ${className}`}
    >
      {/* Icon */}
      <Icon size={size} className="group-hover:fill-blue-50/10" />

      {/* Badge */}
      {unreadCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in ${badgeClass}`}
        >
          {unreadCount > max ? `${max}+` : unreadCount}
        </span>
      )}
    </button>
  );
};

export default IconButtonWithBadge;