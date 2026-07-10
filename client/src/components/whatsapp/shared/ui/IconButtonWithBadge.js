import React from "react";

const IconButtonWithBadge = ({
  icon: Icon,
  onClick,
  unreadCount = 0,
  title = "",
  className = "",
  badgeClass = "",
  max = 99,
  iconClassName = "", // Added to style icons directly (e.g., size-3.5)
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`relative rounded flex items-center justify-center transition-all duration-200 active:scale-95 ${className}`}
    >
      {/* Icon */}
      <Icon className={iconClassName} />

      {/* Badge */}
      {unreadCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-1 ring-white animate-in zoom-in ${badgeClass}`}
        >
          {unreadCount > max ? `${max}+` : unreadCount}
        </span>
      )}
    </button>
  );
};

export default IconButtonWithBadge;