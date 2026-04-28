import { useEffect, useState } from "react";
import axios from "axios";
 // adjust path
import { LuClock } from "react-icons/lu";
import { formatTo12Hour } from "../../utlis/formatTo12Hour";
import { CiEdit } from "react-icons/ci";
import { isAdmin } from "../../utlis/isAdmin"; 
import { useSelector } from "react-redux";


/**
 * CUSTOM SVG ICONS
 * Replacing lucide-react dependencies with inline SVGs for compatibility.
 */
const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const IconSettings = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const IconSave = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

const IconAlert = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

const IconLoading = () => (
  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
);









 function AdminShiftSettings({ onClose, onUpdate, currentShift }) {
  const [shift, setShift] = useState({
    startTime: "",
    endTime: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // fetch shift
  const fetchShift = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/officeshift`);

      if (data?.shift) {
        setShift({
          startTime: data.shift.startTime,
          endTime: data.shift.endTime,
        });
      }
    } catch (err) {
      console.error("Fetch shift error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShift();
  }, []);

  // update shift
  const handleSave = async () => {
    try {
      setSaving(true);

      await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/officeshift`, shift);

      alert("Shift updated successfully");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update shift");
    } finally {
      setSaving(false);
    }
  };
 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800">
            <span className="text-orange-600"><IconSettings /></span>
            <h2 className="font-bold text-lg">Shift Configuration</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600 shadow-sm"
          >
            <IconX />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
              <input
                type="time"
                value={shift.startTime}
                onChange={(e) => setShift({ ...shift, startTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-slate-700 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</label>
              <input
                type="time"
                value={shift.endTime}
                onChange={(e) => setShift({ ...shift, endTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-slate-700 font-medium"
              />
            </div>
          </div>

           

          
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
          >
            {saving ? <IconLoading /> : <IconSave />}
            {saving ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}





























export default function ShiftStatus() {


   const auth = useSelector((state) => state.auth.auth);



  const [shift, setShift] = useState(null);

  const [isEditing, setIsEditing] = useState(false)

  const fetchShift = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/officeshift`
      );
      setShift(data.shift);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShift();
  }, []);

  if (!shift) return null;


  return (
    <div className="">
      <div className="inline-flex items-center gap-3 pl-3 pr-2 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 group">
        {/* Status Indicator Dot + Icon */}
        <div className="relative">
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
          <div className="p-1.5 bg-orange-50 rounded-full text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 flex items-center justify-center">
            <IconClock />
          </div>
        </div>

        {/* Text Details */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-0.5">
            Office Shift
          </span>
          <span className="text-[12px] font-bold text-slate-700 leading-none">
            {formatTo12Hour(shift?.startTime)} — {formatTo12Hour(shift?.endTime)}
          </span>
        </div>

        {/* Admin Action */}
        {isAdmin(auth) && (
          <button
            onClick={() => setIsEditing(true)}
            className="ml-1 p-1.5 rounded-full text-slate-300 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 flex items-center justify-center"
            title="Edit Shift"
          >
            <IconSettings />
          </button>
        )}
      </div>

      {/* Modern Modal Overlay */}
      {isAdmin(auth) && isEditing && (
        <AdminShiftSettings 
          currentShift={shift} 
          onClose={() => setIsEditing(false)} 
          onUpdate={(newShift) => setShift(newShift)}
        />
      )}
    </div>
  );
}