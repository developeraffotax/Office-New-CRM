import React, { useEffect, useMemo, useState } from "react";
import { IoClose, IoSend } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";
import CustomEditor from "../../utlis/CustomEditor";
import { TbLoader2, TbPaperclip } from "react-icons/tb";
import { useSelector } from "react-redux";
import { filterOption, HighlightedOption, sortOptions } from "./HighlightedOption";
import { useEscapeKey } from "../../utlis/useEscapeKey";
import { hasSubrole, isAdmin } from "../../utlis/checkPermission";

export default function SendEmailModal({ onClose, onSuccess, defaults = {}, meta = {} }) {
  const auth = useSelector((state) => state.auth.auth);

 
  const hasPermission = useMemo(() => {
    return {
      client: isAdmin(auth.user) || hasSubrole(auth.user, "Tickets", "Clients") || false,
      trustPilot: isAdmin(auth.user) || hasSubrole(auth.user, "Tickets", "TrustPilot") || false,
      affotax: isAdmin(auth.user) || hasSubrole(auth.user, "Tickets", "Affotax") || false,
      outsource: isAdmin(auth.user) || hasSubrole(auth.user, "Tickets", "OutSource") || false,
    }
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






  const [company, setCompany] = useState(initialState.company);
  const [clientId, setClientId] = useState(initialState.clientId);
  const [subject, setSubject] = useState(initialState.subject);
  const [message, setMessage] = useState(initialState.message);
  const [type, setType] = useState(initialState.type);
  const [email, setEmail] = useState(initialState.email);
    const [jobHolder, setJobHolder] = useState(initialState.jobHolder);
  const [trustPilotBcc, setTrustPilotBcc] = useState(initialState.trustPilotBcc);
  const [files, setFiles] = useState([]);


  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [signatures, setSignatures] = useState([]);


  const [inputValue, setInputValue] = useState("");

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [loading, setLoading] = useState(false);

  
 
 




  useEscapeKey(() => onClose?.());
 



  const getAllSignatures = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/tickets/signatures`, { params: { company } });
      setSignatures(data?.data || []);
    } catch (error) {
      toast.error("Failed to load signatures");
    }
  };

  useEffect(() => { getAllSignatures(); }, [company]);

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`);
      setUsers(data?.users?.filter((user) => user.role?.access?.some((item) => item?.permission?.includes("Tickets"))) || []);
    } catch (error) {}
  };



  useEffect(() => { getAllUsers(); }, []);
 



































  const allClientJobData = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/client/tickets/clients`);
      if (data) setJobData(data?.clients);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    }
  };

  useEffect(() => { allClientJobData(); }, []);

const options = useMemo(
  () =>
    jobData.map((item) => ({
      value: item.id,
      label: `${item.companyName} - ${item.clientName}`,
    })),
  [jobData]
);

const selectedOption = useMemo(() => {
  if (!clientId || options.length === 0) return null;
  return options.find(
    (option) => {
         
      return option.value.toString() === clientId.toString()
    }
  ) ?? null;
}, [options, clientId]);


 


  console.log("THE JOB HERE IS :", jobData.find(j =>j.companyName === "Noa Payments Limited"));
 


  console.log("options.includes(clientId)", options.some(option => option.value.toString() === clientId.toString()));
  console.log("Selected Client Option:", selectedOption);
  console.log("Current Client ID State:", clientId);

const handleChange = (selectedOption) => {
  setClientId(selectedOption?.value || "");
};

































  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      boxShadow: "none",
      minHeight: "36px",
      fontSize: "14px",
      "&:hover": { border: "1px solid #f97316" }
    }),
    menu: (provided) => ({ ...provided, zIndex: 9999 }),
  };

  const getAllTemplates = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/templates/get/all/template`);
      setTemplates(data?.templates);
    } catch (error) {}
  };

  useEffect(() => { getAllTemplates(); }, []);

  const templateOptions = templates.map((item) => ({
    value: item._id,
    label: `${item.name} - ${item.description}`,
    description: item.template,
  }));




 // const selectedTemplateOption = templateOptions.find((option) => option.value === clientId);

  const handleTemplateChange = (selectedOption) => {
    setSelectedTemplate(selectedOption || null);
    if (selectedOption) setMessage(selectedOption.description);
    // else setClientId("");
  };

  const signatureOptions = signatures.map((sig) => ({
    value: sig._id,
    label: sig.name,
    html: sig.html,
  }));

  const handleSignatureChange = (option) => setSelectedSignature(option || null);

  const handleSelectedFile = (e) => setFiles([...files, ...Array.from(e.target.files)]);
  const removeSelectFile = (name) => setFiles(files.filter((item) => item.name !== name));

  const sendEmail = async (e) => {
    e.preventDefault();
    if (!company) return toast.error("Company is required!");


    console.log("Sending Email with State:", { company, clientId,   });


    return 
    setLoading(true);



    try {
      const finalMessage = selectedSignature?.html ? `${message}<br/><br/>${selectedSignature.html}` : message;
      const emailData = new FormData();
      emailData.append("company", company);
      emailData.append("clientId", clientId);
      emailData.append("subject", subject);
      emailData.append("message", finalMessage);
      emailData.append("email", email);
       if (email && type === "manual") {
        emailData.append("clientName", meta?.clientName );
        emailData.append("companyName", meta?.companyName);
      }

      if (company === "Affotax" && trustPilotBcc) emailData.append("trustPilotBcc", "true");
      if (jobHolder) emailData.append("jobHolder", jobHolder);
      files.forEach((file) => emailData.append("files", file));

      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/tickets/send/email`, emailData);
      if (data) {
        onSuccess?.();
        toast.success("Email sent successfully!");
        onClose?.();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error while sending email!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-4">
      <div className="w-full max-w-5xl  h-[85vh] overflow-hidden rounded-md border border-slate-200 bg-white flex flex-col shadow-2xl font-google">
        
        {/* Header - More Compact */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
          <div>
            <h1 className="text-base font-bold font-google text-slate-800">New Ticket</h1>
             
          </div>
          <button onClick={() => onClose?.()} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-700">
            <IoClose size={20} />
          </button>
        </div>

        <form className="flex flex-col flex-1 overflow-hidden" onSubmit={sendEmail}>
          <div className="flex flex-1 overflow-hidden">
            
            {/* Main Composer Area */}
            <div className="w-[60%] flex-1 overflow-y-auto p-5 space-y-4 border-r border-slate-100">
              <input
                type="text"
                 
                placeholder="Subject"
                required
               className={`w-full ${style.input}`}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              
              <div className="shadow-sm ">
                <CustomEditor template={message} setTemplate={setMessage} />
              </div>

              {selectedSignature?.html && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 relative group">
                  <span className="absolute -top-2 left-3 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signature Preview</span>
                  <div className="text-xs opacity-70 italic pointer-events-none" dangerouslySetInnerHTML={{ __html: selectedSignature.html }} />
                </div>
              )}
            </div>

            {/* Sidebar Controls - Modern Compact Sidebar */}
            <div className="w-[40%] bg-slate-50/50 p-4 overflow-y-auto space-y-5 ">
              
              {/* Recipient Section */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Recipients</label>
                <div className="flex bg-slate-200 p-1 rounded-lg mb-2">
                  {hasPermission.client && (
                    <button type="button" onClick={() => setType("client")} className={`flex-1 text-xs py-1 rounded-md transition-all ${type === "client" ? "bg-white shadow-sm font-semibold" : "text-slate-500"}`}>Client</button>
                  )}
                  <button type="button" onClick={() => setType("manual")} className={`flex-1 text-xs py-1 rounded-md transition-all ${type === "manual" ? "bg-white shadow-sm font-semibold" : "text-slate-500"}`}>Manual</button>
                </div>

                {hasPermission.client && type === "client" ? (
                  <Select className="text-sm" value={selectedOption} onChange={handleChange} options={options} placeholder="Select Client..." styles={customStyles} isClearable />
                ) : (
                  <input type="email" placeholder="Email Address" required className="w-full h-9 px-3 text-sm rounded-lg border border-slate-200 outline-none focus:border-orange-500 transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
                )}
              </div>

               
              <div className="space-y-3 pt-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Email Configuration</label>
                <select className="w-full h-9 px-2 text-sm rounded-lg border border-slate-200 bg-white" value={company} required onChange={(e) => setCompany(e.target.value)}>
                  <option value="">Select Company</option>
                  {hasPermission.affotax && <option value="Affotax">Affotax</option>}
                  {hasPermission.outsource && <option value="Outsource">Outsource</option>}
                </select>

                <Select className="text-sm" value={selectedTemplate} onChange={handleTemplateChange} options={sortOptions(templateOptions, inputValue)} placeholder="Templates" styles={customStyles} isClearable  />
                <Select className="text-sm" value={selectedSignature} onChange={handleSignatureChange} options={signatureOptions} placeholder="Signatures" styles={customStyles} isClearable />
                
                {auth?.user?.role?.name === "Admin" && (
                  <select value={jobHolder} className="w-full h-9 px-2 text-sm rounded-lg border border-slate-200 bg-white" onChange={(e) => setJobHolder(e.target.value)}>
                    <option value="">Assigned Jobholder</option>
                    {users?.map((u, i) => <option value={u.name} key={i}>{u.name}</option>)}
                  </select>
                )}
              </div>

              
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                   <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="file" id="file" multiple className="hidden" onChange={handleSelectedFile} />
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 group-hover:text-orange-600">
                        <TbPaperclip size={18}/> Attach Files
                      </div>
                   </label>
                   {hasPermission.trustPilot && (
                      <label className={`flex items-center gap-2 text-[11px] font-medium ${company === "Affotax" ? "text-slate-600 cursor-pointer" : "text-slate-300"}`}>
                        <input type="checkbox" checked={trustPilotBcc} disabled={company !== "Affotax"} onChange={(e) => setTrustPilotBcc(e.target.checked)} className="accent-orange-500" />
                        BCC Trustpilot
                      </label>
                   )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {files.map((item) => (
                    <div key={item.name} className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded text-[10px] text-slate-600">
                      <span className="truncate max-w-[100px]">{item.name}</span>
                      <IoClose className="cursor-pointer hover:text-red-500" onClick={() => removeSelectFile(item.name)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="px-6 py-3 bg-white border-t border-slate-100 flex justify-end">
            <button
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
              type="submit"
            >
              {loading ? <TbLoader2 className="animate-spin" size={18} /> : <><IoSend /> Send</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}





























 