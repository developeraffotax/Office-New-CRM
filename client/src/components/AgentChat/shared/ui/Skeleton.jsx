// Pulsing placeholder block. Size it with className (e.g. "h-4 w-32").
export default function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200/70 ${className}`} aria-hidden="true" />;
}
