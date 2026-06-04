import React, { useState, useRef, useEffect } from 'react';

// ─── Icons ──────────────────────────────────────────────────────────────────
const IconSliders = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
    <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="2" fill="currentColor" stroke="none"/>
  </svg>
);

const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconChevron = ({ open }) => (
  <svg 
    width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ─── Data & Helpers ─────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: '', label: 'All', dot: 'bg-slate-300' },
  { value: 'progress', label: 'Progress', dot: 'bg-amber-500' },
  { value: 'completed', label: 'Completed', dot: 'bg-emerald-500' },
];

const SENDER_OPTIONS = [
  { value: '', label: 'Everyone', glyph: '⊛', glyphColor: 'text-slate-400', bgColor: 'transparent' },
  { value: 'me', label: 'Sent by Me', glyph: 'A', bgColor: 'bg-orange-400' },
  { value: 'client', label: 'Sent by Client', glyph: 'C', bgColor: 'bg-blue-500' },
];

const hasActiveFilters = (filters) => Object.values(filters).some(Boolean);

const buildLabel = (filters) => {
  const parts = [];
  if (filters.status) parts.push(filters.status === 'progress' ? 'Progress' : 'Completed');
  if (filters.lastMessageBy) parts.push(filters.lastMessageBy === 'me' ? 'Me' : 'Client');
  if (filters.category) parts.push(filters.category);
  return parts.join(' · ');
};

// ─── Main Component ──────────────────────────────────────────────────────────
const UnifiedThreadFilters = ({ filters = {}, categories = [], handleUpdate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const active = hasActiveFilters(filters);

  return (
    /* 1. Apply font-inter here once. All children inherit it. */
    <div className="relative inline-block font-inter" ref={ref}>
      
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-140 outline-none 
          
          ${open ? 'bg-slate-50 border-slate-400 shadow-md' : ''}
        `}
      >
        <span className={`
          flex items-center justify-center w-5 h-5 rounded-[5px] transition-colors duration-140
          ${active ? 'bg-blue-100 text-blue-500' : 'bg-slate-100 text-slate-400'}
        `}>
          <IconSliders />
        </span>
        
        {/* <span className={`text-[11.5px] font-semibold uppercase tracking-wide transition-colors ${active ? 'text-blue-600' : 'text-slate-400'}`}>
          Filter
        </span> */}

        {active && (
          <>
            <span className="w-px h-3 bg-slate-200" />
            <span className="text-[11.5px] font-semibold text-blue-800 max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">
              {buildLabel(filters)}
            </span>
          </>
        )}

        <span className={`${active ? 'text-blue-300' : 'text-slate-300'}`}>
          <IconChevron open={open} />
        </span>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-[220px] z-[200] bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          <div className="px-3 pt-2.5 pb-1 text-[9.5px] font-bold tracking-widest text-slate-400 uppercase">Status</div>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`flex items-center gap-2.5 px-3 py-1.5 w-full text-left transition-colors ${filters.status === opt.value ? 'bg-blue-50' : 'bg-transparent hover:bg-slate-50'}`}
              onClick={() => handleUpdate({ status: opt.value })}
            >
              <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${opt.dot}`} />
              <span className={`text-xs flex-1 ${filters.status === opt.value ? 'text-blue-800 font-semibold' : 'text-slate-500 font-medium'}`}>
                {opt.label}
              </span>
              {filters.status === opt.value && <span className="text-blue-500 shrink-0"><IconCheck /></span>}
            </button>
          ))}

          <div className="h-px bg-slate-100 my-1" />

          <div className="px-3 pt-2.5 pb-1 text-[9.5px] font-bold tracking-widest text-slate-400 uppercase">Last Message By</div>
          {SENDER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`flex items-center gap-2.5 px-3 py-1.5 w-full text-left transition-colors ${filters.lastMessageBy === opt.value ? 'bg-blue-50' : 'bg-transparent hover:bg-slate-50'}`}
              onClick={() => handleUpdate({ lastMessageBy: opt.value })}
            >
              {opt.value === '' ? (
                <span className={`w-[18px] text-[13px] text-center shrink-0 leading-none ${opt.glyphColor}`}>{opt.glyph}</span>
              ) : (
                <span className={`flex items-center justify-center w-[16px] h-[16px] rounded-full text-[9px] font-bold text-white shrink-0 ${opt.bgColor}`}>
                  {opt.glyph}
                </span>
              )}
              <span className={`text-xs flex-1 ${filters.lastMessageBy === opt.value ? 'text-blue-800 font-semibold' : 'text-slate-500 font-medium'}`}>
                {opt.label}
              </span>
              {filters.lastMessageBy === opt.value && <span className="text-blue-500 shrink-0"><IconCheck /></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnifiedThreadFilters;