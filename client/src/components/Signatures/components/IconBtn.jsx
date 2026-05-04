import Icon from "./Icon";

export default function IconBtn({ icon, onClick, active, danger }) {
  return (
    <button
      onClick={onClick}
      className={`
        p-2 rounded-md border transition
        ${active ? "bg-purple-100 text-purple-600 border-purple-300" : "text-gray-500 border-transparent hover:bg-gray-100"}
        ${danger ? "text-red-500 hover:bg-red-50" : ""}
      `}
    >
      <Icon name={icon} size={14} />
    </button>
  );
}