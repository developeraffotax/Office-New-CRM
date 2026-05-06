import { useEffect, useRef } from "react";

export function OtpInput({ value, onChange, shake }) {
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const digits = value.split("").concat(Array(4).fill("")).slice(0, 4);

  useEffect(() => { refs[0].current?.focus(); }, []);

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    if (!char) return;
    const next = [...digits];
    next[i] = char;
    onChange(next.join(""));
    if (i < 3) refs[i + 1].current?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      if (next[i]) {
        next[i] = "";
        onChange(next.join(""));
      } else if (i > 0) {
        next[i - 1] = "";
        onChange(next.join(""));
        refs[i - 1].current?.focus();
      }
      return;
    }
    if (e.key === "ArrowLeft" && i > 0) refs[i - 1].current?.focus();
    if (e.key === "ArrowRight" && i < 3) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length) {
      onChange(pasted.padEnd(4, "").slice(0, 4));
      refs[Math.min(pasted.length, 3)].current?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center mb-5">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          style={shake ? { animation: "shake 0.35s ease" } : {}}
          className={`
            w-14 h-16 text-center text-3xl font-bold rounded-xl outline-none
            border transition-all duration-200
            ${d
              ? "border-orange-500/60 bg-orange-500/10 text-orange-300"
              : "bg-white/[0.04] border-black/20 text-orange-400 focus:border-orange-500/60 focus:bg-orange-500/[0.06]"
            }
          `}
        />
      ))}
    </div>
  );
}