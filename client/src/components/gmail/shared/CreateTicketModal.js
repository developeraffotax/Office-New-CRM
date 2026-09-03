import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import { FiX, FiSend, FiUser, FiMail, FiBriefcase, FiInfo, FiTag, FiLayers } from "react-icons/fi";
import { IoTicketOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useEscapeKey } from "../../../utlis/useEscapeKey";
import { formatTicketOption } from "../utils/createTicketModal.utils";

const TICKET_LIST_LIMIT = 50;

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "52px",
    borderRadius: "12px",
    borderColor: state.isFocused ? "#f97316" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(249, 115, 22, 0.12)" : "none",
    backgroundColor: "#f9fafb",
    "&:hover": { borderColor: "#f97316" },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "12px",
    overflow: "hidden",
    padding: "6px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: "9px",
    padding: "10px 12px",
    backgroundColor: state.isSelected ? "#fff7ed" : state.isFocused ? "#f9fafb" : "white",
    color: "#374151",
    cursor: "pointer",
  }),
  singleValue: (base) => ({ ...base, color: "#374151" }),
  placeholder: (base) => ({ ...base, color: "#9ca3af" }),
};

export default function CreateTicketModal({
  createTicketModal,
  setCreateTicketModal,
  users,
 
  onUpdate,
 
}) {
  const company = useMemo(() => createTicketModal?.companyName?.charAt(0).toUpperCase() + createTicketModal?.companyName?.slice(1), [createTicketModal?.companyName]);

  const [activeTab, setActiveTab] = useState("new"); // "new" | "existing"

  const [form, setForm] = useState({
    clientId: "",
    companyName: "",
    clientName: "",
    jobHolder: "",
    subject: "",
    email: "",
    phoneNumber: "",
    mailThreadId: "",
  });
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState([]);
  const [initialComment, setInitialComment] = useState("");

  // ---- existing-ticket search state ----
  const [searchTerm, setSearchTerm] = useState("");
  const [ticketOptions, setTicketOptions] = useState([]);
  const [searchingTickets, setSearchingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { user } = useSelector((state) => state.auth.auth);

  useEscapeKey(() => {
    setCreateTicketModal({ _id: "", isOpen: false, form: {} });
  });

  const allClientJobData = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/client/tickets/clients`);
      if (data) setJobData(data?.clients || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching clients");
    }
  };

  useEffect(() => {
    allClientJobData();
    if (createTicketModal?.form) setForm(createTicketModal.form);
  }, [createTicketModal]);

  useEffect(() => {
    if (activeTab !== "existing" || !company) return;

    const handle = setTimeout(
      async () => {
        setSearchingTickets(true);
        try {
          const { data } = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/v1/tickets/get/all`,
            {
              params: {
                company: company,
                limit: TICKET_LIST_LIMIT,
                fields: "clientName,companyName,email,subject,jobHolder,state,ticketRef",
                ...(searchTerm ? { search: searchTerm } : {}),
              },
            }
          );

          setTicketOptions(
            (data.tickets || []).map((t) => ({
              value: t._id,
              label: `#${t.ticketRef} — ${t.subject || t.clientName || t.companyName || "Untitled"}`,
              raw: t,
            }))
          );
        } catch (err) {
          toast.error(searchTerm ? "Failed to search tickets" : "Failed to load tickets");
        } finally {
          setSearchingTickets(false);
        }
      },
      searchTerm ? 350 : 0
    );

    return () => clearTimeout(handle);
  }, [searchTerm, activeTab, company]);

  const clientOptions = jobData.map((item) => ({
    value: item.id,
    label: `${item.companyName} - ${item.clientName}`,
    companyName: item.companyName,
    clientName: item.clientName,
    email: item.email,
  }));

  const selectedClient = clientOptions.find((opt) => opt.value === form.clientId) || null;

  const handleClientChange = (selectedOption) => {
    if (selectedOption) {
      setForm((prev) => ({
        ...prev,
        clientId: selectedOption.value,
        companyName: selectedOption.companyName,
        clientName: selectedOption.clientName,
        email: selectedOption.email || "",
      }));
    } else {
      setForm((prev) => ({ ...prev, clientId: "" }));
    }
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/tickets/create-ticket`, {
        ...form,
        company: company || "",
        leadId: createTicketModal?.form?.leadId || undefined,
        comments: initialComment
          ? [{ user, comment: initialComment, senderId: user.id, commentReplies: [], likes: [], status: "unread" }]
          : [],
      });


      console.log(
        "THE TICKET DATA IS", data
      )

      const newTicketId = data.ticket?._id ;
      const userId = users.find((u) => form.jobHolder === u.name)?._id;

      await onUpdate(createTicketModal._id, {
        // category: "ticket",
        userId,
        ticketId: newTicketId,
      });

      toast.success("Ticket created successfully!");
      setForm({ clientId: "", companyName: "", clientName: "", jobHolder: "", subject: "", email: "", phoneNumber: "", mailThreadId: "" });
      setCreateTicketModal((prev) => ({ ...prev, isOpen: false }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkExisting = async () => {
    if (!selectedTicket) {
      toast.error("Select a ticket first");
      return;
    }
    setLoading(true);
    try {
      await onUpdate(createTicketModal._id, {
        // category: "ticket",
        ticketId: selectedTicket.value,
      });

      toast.success("Thread linked to ticket");
      setCreateTicketModal((prev) => ({ ...prev, isOpen: false }));
      setSelectedTicket(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to link ticket");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-gray-50 text-gray-700";
  const labelStyle =
    "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 ml-1 flex items-center gap-1";
  const tabBtn = (tab, label) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
        activeTab === tab ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/20 backdrop-blur-sm font-inter">
      <div className="min-h-[80vh] bg-white shadow-2xl w-full max-w-4xl mt-12 border border-gray-100 relative animate-slide-down">
        <div className="absolute bottom-6 right-6 flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">
          <FiLayers /> {createTicketModal?.companyName}
        </div>

        <div className="px-8 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Link This Thread</h2>
          <button
            onClick={() => setCreateTicketModal((p) => ({ ...p, isOpen: false }))}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
          >
            <FiX size={22} />
          </button>
        </div>

        <div className="px-8 pt-4 flex gap-2">
          {tabBtn("new", "Create New Ticket")}
          {tabBtn("existing", "Link Existing Ticket")}
        </div>

        {activeTab === "new" && (
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-2">
            <div className="p-8 space-y-6">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
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
                  className={`${inputStyle} disabled:cursor-not-allowed disabled:bg-gray-200`}
                  required
                  disabled={form.clientId}
                />
              </div>


              <div>
                <label className={labelStyle}><FiMail /> Client Phone</label>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Enter Phone Number..."
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className={`${inputStyle} disabled:cursor-not-allowed disabled:bg-gray-200`}
                  required
                  disabled={form.clientId}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  name="companyName"
                  placeholder="Company Name"
                  value={form.companyName}
                  onChange={handleChange}
                  disabled={form.clientId}
                  className={`${inputStyle} disabled:cursor-not-allowed disabled:bg-gray-200`}
                />
                <input
                  name="clientName"
                  placeholder="Client Name"
                  value={form.clientName}
                  onChange={handleChange}
                  disabled={form.clientId}
                  className={`${inputStyle} disabled:cursor-not-allowed disabled:bg-gray-200`}
                />
              </div>

              <textarea
                rows={3}
                value={initialComment}
                onChange={(e) => setInitialComment(e.target.value)}
                placeholder="Add an initial comment..."
                className={`${inputStyle} resize-none`}
              />
            </div>

            <div className="p-8 space-y-6 bg-gray-50 border-l">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FiUser className="text-orange-500" /> Assignment
              </h3>

              <div>
                <label className={labelStyle}><FiBriefcase /> Select Client</label>
                <Select
                  value={selectedClient}
                  onChange={handleClientChange}
                  options={clientOptions}
                  placeholder="Find a client..."
                  styles={selectStyles}
                />
              </div>

              <select name="jobHolder" value={form.jobHolder} onChange={handleChange} className={inputStyle} required>
                <option value="">Job Holder</option>
                {users.map((u) => <option key={u._id} value={u.name}>{u.name}</option>)}
              </select>
              <p className="text-xs text-gray-400 italic -mt-4">* This person will be notified of the new ticket assignment.</p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "existing" && (
          <div className="p-8 space-y-6">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <IoTicketOutline className="text-orange-500" /> Find Ticket
            </h3>

            <Select
  options={ticketOptions}
  value={selectedTicket}
  onChange={setSelectedTicket}
  onInputChange={(val) => setSearchTerm(val)}
  isLoading={searchingTickets}
  filterOption={null}
  formatOptionLabel={formatTicketOption}
  placeholder="Search by subject, client, company, or ref..."
  noOptionsMessage={() =>
    searchingTickets ? "Loading..." : "No matching tickets"
  }
  styles={selectStyles}
/>

            {selectedTicket && (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-white border-b border-gray-100">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {(selectedTicket.raw.subject || selectedTicket.raw.clientName || selectedTicket.raw.companyName || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">
                          {selectedTicket.raw.subject || selectedTicket.raw.clientName || "Untitled Ticket"}
                        </h4>
                        {selectedTicket.raw.subject && (selectedTicket.raw.clientName || selectedTicket.raw.companyName) && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {selectedTicket.raw.clientName}
                            {selectedTicket.raw.clientName && selectedTicket.raw.companyName ? " • " : ""}
                            {selectedTicket.raw.companyName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {selectedTicket.raw.ticketRef && (
                        <span className="hidden sm:inline-flex px-2 py-1 rounded-md bg-gray-100 text-[10px] font-semibold text-gray-500">
                          T-{selectedTicket.raw.ticketRef}
                        </span>
                      )}
                      {selectedTicket.raw.state && (
                        <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-semibold">
                          {selectedTicket.raw.state}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100">
                  <div className="bg-white px-5 py-3.5">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Client</p>
                    <p className="text-sm font-medium text-gray-700 truncate">{selectedTicket.raw.clientName || "—"}</p>
                  </div>

                  <div className="bg-white px-5 py-3.5">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Company</p>
                    <p className="text-sm font-medium text-gray-700 truncate">{selectedTicket.raw.companyName || "—"}</p>
                  </div>

                  <div className="bg-white px-5 py-3.5 sm:col-span-2">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-700 truncate">{selectedTicket.raw.email || "No email available"}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleLinkExisting}
              disabled={loading || !selectedTicket}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 disabled:opacity-50"
            >
              {loading ? "Linking..." : "Link Thread to Ticket"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}