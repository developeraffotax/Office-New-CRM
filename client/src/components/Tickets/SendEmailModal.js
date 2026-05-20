import React, { useEffect, useMemo, useState } from "react";
import { IoClose, IoSend } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";
import CustomEditor from "../../utlis/CustomEditor";
import { TbLoader2, TbPaperclip } from "react-icons/tb";
import { useSelector } from "react-redux";
import {
  filterOption,
  HighlightedOption,
  sortOptions,
} from "./HighlightedOption";
import { useEscapeKey } from "../../utlis/useEscapeKey";
import { hasSubrole, isAdmin } from "../../utlis/checkPermission";
import CustomSelect from "../../utlis/CustomSelect";

export default function SendEmailModal({
  onClose,
  onSuccess,
  defaults = {},
  meta = {},
}) {
  const auth = useSelector((state) => state.auth.auth);

  const hasPermission = useMemo(() => {
    return {
      client: isAdmin(auth.user) || hasSubrole(auth.user, "Tickets", "Clients") || false,
      trustPilot: isAdmin(auth.user) || hasSubrole(auth.user, "Tickets", "TrustPilot") || false,
      affotax: isAdmin(auth.user) || hasSubrole(auth.user, "Tickets", "Affotax") || false,
      outsource: isAdmin(auth.user) || hasSubrole(auth.user, "Tickets", "OutSource") || false,
    };
  }, [auth]);

  const initialState = {
    company: defaults.company || "Affotax",
    clientId: defaults.clientId || "",
    subject: defaults.subject || "",
    message: defaults.message || "",
    type: defaults.type || (hasPermission.client ? "client" : "manual"),
    email: defaults.email || "",
    trustPilotBcc: defaults.trustPilotBcc || false,
    jobHolder: defaults.jobHolder || "",
  };

  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [signatures, setSignatures] = useState([]);

  const [files, setFiles] = useState([]);

  const [company, setCompany] = useState(initialState.company);
  const [subject, setSubject] = useState(initialState.subject);
  const [message, setMessage] = useState(initialState.message);
  const [type, setType] = useState(initialState.type);
  const [email, setEmail] = useState(initialState.email);
  const [jobHolder, setJobHolder] = useState(initialState.jobHolder);
  const [trustPilotBcc, setTrustPilotBcc] = useState(
    initialState.trustPilotBcc,
  );
  const [clientId, setClientId] = useState(initialState.clientId);

  const [templateId, setTemplateId] = useState("");
  const [signatureId, setSignatureId] = useState("");

  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEscapeKey(() => onClose?.());

  const getAllSignatures = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/signatures`,
        { params: { company } },
      );
      setSignatures(data?.data || []);
    } catch (error) {
      toast.error("Failed to load signatures");
    }
  };

  useEffect(() => {
    getAllSignatures();
  }, [company]);

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`,
      );
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access?.some((item) =>
            item?.permission?.includes("Tickets"),
          ),
        ) || [],
      );
    } catch (error) {}
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const allClientJobData = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/tickets/clients`,
      );
      if (data) setJobData(data?.clients);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    }
  };

  useEffect(() => {
    allClientJobData();
  }, []);

  const getAllTemplates = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/templates/get/all/template`,
      );
      setTemplates(data?.templates);
    } catch (error) {}
  };

  useEffect(() => {
    getAllTemplates();
  }, []);

  const options = useMemo(
    () =>
      jobData.map((job) => ({
        value: job.id,
        label: `${job.companyName} - ${job.clientName}`,
      })),
    [jobData],
  );

 

  const handleChange = (selectedOption) => {
    setClientId(selectedOption?.value || "");
  };

  const templateOptions = useMemo(
    () =>
      templates.map((template) => ({
        value: template._id,
        label: `${template.name} - ${template.description}`,
        description: template.template,
      })),
    [templates],
  );

 

  const handleTemplateChange = (selectedOption) => {
    setTemplateId(selectedOption?.value || "");

    if (selectedOption) {
      setMessage(selectedOption.description || "");
    }
  };




  const signatureOptions = useMemo(
    () =>
      signatures.map((sig) => ({
        value: sig._id,
        label: sig.name,
        html: sig.html,
      })),
    [signatures],
  );

  const selectedSignature = useMemo(() => {
    if (!signatureId || signatureOptions.length === 0) return null;

    return (
      signatureOptions.find((option) => option.value === signatureId) ?? null
    );
  }, [signatureOptions, signatureId]);

  const handleSignatureChange = (selectedOption) => {
    setSignatureId(selectedOption?.value || "");
  };

  const handleSelectedFile = (e) =>
    setFiles([...files, ...Array.from(e.target.files)]);
  const removeSelectFile = (name) =>
    setFiles(files.filter((item) => item.name !== name));

  const sendEmail = async (e) => {
    e.preventDefault();
    if (!company) return toast.error("Company is required!");

    setLoading(true);

    try {
      const finalMessage = selectedSignature?.html
        ? `${message}<br/><br/>${selectedSignature.html}`
        : message;
      const emailData = new FormData();
      emailData.append("company", company);
      emailData.append("clientId", clientId);
      emailData.append("subject", subject);
      emailData.append("message", finalMessage);
      emailData.append("email", email);
      if (email && type === "manual") {
        emailData.append("clientName", meta?.clientName || "");
        emailData.append("companyName", meta?.companyName || "");
      }

      if (company === "Affotax" && trustPilotBcc)
        emailData.append("trustPilotBcc", "true");
      if (jobHolder) emailData.append("jobHolder", jobHolder);
      files.forEach((file) => emailData.append("files", file));

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/send/email`,
        emailData,
      );
      if (data) {
        onSuccess?.();
        toast.success("Email sent successfully!");
        onClose?.();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error while sending email!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-google">
      <div className="w-full max-w-5xl h-[85vh] overflow-hidden rounded-md border border-slate-300 bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-300">
          <h1 className="text-sm font-bold text-slate-800 tracking-wide">
            New Ticket
          </h1>
          <button
            onClick={() => onClose?.()}
            className="p-1 hover:bg-slate-300 rounded transition-colors text-slate-500 hover:text-slate-800"
          >
            <IoClose size={18} />
          </button>
        </div>

        <form
          className="flex flex-col flex-1 overflow-hidden"
          onSubmit={sendEmail}
        >
          {/* Main Content Area - Single Column Flow */}
          <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4 flex flex-col bg-slate-50">
            {/* Top Configuration Grid: Left Aligned Recipients & Templates */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2  ">
              <div className="col-span-2 space-y-1">
                {hasPermission.client && type === "client" ? (
                  <CustomSelect
                    value={clientId}
                    onChange={handleChange}
                    options={options}
                    placeholder="Search Client..."
                    isClearable
                  />
                ) : (
                  <input
                    type="email"
                    placeholder="Enter manual email address"
                    required
                    className="w-full  h-[36px] px-2 text-sm rounded-lg border border-slate-300 bg-white outline-none focus:border-orange-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                )}
              </div>

              {/* Row 1: Recipient Controls */}
              <div className="col-span-1 space-y-1">
                <div className="flex bg-slate-200 p-1 rounded-lg ">
                  {hasPermission.client && (
                    <button
                      type="button"
                      onClick={() => setType("client")}
                      className={`flex-1 text-[12px] py-1 rounded-md transition-all ${
                        type === "client"
                          ? "bg-white shadow-sm font-semibold text-slate-800"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Client
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setType("manual")}
                    className={`flex-1 text-[12px] py-1 rounded-md transition-all ${
                      type === "manual"
                        ? "bg-white shadow-sm font-semibold text-slate-800"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              {/* Row 2: Company, Templates, Signatures, JobHolder */}
              <div className="col-span-1 space-y-1">
                <select
                  className="w-full h-[36px] px-2 text-sm text-gray-500 rounded-lg border border-slate-300 bg-white outline-none focus:border-orange-500"
                  value={company}
                  required
                  onChange={(e) => setCompany(e.target.value)}
                >
                  <option value="">Select Company</option>
                  {hasPermission.affotax && (
                    <option value="Affotax">Affotax</option>
                  )}
                  {hasPermission.outsource && (
                    <option value="Outsource">Outsource</option>
                  )}
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <CustomSelect
                  value={templateId}
                  components={{ Option: HighlightedOption }}
                  filterOption={filterOption}
                  onChange={handleTemplateChange}
                  options={sortOptions(templateOptions, inputValue)}
                  placeholder="Select Template..."
                />
              </div>

              <div className="col-span-1 space-y-1">
                <CustomSelect
                  value={signatureId}
                  onChange={handleSignatureChange}
                  options={signatureOptions}
                  placeholder="Select Signature..."
                  isClearable
                />
              </div>

              {auth?.user?.role?.name === "Admin" && (
                <div className="col-span-1 space-y-1">
                  <select
                    value={jobHolder}
                    className="w-full h-[36px] px-2 text-sm text-gray-500 rounded-lg border border-slate-300 bg-white outline-none focus:border-orange-500"
                    onChange={(e) => setJobHolder(e.target.value)}
                  >
                    <option value="">Assign Jobholder...</option>
                    {users?.map((u, i) => (
                      <option value={u.name} key={i}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Middle Section: Subject & Editor Left Aligned (Full Width in single column) */}
            <div className="flex flex-col flex-1 space-y-3">
              <div className="flex items-center gap-3 px-3 py-1.5 bg-white border border-slate-300 rounded-md shadow-sm focus-within:bg-white focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none shrink-0 border-r border-slate-200 pr-3">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Enter email subject..."
                  required
                  className="w-full bg-transparent text-sm   font-semibold text-gray-600 outline-none placeholder:text-slate-400 placeholder:font-normal py-0.5"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="flex-1   ">
                <CustomEditor template={message} setTemplate={setMessage} />
              </div>

              {selectedSignature?.html && (
                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                    Signature Preview
                  </span>
                  <div
                    className="text-xs opacity-70 pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: selectedSignature.html }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer: Attachments strictly on the Left, Send on the Right */}
          <div className="px-8 py-4 bg-slate-100 border-t border-slate-300 flex items-center justify-start gap-5">

            {/* Right aligned action block */}
           <button
  disabled={loading}
  className="w-[100px] h-[36px] bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1 transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none select-none"
  type="submit"
>
  {loading ? (
    <TbLoader2 className="animate-spin" size={16} />
  ) : (
    <>
      <IoSend size={14} className="shrink-0" /> 
      <span>Send</span>
    </>
  )}
</button>


            {/* Left aligned footer block */}
            <div className="flex flex-col gap-2 max-w-[75%]">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors">
                  <input
                    type="file"
                    id="file"
                    multiple
                    className="hidden"
                    onChange={handleSelectedFile}
                  />
                  <TbPaperclip size={18} /> Attach Files
                </label>

                {hasPermission.trustPilot && (
                  <label
                    className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                      company === "Affotax"
                        ? "text-slate-700 cursor-pointer"
                        : "text-slate-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={trustPilotBcc}
                      disabled={company !== "Affotax"}
                      onChange={(e) => setTrustPilotBcc(e.target.checked)}
                      className="accent-orange-500 w-3.5 h-3.5"
                    />
                    BCC Trustpilot
                  </label>
                )}
              </div>

              {/* File list directly under the attachment button in footer */}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {files.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-0.5 rounded shadow-sm text-[10px] text-slate-700 font-medium"
                    >
                      <span className="truncate max-w-[120px]">
                        {item.name}
                      </span>
                      <IoClose
                        className="cursor-pointer text-slate-400 hover:text-red-500"
                        onClick={() => removeSelectFile(item.name)}
                        size={12}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            
          </div>
        </form>
      </div>
    </div>
  );
}
