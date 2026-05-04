export function Toaster({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`
            px-4 py-2.5 rounded-lg text-[13px] font-mono shadow-2xl
            border-l-4 text-white animate-[slideUp_0.2s_ease]
            ${t.type === "error"
              ? "bg-red-950 border-red-500"
              : "bg-[#f3f2ef] border-violet-500"}
          `}
          style={{ color: t.type === "error" ? "#fca5a5" : "#1a1916" }}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
