import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import { FiX, FiSend, FiUser, FiMail, FiBriefcase, FiInfo, FiTag, FiLayers } from "react-icons/fi";
import { MdOutlineConfirmationNumber } from "react-icons/md";
import { useSelector } from "react-redux";
import { IoTicketOutline } from "react-icons/io5";
import { useEscapeKey } from "../../../utlis/useEscapeKey";

export default function CreateTicketModal({ createTicketModal, setCreateTicketModal, users, myCompany }) {
  const [form, setForm] = useState({
    clientId: "",
    companyName: "",
    clientName: "",
    jobHolder: "",
    subject: "",
    email: "",
    mailThreadId: ""
  });
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState([]);
  const [initialComment, setInitialComment] = useState("");

  const { user } = useSelector((state) => state.auth.auth);

  useEscapeKey(() => {
    setCreateTicketModal({
      isOpen: false,
      form: {}
    })
  });

  const allClientJobData = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/client/tickets/clients`);
      console.log("DATA", data)
      if (data) setJobData(data?.clients || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching clients");
    }
  };

  useEffect(() => {
    allClientJobData();
    if (createTicketModal?.form) setForm(createTicketModal.form);
  }, [createTicketModal]);

  const clientOptions = jobData.map(item => ({
    value: item.id,
    label: `${item.companyName} - ${item.clientName}`,
    companyName: item.companyName,
    clientName: item.clientName,
    email: item.email,
  }));

  const selectedClient = clientOptions.find(opt => opt.value === form.clientId) || null;

  const handleClientChange = (selectedOption) => {
    if (selectedOption) {
      setForm(prev => ({
        ...prev,
        clientId: selectedOption.value,
        companyName: selectedOption.companyName,
        clientName: selectedOption.clientName,
        email: selectedOption.email || "",
      }));
    } else {
      setForm(prev => ({ ...prev, clientId: "" }));
    }
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/tickets/create-ticket`, {
        ...form,
        company: myCompany?.charAt(0).toUpperCase() + myCompany?.slice(1) || "",
        comments: initialComment
          ? [
            {
              user,
              comment: initialComment,
              senderId: user.id,
              commentReplies: [],
              likes: [],
              status: "unread",
            },
          ]
          : [],
      });
      toast.success("Ticket created successfully!");
      setForm({ clientId: "", companyName: "", clientName: "", jobHolder: "", subject: "", email: "", mailThreadId: "" });
      setCreateTicketModal(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating ticket");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none bg-gray-50/50 text-gray-700 placeholder-gray-400";
  const labelStyle = "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 ml-1 flex items-center gap-1";

  return (
    <div className="fixed inset-0 z-50 flex items-start  justify-center p-4 bg-slate-900/20 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 relative animate-badge-pop  mt-16">
        <div className="absolute bottom-6 right-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold mt-1">
          <FiLayers /> {myCompany}
        </div>
        {/* Header */}
        <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="w-full flex items-center justify-center gap-4">
            {/* <div className="p-3 bg-orange-600 rounded-xl text-white shadow-md shadow-orange-200">
               <IoTicketOutline   size={20} />
            </div> */}
            <div className="  ">

              <h2 className="text-xl font-bold text-gray-800 ">Create New Ticket  </h2>
            </div>
          </div>
          <button
            onClick={() => setCreateTicketModal(prev => ({ ...prev, isOpen: false }))}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2">

          {/* Left Column */}
          <div className="p-8 space-y-6">
            <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-4 border-b pb-2">
              <FiInfo className="text-orange-500" /> Ticket Details
            </h3>

            <div>
              <label className={labelStyle}><FiTag /> Subject</label>
              <input
                type="text"
                name="subject"
                placeholder="Summary of the issue..."
                value={form.subject}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className={labelStyle}><FiMail /> Client Email</label>
              <input
                type="email"
                name="email"
                placeholder="customer@domain.com"
                value={form.email}
                onChange={handleChange}
                className={`${inputStyle} disabled:cursor-not-allowed disabled:bg-gray-300`}
                required
                disabled={form.clientId}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelStyle}>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  disabled={form.clientId}
                  className={`${inputStyle} bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-300`}
                />
              </div>
              <div>
                <label className={labelStyle}>Client Name</label>
                <input
                  type="text"
                  name="clientName"
                  value={form.clientName}
                  onChange={handleChange}
                  disabled={form.clientId}
                  className={`${inputStyle} bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-300`}
                />
              </div>
            </div>



            <div>
              <label className={labelStyle}><FiInfo /> Initial Comment</label>
              <textarea
                rows={3}
                value={initialComment}
                onChange={(e) => setInitialComment(e.target.value)}
                placeholder="Add an initial comment..."
                className={`${inputStyle} resize-none`}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="p-8 space-y-6 bg-gray-50 border-l border-gray-100">
            <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-4 border-b pb-2">
              <FiUser className="text-orange-500" /> Assignment
            </h3>

            <div>
              <label className={labelStyle}><FiBriefcase /> Select Client</label>
              <Select
                value={selectedClient}
                onChange={handleClientChange}
                options={clientOptions}
                placeholder="Find a client..."
                className="react-select-container"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    borderColor: state.isFocused ? '#6366f1' : '#e5e7eb',
                    boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.2)' : 'none',
                    minHeight: '44px'
                  })
                }}
              />
            </div>

            <div>
              <label className={labelStyle}><FiUser /> Assign To (Job Holder)</label>
              <select
                name="jobHolder"
                value={form.jobHolder}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option value="">Select a team member</option>
                {users.map(user => (
                  <option key={user._id} value={user.name}>
                    {user.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400 italic">
                * This person will be notified of the new ticket assignment.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-8 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white shadow-lg transition-transform
                  ${loading
                    ? "bg-orange-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-600 to-orange-500 hover:scale-105 active:scale-95"
                  }`}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSend size={20} />
                    <span className="text-base">Create Ticket</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setCreateTicketModal(prev => ({ ...prev, isOpen: false }))}
                className="w-full py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>



            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
