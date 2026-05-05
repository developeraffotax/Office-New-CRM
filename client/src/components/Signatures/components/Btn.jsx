import { Icon } from "./Icon";

export function Btn({ icon, title, onClick, active, accent, danger }) {
  // Refined base styles with a softer rounding and subtle transitions
  const base = "flex items-center justify-center p-[6px] rounded-lg border cursor-pointer transition-all duration-200 outline-none focus:ring-2 focus:ring-orange-100";

  let variant = "";

  if (danger) {
    // Red/Danger: Clean soft red aesthetic
    variant = "border-transparent text-rose-500 bg-transparent hover:bg-rose-50 hover:text-rose-600";
  } else if (accent) {
    // Accent (Star/Default): Vibrat orange-gold focus
    variant = "border-transparent text-orange-500 bg-orange-50 hover:bg-orange-100 hover:text-orange-600 shadow-sm";
  } else if (active) {
    // Active (Toggle/Eye): Deep orange brand color
    variant = "border-orange-200 text-orange-600 bg-orange-50/80 hover:bg-orange-100 hover:border-orange-300";
  } else {
    // Default: Neutral slate that shifts to orange on hover
    variant = "border-slate-200 text-slate-500 bg-white hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50/30 shadow-sm";
  }

  return (
    <button 
      onClick={onClick} 
      title={title} 
      className={`${base} ${variant}`}
    >
      <Icon name={icon} size={15} />
    </button>
  );
}