import React from "react";

export default function RingLoader({ text = "Loading..." }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4"
    >
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
        <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>

      <p className="font-google text-lg font-medium text-gray-600 tracking-wide">
        {text}
      </p>
    </div>
  );
}