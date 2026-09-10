import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  IoCalendarOutline,
  IoChevronBack,
  IoChevronForward,
  IoTimeOutline,
  IoFlashOutline,
} from "react-icons/io5";
import {
  addMonths,
  subMonths,
  addDays,
  addWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
  format,
  setHours,
  setMinutes,
} from "date-fns";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
// full granularity — easier to hit any time
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date & time",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  const selectedDate = useMemo(() => {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }, [value]);

  const [hour, setHour] = useState(selectedDate ? selectedDate.getHours() : 9);
  const [minute, setMinute] = useState(
    selectedDate ? selectedDate.getMinutes() : 0
  );

  // Sync internal state when value changes externally
  useEffect(() => {
    if (selectedDate) {
      setHour(selectedDate.getHours());
      setMinute(selectedDate.getMinutes());
      setViewMonth(selectedDate);
    }
  }, [selectedDate]);

  // ---- positioning ----
  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 380;
    const popoverHeight = 420;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldFlip = spaceBelow < popoverHeight && rect.top > popoverHeight;

    // keep inside viewport horizontally
    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - popoverWidth - 8);
    }

    setCoords({
      top: shouldFlip ? rect.top - popoverHeight - 8 : rect.bottom + 8,
      left,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateCoords();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = () => updateCoords();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [open]);

  // Auto-scroll the hour/minute lists to the selected item when opening
  useLayoutEffect(() => {
    if (!open) return;
    const scrollTo = (container, index, itemHeight) => {
      if (!container) return;
      container.scrollTop = Math.max(
        0,
        index * itemHeight - container.clientHeight / 2 + itemHeight / 2
      );
    };
    // small delay so the popover is laid out
    const t = setTimeout(() => {
      scrollTo(hourListRef.current, HOURS.indexOf(hour), 30);
      scrollTo(minuteListRef.current, MINUTES.indexOf(minute), 30);
    }, 0);
    return () => clearTimeout(t);
  }, [open, hour, minute]);

  // ---- outside click / escape ----
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (
        triggerRef.current?.contains(e.target) ||
        popoverRef.current?.contains(e.target)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [open]);

  // ---- emit ----
  const emit = (date, h, m) => {
    if (!date) return;
    const merged = setMinutes(setHours(date, h), m);
    onChange?.(format(merged, "yyyy-MM-dd'T'HH:mm"));
  };

  // Selecting a day keeps current hour/minute; if none selected, use defaults
  const handleDaySelect = (day) => {
    emit(day, hour, minute);
  };

  // Selecting an hour/minute when no date is chosen defaults to today
  const handleHourSelect = (h) => {
    setHour(h);
    const base = selectedDate ?? new Date();
    emit(base, h, minute);
  };

  const handleMinuteSelect = (m) => {
    setMinute(m);
    const base = selectedDate ?? new Date();
    emit(base, hour, m);
  };

  const handleClear = () => {
    onChange?.("");
    setOpen(false);
  };

  const handleNow = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    setHour(h);
    setMinute(m);
    setViewMonth(now);
    emit(now, h, m);
  };

  // Quick picks
  const quickPick = (date) => {
    setViewMonth(date);
    emit(date, hour, minute);
  };

  const today = startOfDay(new Date());
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth));
    const end = endOfWeek(endOfMonth(viewMonth));
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  // 12-hour label for hour column
  const hourLabel = (h) => {
    const suffix = h < 12 ? "AM" : "PM";
    const display = h % 12 === 0 ? 12 : h % 12;
    return { main: pad(h), sub: `${display} ${suffix}` };
  };

  const popover = open
    ? createPortal(
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
          }}
          className="rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-400/40 overflow-hidden animate-slide-down w-[380px] max-w-[calc(100vw-16px)]"
        >
          {/* Header preview + quick picks */}
          <div className="px-3 py-2.5 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-rose-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <IoTimeOutline size={12} className="text-orange-500" />
                {selectedDate
                  ? format(selectedDate, "EEE, MMM d • h:mm a")
                  : "No date selected"}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => quickPick(today)}
                  className="text-[10px] font-semibold text-orange-600 bg-white hover:bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-md transition"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => quickPick(addDays(today, 1))}
                  className="text-[10px] font-semibold text-orange-600 bg-white hover:bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-md transition"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => quickPick(addWeeks(today, 1))}
                  className="text-[10px] font-semibold text-orange-600 bg-white hover:bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-md transition"
                >
                  +1 wk
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row">
            {/* Calendar */}
            <div className="p-3 w-[260px] mx-auto sm:mx-0">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                >
                  <IoChevronBack size={16} />
                </button>
                <div className="text-sm font-semibold text-slate-800">
                  {format(viewMonth, "MMMM yyyy")}
                </div>
                <button
                  type="button"
                  onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                >
                  <IoChevronForward size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="h-7 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const isOutside = !isSameMonth(day, viewMonth);
                  const isDisabled = isBefore(day, today);
                  const isSelected =
                    selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, today);

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleDaySelect(day)}
                      className={`h-9 w-9 rounded-lg text-xs font-medium transition-all duration-150 ${
                        isSelected
                          ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30"
                          : isDisabled
                          ? "text-slate-300 cursor-not-allowed"
                          : isOutside
                          ? "text-slate-300 hover:bg-slate-50"
                          : "text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                      } ${
                        isToday && !isSelected
                          ? "ring-1 ring-orange-300 text-orange-600 font-semibold"
                          : ""
                      }`}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time columns */}
            <div className="flex border-t sm:border-t-0 sm:border-l border-slate-100">
              {/* Hours */}
              <div className="flex flex-col w-[80px]">
                <div className="flex items-center justify-center gap-1 py-2 border-b border-slate-100">
                  <IoTimeOutline size={12} className="text-orange-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Hour
                  </span>
                </div>
                <div
                  ref={hourListRef}
                  className="h-[240px] overflow-y-auto p-1 scroll-smooth"
                >
                  {HOURS.map((h) => {
                    const isDisabled =
                      selectedDate &&
                      isSameDay(selectedDate, today) &&
                      h < new Date().getHours();
                    const active = hour === h;
                    const label = hourLabel(h);
                    return (
                      <button
                        key={h}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleHourSelect(h)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                          active
                            ? "bg-orange-500 text-white font-semibold shadow-sm shadow-orange-500/30"
                            : isDisabled
                            ? "text-slate-300 cursor-not-allowed"
                            : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                        }`}
                      >
                        <span>{label.main}</span>
                        <span
                          className={`text-[10px] ${
                            active ? "text-white/80" : "text-slate-400"
                          }`}
                        >
                          {label.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minutes */}
              <div className="flex flex-col w-[72px] border-l border-slate-100">
                <div className="flex items-center justify-center py-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Min
                  </span>
                </div>
                <div
                  ref={minuteListRef}
                  className="h-[240px] overflow-y-auto p-1 scroll-smooth"
                >
                  {MINUTES.map((m) => {
                    const active = minute === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleMinuteSelect(m)}
                        className={`w-full text-xs py-1.5 rounded-lg transition-colors ${
                          active
                            ? "bg-orange-500 text-white font-semibold shadow-sm shadow-orange-500/30"
                            : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                        }`}
                      >
                        {pad(m)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 bg-slate-50/60">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Clear
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNow}
                className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
              >
                <IoFlashOutline size={12} />
                Now
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-1.5 rounded-lg shadow-sm shadow-orange-500/20 hover:from-orange-600 hover:to-rose-600 transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2 h-10 px-3 rounded-xl border text-sm text-left transition-all duration-200 ${
          open
            ? "border-orange-400 ring-2 ring-orange-400/40 bg-white"
            : "border-orange-200 bg-white hover:border-orange-300"
        } ${selectedDate ? "text-slate-800" : "text-slate-400"}`}
      >
        <IoCalendarOutline size={16} className="text-orange-500 shrink-0" />
        <span className="truncate">
          {selectedDate
            ? format(selectedDate, "EEE, MMM d • h:mm a")
            : placeholder}
        </span>
      </button>

      {popover}
    </div>
  );
}