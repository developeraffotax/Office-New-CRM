import { SparklesIcon } from "./Icons.jsx";

export default function Avatar({ size = "h-8 w-8", iconSize = "h-4 w-4", pulse = false }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full text-white shadow-sm ring-4 ring-orange-100/70 ${size} ${pulse ? "animate-pulse" : ""}`}
      style={{ background: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)" }}
    >
      <SparklesIcon className={iconSize} />
    </div>
  );
}
