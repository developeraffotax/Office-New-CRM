import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import { FiX, FiSend, FiUser, FiMail, FiBriefcase, FiInfo, FiTag, FiLayers } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useEscapeKey } from "../../../utlis/useEscapeKey";




const leadSource = [
  "Upwork",
  "Fiverr",
  "PPH",
  "Referral",
  "Partner",
  "Google",
  "Facebook",
  "LinkedIn",
  "CRM",
  "Existing",
  "Other",
];
const stages = ["Interest", "Decision", "Action"];
// const brands = ["Affotax", "Outsource", "OTL"];
const sources = ["Invitation", "Proposal", "Website"];
const departments = [
  "Bookkeeping",
  "Payroll",
  "VAT Return",
  "Accounts",
  "Personal Tax",
  "Company Sec",
  "Address",
  "Billing",
];



export default function CreateLeadModal({
  createLeadModal,
  setCreateLeadModal,
  users,
  myCompany,
}) {
  const [form, setForm] = useState({
     

    companyName: "",
    clientName: "",
    email: "",
    Note: "",
    number: "",
    value: "",

    jobHolder: "",
    department: "",

    stage: "",
    source: "",
    lead_Source: "",

    followUpDate: "",
    jobDeadline: "",
    yearEnd: "",

  });


  const [loading, setLoading] = useState(false);
 

  const { user } = useSelector((state) => state.auth.auth);

  useEscapeKey(() => {
    setCreateLeadModal({ isOpen: false, form: {} });
  });

 

  useEffect(() => {
    
    if (createLeadModal?.form) {
      setForm(createLeadModal.form);
    }
  }, [createLeadModal]);

 
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
         `${process.env.REACT_APP_API_URL}/api/v1/leads/create/lead`,
        {
          ...form,
          brand:
            myCompany?.charAt(0).toUpperCase() + myCompany?.slice(1),
           
        }
      );

      toast.success("Lead created successfully");
      setCreateLeadModal({ isOpen: false, form: {} });
      setForm({
        
        companyName: "",
        clientName: "",
        email: "",
        subject: "",
        assignedTo: "",
        source: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-gray-50 text-gray-700";
  const labelStyle =
    "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 ml-1 flex items-center gap-1";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mt-16 border border-gray-100 relative">
        <div className="absolute bottom-6 right-6 flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">
          <FiLayers /> {myCompany}
        </div>

        {/* Header */}
        <div className="px-8 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Create New Lead</h2>
          <button
            onClick={() => setCreateLeadModal(p => ({ ...p, isOpen: false }))}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
          >
            <FiX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2">

          {/* ================= LEFT COLUMN ================= */}
          <div className="p-8 space-y-6">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <FiInfo className="text-orange-500" /> Lead Details
            </h3>

            {/* Company / Client */}
            <div className="grid grid-cols-2 gap-4">
              <input
                name="companyName"
                placeholder="Company Name"
                value={form.companyName}
                onChange={handleChange}
                className={inputStyle}
              />
              <input
                name="clientName"
                placeholder="Client Name"
                value={form.clientName}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>


            {/* Email / Phone */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className={inputStyle}
            />



            <div className="grid grid-cols-2 gap-4">

              {/* Value */}
              <input
                name="value"
                placeholder="Lead Value"
                value={form.value}
                onChange={handleChange}
                className={inputStyle}
              />
              <input
                type="number"
                name="number"
                placeholder="Number"
                value={form.number}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>



            {/* Notes */}
            <textarea
              name="Note"
              placeholder="Notes"
              rows={3}
              value={form.Note}
              onChange={handleChange}
              className={`${inputStyle} resize-none`}
            />

            {/* Dates */}
            <div className="grid grid-cols-1 gap-3">



              <div>
                <label className={labelStyle}>Follow Up Date</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={form.followUpDate}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Year End</label>
                <input
                  type="date"
                  name="yearEnd"
                  value={form.yearEnd}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>


              <div>
                <label className={labelStyle}>Job Deadline</label>
                <input
                  type="date"
                  name="jobDeadline"
                  value={form.jobDeadline}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>



            </div>


          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="p-8 space-y-6 bg-gray-50 border-l">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <FiUser className="text-orange-500" /> Assignment  
            </h3>

           
            {/* Job Holder */}
            <select
              name="jobHolder"
              value={form.jobHolder}
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">Job Holder</option>
              {users.map(u => (
                <option key={u._id} value={u.name}>{u.name}</option>
              ))}
            </select>

            {/* Department */}
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">Select Department</option>
              {
                departments.map((d) => <option value={d}>{d}</option>)
              }
            </select>


            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <FiUser className="text-orange-500" /> Sources
            </h3>


            {/* Stage / Status */}
            <div className="grid grid-cols-2 gap-4">
              <select
                name="stage"
                value={form.stage}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="">Select Stage</option>
                {
                  stages.map((s) => <option value={s}>{s}</option>)
                }
              </select>

              <select
                name="source"
                value={form.source}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="">Select Source</option>
                {
                  sources.map((s) => <option value={s}>{s}</option>)
                }
              </select>
            </div>

            {/* Source / Brand */}


            <select
              name="lead_Source"
              value={form.lead_Source}
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">Select Lead Source</option>
              {
                leadSource.map((s) => <option value={s}>{s}</option>)
              }
            </select>




            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500"
            >
              {loading ? "Creating..." : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}
