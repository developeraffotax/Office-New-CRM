import { useRef, useState } from "react";
import { IoClose, IoAddOutline } from "react-icons/io5";
import { TbLoader2, TbDeviceFloppy, TbFilter, TbCheck, TbPencil, TbTrash } from "react-icons/tb";
import toast from "react-hot-toast";
 
import { useClickOutside } from "../../utlis/useClickOutside";

// Enterprise Light Design
export default function SavedFiltersPanel({ page, columnFilters, onLoad,   activeFilter, setShowSavedFilters, savedFiltersHook }) {
const {savedFilters, fetchSavedFilters, saveFilter, loadingSaved, deleteFilter} = savedFiltersHook;
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  
  const ref =  useRef()
  useClickOutside(ref, () => {
    setShowSavedFilters(false);
  })

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Enter a filter name");
    if (!columnFilters.length) return toast.error("No active filters to save");
    setSaving(true);
    try {
      await saveFilter(name.trim(), page, columnFilters);
       
      toast.success("Filter view created");
      setName("");
    } catch {
      toast.error("Failed to create filter view");
    } finally {
      setSaving(false);
    }
  };


  const handleApply = (savedFilter) => {
    onLoad(savedFilter.filters, savedFilter);
 
    toast.success("Filter view applied");
  };


  return (
    <div ref={ref} className="w-[350px] font-google bg-white border   rounded-lg overflow-hidden shadow-lg shadow-slate-950/20">
      
      {/* Header - Minimal and clear */}
      <div className="px-4 py-3 bg-slate-100 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-200 rounded-lg text-slate-500">
            <TbFilter className="text-sm" />
          </div>
          <h3 className="text-[15px] font-semibold text-slate-900 ">Saved Filters</h3>
        </div>
        <span className="text-[11px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
          {savedFilters.length}
        </span>
      </div>

      {/* Save Input Row - Integrated and clean */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/50">
        <div className="relative flex items-center">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Save New Filter..."
            className="w-full text-[12px] pl-3 pr-10 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 outline-none transition"
          />
          <button 
            onClick={handleSave} 
            disabled={saving || !name.trim()}
            className="absolute right-1.5 p-1 text-slate-400 hover:text-orange-600 disabled:opacity-30 rounded-lg transition"
            title="Create view"
          >
            {saving ? <TbLoader2 className="animate-spin text-sm" /> : <IoAddOutline className="text-base" />}
          </button>
        </div>
      </div>

      {/* List - Focused on scannability */}
      <div className="max-h-[260px] overflow-y-auto divide-y divide-slate-100/70">
        {savedFilters.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 px-5 text-center text-slate-400">
            <TbFilter className="text-2xl" />
            <p className="text-[12px]">No filters saved yet.</p>
          </div>
        ) : (
          savedFilters.map((f) => {
            
            const isActive = activeFilter?._id === f._id;
            return (
              <div
                
                key={f._id}
                className={`group flex items-center gap-3 px-4 py-2.5 transition  ${isActive ? 'bg-orange-50/70' : 'hover:bg-slate-50'}`}
              >
                {/* Meta Info */}
                <div onClick={() => handleApply(f)} className="flex-1 min-w-0 cursor-pointer">
                  <div className="flex items-center gap-2 mb-0.5 truncate">
                    <span className={`text-[12px] font-semibold truncate ${isActive ? 'text-orange-700' : 'text-slate-800'}`}>
                      {f.name}
                    </span>
                    {isActive && (
                      <span className="flex-shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase tracking-wide">
                        Applied
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {f.filters.length} filters
                    
                  </p>
                </div>

                {/* Inline Actions (Hidden on mobile/default, visible on hover) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition  ">
                  {/* <button
                    onClick={() => handleApply(f.filters)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-slate-300 transition"
                  >
                    Apply
                  </button> */}
                  <button
                    onClick={() => deleteFilter(f._id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete view"
                  >
                    <TbTrash className="w-5 h-5 " />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Optional Footer Action */}
      {/* <div className="p-2 border-t border-slate-100 bg-slate-50/50">
          <button className="w-full text-center text-[11px] text-slate-500 hover:text-slate-800 transition">Manage all views</button>
      </div> */}
    </div>
  );
}