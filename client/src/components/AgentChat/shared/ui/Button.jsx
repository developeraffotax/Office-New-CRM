import Spinner from "./Spinner.jsx";

const VARIANTS = {
  primary: "bg-orange-500 text-white shadow-sm hover:bg-orange-600 focus-visible:ring-orange-300",
  secondary: "border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:ring-orange-200",
  ghost: "text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-200",
  danger: "text-red-600 hover:bg-red-50 focus-visible:ring-red-100",
};

const SIZES = {
  md: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-xs",
};

// `loading` shows a spinner and disables the button; the label stays visible.
export default function Button({ variant = "primary", size = "md", loading = false, disabled, icon, className = "", children, type = "button", ...rest }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}
