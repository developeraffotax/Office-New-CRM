
import { HiOutlineRefresh } from "react-icons/hi";


const statusConfig = {
  progress:  { bg: "#3b82f6", dim: "#1d4ed8", glow: "rgba(59,130,246,0.5)",  soft: "rgba(59,130,246,0.12)",  label: "In Progress" },
  completed: { bg: "#22c55e", dim: "#15803d", glow: "rgba(34,197,94,0.5)",   soft: "rgba(34,197,94,0.12)",   label: "Completed"   },
  inactive:  { bg: "#ef4444", dim: "#b91c1c", glow: "rgba(239,68,68,0.5)",   soft: "rgba(239,68,68,0.12)",   label: "Inactive"    },
  due:       { bg: "#22c55e", dim: "#15803d", glow: "rgba(34,197,94,0.5)",   soft: "rgba(34,197,94,0.12)",   label: "Due"         },
  overdue:   { bg: "#ef4444", dim: "#b91c1c", glow: "rgba(239,68,68,0.5)",   soft: "rgba(239,68,68,0.12)",   label: "Overdue"     },
  upcoming:  { bg: "#6b7280", dim: "#374151", glow: "rgba(107,114,128,0.5)", soft: "rgba(107,114,128,0.12)", label: "Upcoming"    },
};
 
const RefreshIcon = ({ spin, size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: spin ? "spin 0.75s linear infinite" : "none", display: "block", flexShrink: 0 }}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export const RefreshButton  = ( { status, isLoad, onClick }) => {
  const c = statusConfig[status];
  return (
    <button onClick={onClick} title="Refresh" style={{
      position: "relative", display: "inline-flex", alignItems: "center",
      justifyContent: "center", width: 36, height: 36, borderRadius: 7,
      background: `linear-gradient(135deg, ${c.bg} 0%, ${c.dim} 100%)`,
      border: "none", cursor: "pointer", overflow: "hidden",
      boxShadow: `0 1px 4px ${c.glow}, inset 0 1px 0 rgba(255,255,255,0.18)`,
      transition: "transform 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      {isLoad && (
        <span style={{
          position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)",
          animation: "shimmer 1.1s ease-in-out infinite",
        }} />
      )}
      <RefreshIcon spin={isLoad} size={16} color="#fff" />
    </button>
  );
}
 

