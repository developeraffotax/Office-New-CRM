export default function ToolbarButton({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="p-1.5 hover:bg-gray-100 rounded"
    >
      {children}
    </button>
  );
}
