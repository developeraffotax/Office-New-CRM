import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import { FiX, FiUser, FiInfo, FiLayers, FiSearch } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useEscapeKey } from "../../../utlis/useEscapeKey";
import { createTicket } from "../utils/createTicket";
import { useMemo } from "react";
import { formatLeadOption } from "../utils/createLeadModal.utils";

const formatDate = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

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

const LEAD_LIST_LIMIT = 50;

export default function CreateLeadModal({
  createLeadModal,
  setCreateLeadModal,
  users,
  myCompany,
  handleUpdateThread,
}) {
  const brand = useMemo(
    () => myCompany?.charAt(0).toUpperCase() + myCompany?.slice(1),
    [myCompany],
  );

  const [activeTab, setActiveTab] = useState("new"); // "new" | "existing"

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

  // ---- existing-lead search state ----
  const [searchTerm, setSearchTerm] = useState("");
  const [leadOptions, setLeadOptions] = useState([]);
  const [searchingLeads, setSearchingLeads] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const { user } = useSelector((state) => state.auth.auth);

  useEscapeKey(() => {
    setCreateLeadModal({ isOpen: false, form: {} });
  });

  useEffect(() => {
    if (createLeadModal?.form) {
      setForm((prev) => ({
        ...prev,
        ...createLeadModal.form,
        department: "Accounts",
        stage: "Interest",
        source: "Website",
        lead_Source: "Google",
        followUpDate: formatDate(new Date()),
        jobDeadline: formatDate(new Date()),
        yearEnd: formatDate(new Date()),
      }));
    }
  }, [createLeadModal]);

  // Loads the first LEAD_LIST_LIMIT leads as soon as the "existing" tab opens
  // (no search term -> backend returns an unfiltered page), then re-runs
  // debounced whenever searchTerm changes. Clearing the box back to "" falls
  // through to the same no-search branch, so the default list comes back.
  useEffect(() => {
    if (activeTab !== "existing" || !brand) return;

    const handle = setTimeout(
      async () => {
        setSearchingLeads(true);
        try {
          const { data } = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/v1/leads/get/all`,
            {
              params: {
                brand: brand,
                limit: LEAD_LIST_LIMIT,
                fields: "clientName,companyName,email,stage,jobHolder,leadRef",
                ...(searchTerm ? { search: searchTerm } : {}),
              },
            },
          );

          setLeadOptions(
            (data.leads || []).map((lead) => ({
              value: lead._id,
              label: `${
                lead.clientName || lead.companyName || "Unnamed Lead"
              } ${lead.email ? `— ${lead.email}` : ""}`,
              raw: lead,
            })),
          );
        } catch (err) {
          toast.error(
            searchTerm ? "Failed to search leads" : "Failed to load leads",
          );
        } finally {
          setSearchingLeads(false);
        }
      },
      searchTerm ? 350 : 0, // instant on tab-open, debounced once someone's typing
    );

    return () => clearTimeout(handle);
  }, [searchTerm, activeTab, brand]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ---- create a brand new lead ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/create/lead`,
        { ...form, brand: brand },
      );

      const newLeadId = data.lead?._id || data._id;
      const userId = users.find((u) => form.jobHolder === u.name)?._id;

      await handleUpdateThread(createLeadModal._id, {
        // category: "lead",
        userId,
        leadId: newLeadId,
      });

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

  // ---- link thread to an existing lead ----
  const handleLinkExisting = async () => {
    if (!selectedLead) {
      toast.error("Select a lead first");
      return;
    }
    setLoading(true);
    try {
      await handleUpdateThread(createLeadModal._id, {
        // category: "lead",
        leadId: selectedLead.value,
      });

      toast.success("Thread linked to lead");
      setCreateLeadModal({ isOpen: false, form: {} });
      setSelectedLead(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to link lead");
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
        activeTab === tab
          ? "bg-orange-500 text-white"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/20 backdrop-blur-sm font-inter  ">
      <div className="min-h-[80vh] bg-white  shadow-2xl w-full max-w-4xl mt-12 border border-gray-100 relative animate-slide-down ">
        <div className="absolute bottom-6 right-6 flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">
          <FiLayers /> {myCompany}
        </div>

        <div className="px-8 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Link This Thread</h2>
          <button
            onClick={() => setCreateLeadModal((p) => ({ ...p, isOpen: false }))}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
          >
            <FiX size={22} />
          </button>
        </div>

        <div className="px-8 pt-4 flex gap-2">
          {tabBtn("new", "Create New Lead")}
          {tabBtn("existing", "Link Existing Lead")}
        </div>

        {activeTab === "new" && (
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-2">
            <div className="p-8 space-y-6">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FiInfo className="text-orange-500" /> Lead Details
              </h3>
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
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className={inputStyle}
              />
              <div className="grid grid-cols-2 gap-4">
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
              <textarea
                name="Note"
                placeholder="Notes"
                rows={3}
                value={form.Note}
                onChange={handleChange}
                className={`${inputStyle} resize-none`}
              />
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

            <div className="p-8 space-y-6 bg-gray-50 border-l">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FiUser className="text-orange-500" /> Assignment
              </h3>
              <select
                name="jobHolder"
                value={form.jobHolder}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option value="">Job Holder</option>
                {users.map((u) => (
                  <option key={u._id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FiUser className="text-orange-500" /> Sources
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <select
                  name="stage"
                  value={form.stage}
                  onChange={handleChange}
                  className={inputStyle}
                >
                  <option value="">Select Stage</option>
                  {stages.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  className={inputStyle}
                >
                  <option value="">Select Source</option>
                  {sources.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <select
                name="lead_Source"
                value={form.lead_Source}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="">Select Lead Source</option>
                {leadSource.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Lead"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "existing" && (
          <div className="p-8 space-y-6">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <FiSearch className="text-orange-500" /> Find Lead
            </h3>

            <Select
              options={leadOptions}
              value={selectedLead}
              onChange={setSelectedLead}
              onInputChange={(val) => setSearchTerm(val)}
              isLoading={searchingLeads}
              filterOption={null}
              formatOptionLabel={formatLeadOption}
              placeholder="Search by name, company, email, or ref..."
              noOptionsMessage={() =>
                searchingLeads ? "Loading..." : "No matching leads"
              }
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: "52px",
                  borderRadius: "12px",
                  borderColor: state.isFocused ? "#f97316" : "#e5e7eb",
                  boxShadow: state.isFocused
                    ? "0 0 0 3px rgba(249, 115, 22, 0.12)"
                    : "none",
                  backgroundColor: "#f9fafb",
                  "&:hover": {
                    borderColor: "#f97316",
                  },
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
                  backgroundColor: state.isSelected
                    ? "#fff7ed"
                    : state.isFocused
                    ? "#f9fafb"
                    : "white",
                  color: "#374151",
                  cursor: "pointer",
                }),

                singleValue: (base) => ({
                  ...base,
                  color: "#374151",
                }),

                placeholder: (base) => ({
                  ...base,
                  color: "#9ca3af",
                }),
              }}
            />

            {selectedLead && (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-white border-b border-gray-100">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {(
                          selectedLead.raw.clientName ||
                          selectedLead.raw.companyName ||
                          "?"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">
                          {selectedLead.raw.clientName ||
                            selectedLead.raw.companyName ||
                            "Unnamed Lead"}
                        </h4>

                        {selectedLead.raw.companyName &&
                          selectedLead.raw.clientName && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {selectedLead.raw.companyName}
                            </p>
                          )}
                      </div>
                    </div>

                    {/* Lead reference / stage */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {selectedLead.raw.leadRef && (
                        <span className="hidden sm:inline-flex px-2 py-1 rounded-md bg-gray-100 text-[10px] font-semibold text-gray-500">
                          L-{selectedLead.raw.leadRef}
                        </span>
                      )}

                      {selectedLead.raw.stage && (
                        <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-semibold">
                          {selectedLead.raw.stage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100">
                  <div className="bg-white px-5 py-3.5">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
                      Client
                    </p>
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {selectedLead.raw.clientName || "—"}
                    </p>
                  </div>

                  <div className="bg-white px-5 py-3.5">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
                      Company
                    </p>
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {selectedLead.raw.companyName || "—"}
                    </p>
                  </div>

                  <div className="bg-white px-5 py-3.5 sm:col-span-2">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
                      Email
                    </p>

                    <p className="text-sm font-medium text-gray-700 truncate">
                      {selectedLead.raw.email || "No email available"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleLinkExisting}
              disabled={loading || !selectedLead}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 disabled:opacity-50"
            >
              {loading ? "Linking..." : "Link Thread to Lead"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
