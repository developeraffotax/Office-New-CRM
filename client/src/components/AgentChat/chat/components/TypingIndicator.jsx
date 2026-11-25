// Shown before the first token arrives (and between tool calls).
export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2" role="status" aria-label="Assistant is thinking">
      <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:300ms]" />
      <span className="ml-2 animate-pulse text-sm text-gray-400">Thinking…</span>
    </div>
  );
}
