import { Icon } from "./Icon";

export function Btn({ icon, title, onClick, active, accent, danger }) {
  const base = "flex items-center justify-center p-[5px] rounded-[7px] border cursor-pointer transition-all duration-150";

  const variant = danger
    ? "border-transparent text-red-500 bg-transparent hover:bg-red-950 hover:text-red-400 hover:border-red-900"
    : accent
    ? `border-transparent text-amber-400 bg-transparent hover:text-amber-300`
    : active
    ? "border-violet-600 text-violet-400 bg-[#1e1040] hover:bg-[#250f5a] hover:text-violet-300"
    : "border-[#e4e2dc] text-[#555] bg-transparent hover:bg-[#f3f2ef] hover:text-[#888] hover:border-[#333]";

  return (
    <button onClick={onClick} title={title} className={`${base} ${variant}`}>
      <Icon name={icon} size={14} />
    </button>
  );
}
