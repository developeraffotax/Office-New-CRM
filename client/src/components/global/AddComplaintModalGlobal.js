import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import Select from "react-select";
import { TbLoader2 } from "react-icons/tb";
import ReactQuill from "react-quill";
import { useDispatch } from "react-redux";
import { closeModal } from "../../redux/slices/globalModalSlice";

export default function AddComplaintModalGlobal({
  defaultEntityType = "",
  defaultEntityRef = "",
  defaultTask = "",
  defaultCompany = "",
  defaultClient = "",
  defaultDepartment = "",
  defaultLead = "",
  defaultAssign = "",
}) {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    entityType: defaultEntityType || "",
    entityRef: defaultEntityRef || "",
    task: defaultTask || "",
    company: defaultCompany || "",
    client: defaultClient || "",
    department: defaultDepartment || "",
    lead: "",
    assign: "",
    errorType: "",
    solution: "",
    points: "",
    note: "",
  });

  /* ===============================
     Data Fetching (Logic preserved)
  =============================== */
  const [clientCompanies, setClientCompanies] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [errorTypes, setErrorTypes] = useState([]);
  const [solutions, setSolutions] = useState([]);

  const departments = ["Bookkeeping", "Payroll", "Vat Return", "Personal Tax", "Accounts", "Company Sec", "Address"];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, errors, sols, clients] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/v1/label/complaint/labels/error`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/v1/label/complaint/labels/solutions`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/v1/client/tickets/clients`)
        ]);
        setUsersList(users.data?.users || []);
        setErrorTypes(errors.data?.labels || []);
        setSolutions(sols.data?.labels || []);
        setClientCompanies(clients.data?.clients || []);
      } catch (err) {
        console.error("Fetch error", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (defaultLead) {
      const lead = usersList.find((u) => u.name === defaultLead);
      if (lead) handleChange("lead", lead._id);
    }
    if (defaultAssign) {
      const assign = usersList.find((u) => u.name === defaultAssign);
      if (assign) handleChange("assign", assign._id);
    }
  }, [defaultLead, defaultAssign, usersList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/complaints/create/complaint`, formData);
      toast.success("Complaint successfully logged");
      dispatch(closeModal());
    } catch (error) {
      toast.error(error?.response?.data?.message || "Internal Server Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ===============================
     Modern Design Styles
  =============================== */
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '38px',
      background: 'transparent',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      fontSize: '13px',
      boxShadow: state.isFocused ? '0 0 0 1px #0f172a' : 'none',
      borderColor: state.isFocused ? '#0f172a' : '#e5e7eb',
      '&:hover': { borderColor: '#9ca3af' }
    }),
    placeholder: (base) => ({ ...base, color: '#9ca3af' })
  };

  const inputStyle = "w-full h-[38px] px-3 text-[13px] bg-white border border-gray-200 rounded-md outline-none focus:border-slate-900 transition-all duration-200 placeholder:text-gray-400";
  const labelStyle = "text-[10px] font-bold text-slate-400 uppercase tracking-[0.05em] mb-1.5 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-[6px]">
      {/* <div className="absolute inset-0" onClick={() => dispatch(closeModal())} /> */}

      <div className="relative font-google z-10 w-[95%] lg:w-[60rem]  h-[80vh] bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Modern Compact Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 ">
          <div className="flex items-center gap-2">
             
           <h1 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
  New Complaint
</h1>
          </div>
          <button 
            onClick={() => dispatch(closeModal())}
            className="p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Dual Column Body */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          
          {/* Main Panel */}
          <div className="flex-1 p-6 space-y-6 border-r border-slate-100">
            
            {/* Top Identity Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Type</label>
                <Select
                  styles={selectStyles}
                  options={[{ value: "job", label: "Job" }, { value: "task", label: "Task" }]}
                  placeholder="Select Entity..."
                  value={[{ value: "job", label: "Job" }, { value: "task", label: "Task" }].find(o => o.value === formData.entityType)}
                  onChange={(opt) => handleChange("entityType", opt?.value)}
                />
              </div>
              <div>
                <label className={labelStyle}>Reference</label>
                <input
                  className={inputStyle}
                  placeholder="ID #0000"
                  value={formData.entityRef}
                  onChange={(e) => handleChange("entityRef", e.target.value)}
                />
              </div>
            </div>

            {/* Conditional Metadata Row: Job (Client/Company/Dept on same line) */}
            {formData.entityType === "job" && (
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg animate-in slide-in-from-top-1 duration-300">
                <div>
                  <label className={labelStyle}>Company</label>
                  <Select
                    styles={selectStyles}
                    options={clientCompanies.map(c => ({ value: c.companyName, label: c.companyName }))}
                    value={{ value: formData.company, label: formData.company }}
                    onChange={(opt) => handleChange("company", opt?.value)}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Client</label>
                  <Select
                    styles={selectStyles}
                    options={clientCompanies.map(c => ({ value: c.clientName, label: c.clientName }))}
                    value={{ value: formData.client, label: formData.client }}
                    onChange={(opt) => handleChange("client", opt?.value)}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Department</label>
                  <select
                    className={inputStyle}
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                  >
                    <option value="">Select...</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Conditional Task View */}
            {formData.entityType === "task" && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                <label className={labelStyle}>Task</label>
                <input
                  className={inputStyle}
                  placeholder="Summarize the issue context..."
                  value={formData.task}
                  onChange={(e) => handleChange("task", e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className={labelStyle}>Note</label>
              <div className="   ">
                <ReactQuill
                  theme="snow"
                  className="bg-white min-h-[220px]"
                  value={formData.note}
                  onChange={(v) => handleChange("note", v)}
                  placeholder="Write complaint here..."
                  style={{ height: "16rem" }}
                />
              </div>
            </div>
          </div>

          {/* Utility Sidebar */}
          <div className="w-full lg:w-[280px] bg-slate-50/30 p-6 space-y-8">
            <div className="space-y-5">
              <h2 className="text-[12px] font-semibold text-slate-800 uppercase border-b border-slate-200 pb-2">Assignment</h2>
              <div>
                <label className={labelStyle}>Lead</label>
                <select className={inputStyle} value={formData.lead} onChange={(e) => handleChange("lead", e.target.value)}>
                  <option value="">--</option>
                  {usersList.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelStyle}>Assignee</label>
                <select className={inputStyle} value={formData.assign} onChange={(e) => handleChange("assign", e.target.value)}>
                  <option value="">--</option>
                  {usersList.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelStyle}>Impact Points</label>
                <input type="number" className={inputStyle} value={formData.points} onChange={(e) => handleChange("points", e.target.value)} />
              </div>
            </div>

            <div className="space-y-5 pt-4">
              <h2 className="text-[12px] font-semibold text-slate-800 uppercase border-b border-slate-200 pb-2">Classification</h2>
              <div>
                <label className={labelStyle}>Error Type</label>
                <select className={inputStyle} value={formData.errorType} onChange={(e) => handleChange("errorType", e.target.value)}>
                  <option value="">Select Error Type</option>
                  {errorTypes.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelStyle}>Solution</label>
                <select className={inputStyle} value={formData.solution} onChange={(e) => handleChange("solution", e.target.value)}>
                  <option value="">Select Solution</option>
                  {solutions.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-slate-100 flex justify-end gap-4 items-center">
  <button
    type="button"
    onClick={() => dispatch(closeModal())}
    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
  >
    Discard
  </button>
  
  <button
    disabled={isSubmitting}
    onClick={handleSubmit}
    className="px-6 py-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-lg hover:shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2"
  >
    {isSubmitting ? (
      <>
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Processing...
      </>
    ) : (
      "Create"
    )}
  </button>
</div>
      </div>
    </div>
  );
}