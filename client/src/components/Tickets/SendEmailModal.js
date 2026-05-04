import React, { useEffect, useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";
import CustomEditor from "../../utlis/CustomEditor";
import { TbLoader2 } from "react-icons/tb";
import { RiUploadCloud2Fill } from "react-icons/ri";
import { useSelector } from "react-redux";
import { filterOption, HighlightedOption, sortOptions } from "./HighlightedOption";
import { useEscapeKey } from "../../utlis/useEscapeKey";
import { signature } from "./sig";
import { hasSubrole, isAdmin } from "../../utlis/checkPermission";

export default function SendEmailModal({
  setShowSendModal,
  getEmails,
  access,
}) {
  const auth = useSelector((state) => state.auth.auth);

  const hasClientsPermission = useMemo(() => { return isAdmin(auth.user) || hasSubrole(auth.user, "Tickets", "Clients"); }, [auth])
  const hasTrustpilotPermission = useMemo(() => { return isAdmin(auth.user) || hasSubrole(auth.user, "Tickets", "TrustPilot"); }, [auth])


 

  const [company, setCompany] = useState("Affotax");
  const [clientId, setClientId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [templates, setTemplates] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [type, setType] = useState(() => hasClientsPermission ? "client" : "manual");
  const [email, setEmail] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [users, setUsers] = useState([]);
  const [jobHolder, setJobHolder] = useState("");
    const [trustPilotBcc, setTrustPilotBcc] = useState(false);

  // --- Signature state ---
  const [signatures, setSignatures] = useState([
  //   {
  //     "_id": "abc123",
  //     "name": "John Doe – Affotax",
  //     "content": signature
  //   }, 
  // {
  //     "_id": "abc123",
  //     "name": " Affotax",
  //     "content": "<p>John Doe<br/>Affotax Ltd<br/>📞 +44 000 000 0000</p>"
  //   }
  ]);
  const [selectedSignature, setSelectedSignature] = useState(null);

  useEscapeKey(() => setShowSendModal(false));

  // ---- Fetch Signatures ----
  const getAllSignatures = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/signatures`
      );
      setSignatures(data?.signatures || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load signatures");
    }
  };

  // useEffect(() => {
  //    getAllSignatures();
  // }, []);

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access?.some((item) =>
            item?.permission?.includes("Tickets")
          )
        ) || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    //eslint-disable-next-line
  }, []);

  const allClientJobData = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/tickets/clients`
      );
      if (data) setJobData(data?.clients);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    }
  };

  useEffect(() => {
    allClientJobData();
    // eslint-disable-next-line
  }, []);

  const options = jobData.map((item) => ({
    value: item.id,
    label: `${item.companyName} - ${item.clientName}`,
  }));

  const selectedOption = options.find((option) => option.value === clientId);

  const handleChange = (selectedOption) => {
    if (selectedOption) setClientId(selectedOption.value);
    else setClientId("");
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "none",
      boxShadow: "none",
      width: "100%",
    }),
    menu: (provided) => ({
      ...provided,
      border: "1px solid #ccc",
    }),
    menuList: (provided) => ({
      ...provided,
      padding: 0,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#f0f0f0"
        : state.isFocused
        ? "#e6f0ff"
        : "white",
      color: "black",
      cursor: "pointer",
    }),
  };

  const getAllTemplates = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/templates/get/all/template`
      );
      setTemplates(data?.templates);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllTemplates();
    // eslint-disable-next-line
  }, []);

  const templateOptions = templates.map((item) => ({
    value: item._id,
    label: `${item.name} - ${item.description}`,
    description: item.template,
  }));

  const selectedTemplateOption = templateOptions.find(
    (option) => option.value === clientId
  );

  const handleTemplateChange = (selectedOption) => {
    if (selectedOption) setMessage(selectedOption.description);
    else setClientId("");
  };

  // ---- Signature options for dropdown ----
  const signatureOptions = signatures.map((sig) => ({
    value: sig._id,
    label: sig.name,        // e.g. "John Doe – Affotax"
    content: sig.content,   // HTML string of the signature
  }));

  const handleSignatureChange = (option) => {
    setSelectedSignature(option || null);
  };

  // ---- File helpers ----
  const handleSelectedFile = (e) => {
    const selectedFile = Array.from(e.target.files);
    setFiles([...files, ...selectedFile]);
  };

  const removeSelectFile = (name) => {
    setFiles(Array.from(files).filter((item) => item.name !== name));
  };

  // ---- Send Email ----
  const sendEmail = async (e) => {
    e.preventDefault();
    if (!company) {
      toast.error("Company is required!");
      return;
    }
    setLoading(true);
    try {
      // Append signature to message body if one is selected
      const finalMessage = selectedSignature?.content
        ? `${message}<br/><br/>--<br/>${selectedSignature.content}`
        : message;

      const emailData = new FormData();
      emailData.append("company", company);
      emailData.append("clientId", clientId);
      emailData.append("subject", subject);
      emailData.append("message", finalMessage);
      emailData.append("email", email);

      if (company === "Affotax" && trustPilotBcc) {
        emailData.append("trustPilotBcc", "true");
      }

      if (jobHolder) emailData.append("jobHolder", jobHolder);
      // if (selectedSignature) emailData.append("signatureId", selectedSignature.value);
      files.forEach((file) => emailData.append("files", file));

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/send/email`,
        emailData
      );

      if (data) {
        getEmails();
        toast.success("Email sent successfully!");
        setLoading(false);
        setShowSendModal(false);
        setCompany("");
        setFiles([]);
        setMessage("");
        setClientId("");
        setSubject("");
        setTemplates("");
        setEmail("");
        setType("client");
        setSelectedSignature(null);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message || "Error while sending email!");
    }
  };

  return (
    <div className="w-full h-[100%] flex items-center justify-center py-3 px-4 overflow-y-auto rounded-md">
      <div className="w-[55rem] rounded-md border flex flex-col gap-4 bg-white mt-[5rem] 3xl:mt-0">
        <div className="flex items-center justify-between px-4 pt-2">
          <h1 className="text-[20px] font-semibold text-black">
            Create New Ticket
          </h1>
          <span className="cursor-pointer" onClick={() => setShowSendModal(false)}>
            <IoClose className="h-6 w-6" />
          </span>
        </div>
        <hr className="h-[1px] w-full bg-gray-400" />
        <form className="flex flex-col gap-4 w-full pb-4 px-4" onSubmit={sendEmail}>
          <select
            className={`${style.input}`}
            value={company}
            required
            onChange={(e) => setCompany(e.target.value)}
          >
            <option>Select Company</option>
            {(auth?.user?.role?.name === "Admin" || access.includes("Affotax")) && (
              <option value="Affotax">Affotax-info@affotax.com</option>
            )}
            {(auth?.user?.role?.name === "Admin" || access.includes("OutSource")) && (
              <option value="Outsource">
                Outsource-admin@outsourceaccountings.co.uk
              </option>
            )}
          </select>

          {/* Select Type */}
          <div className="flex items-center gap-4">
            { hasClientsPermission &&
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="client"
               checked={type === "client"}
                onChange={(e) => setType(e.target.value)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm">Client</span>
            </label>}
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="manual"
                checked={type === "manual"}
                onChange={(e) => setType(e.target.value)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm">Manual</span>
            </label>
          </div>

          {(hasClientsPermission && type === "client") ? (
            <Select
              className={`${style.input} h-[2.6rem] flex items-center justify-center px-0 py-0`}
              value={selectedOption}
              onChange={handleChange}
              options={options}
              placeholder="To"
              styles={customStyles}
              isClearable
            />
          ) : (
            <input
              type="email"
              placeholder="Enter Email..."
              required
              className={`${style.input} w-full`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          <input
            type="text"
            placeholder="Subject"
            required
            className={`${style.input} w-full`}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />

          <Select
            className={`${style.input} w-full h-[2.6rem] flex items-center justify-center px-0 py-0`}
            value={selectedTemplateOption}
            onChange={handleTemplateChange}
            options={sortOptions(templateOptions, inputValue)}
            placeholder="Template"
            components={{ Option: HighlightedOption }}
            filterOption={filterOption}
            isClearable
            styles={customStyles}
            onInputChange={(val) => setInputValue(val)}
          />

          <CustomEditor template={message} setTemplate={setMessage} />

          {/* ---- Signature Dropdown ---- */}
          {/* <Select
            className={`${style.input} w-full h-[2.6rem] flex items-center justify-center px-0 py-0`}
            value={selectedSignature}
            onChange={handleSignatureChange}
            options={signatureOptions}
            placeholder="Select Signature (optional)"
            styles={customStyles}
            isClearable
          /> */}

          {/* Signature preview */}
          {selectedSignature?.content && (
            <div className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
              <p className="text-[11px] text-gray-400 mb-1 font-medium uppercase tracking-wide">
                Signature Preview
              </p>
              <div
                className="text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: selectedSignature.content }}
              />
            </div>
          )}

          {/* File Upload */}
          <div className="flex items-start">
            <input
              type="file"
              id="file"
              multiple
              accept="image/*, .pdf, .doc, .xls, .xlsx, .ppt, .pptx, .txt, .rtf, .odt, .ods, .csv"
              className="hidden"
              onChange={handleSelectedFile}
            />
            <label
              htmlFor="file"
              title="Upload File"
              className="w-[3rem] h-[3rem] rounded-md border-2 border-orange-600 cursor-pointer border-dashed flex items-center justify-center flex-col"
            >
              <RiUploadCloud2Fill className="h-6 w-6 text-orange-600" />
            </label>
            <div className="flex items-center flex-wrap gap-2 ml-1">
              {files &&
                Array.from(files)?.map((item) => (
                  <div
                    key={item.name}
                    className="w-fit gap-2 py-1 px-1 rounded-sm bg-gray-50 flex items-center"
                  >
                    <span className="text-blue-500 font-medium text-[12px]">
                      {item.name}
                    </span>
                    <span
                      onClick={() => removeSelectFile(item.name)}
                      className="cursor-pointer"
                    >
                      <IoClose className="h-4 w-4" />
                    </span>
                  </div>
                ))}
            </div>
          </div>



                {
                          hasTrustpilotPermission &&
                
                            <div>
                            <label
                              title="Include Trustpilot BCC (option available only for Affotax)"
                              htmlFor="trustPilotBcc"
                              className={`text-sm font-medium  flex  items-center justify-start gap-2 mt-2 p-2 rounded-md border max-w-[200px] 
                    
                                transition-colors duration-200
                                  ${
                                    company === "Affotax"
                                      ? "text-gray-800 cursor-pointer border-orange-300 hover:border-orange-500"
                                      : "text-gray-400 cursor-not-allowed opacity-50 border-gray-300"
                                  }
                                  `}
                                        >
                                          <input
                                            type="checkbox"
                                            id="trustPilotBcc"
                                            checked={trustPilotBcc}
                                            disabled={company !== "Affotax"}
                                            onChange={(e) => setTrustPilotBcc(e.target.checked)}
                                            className={`appearance-none h-4 w-4 border border-gray-400 rounded
                                    checked:bg-orange-600 checked:border-orange-600
                                    checked:before:content-['✓']
                                    checked:before:text-white checked:before:block
                                    checked:before:text-center checked:before:leading-4
                                    accent-orange-500 
                                  
                                `}
                              />
                              Include Trustpilot BCC
                            </label>
                          </div>
                          }
                



          <div
            className={`w-full flex items-center ${
              auth?.user?.role?.name === "Admin" ? "justify-between" : "justify-end"
            } gap-8`}
          >
            {auth?.user?.role?.name === "Admin" && (
              <select
                value={jobHolder}
                className="w-[160px] h-[2rem] rounded-md border border-gray-400 outline-none text-[15px] px-2 py-1 bg-gray-50"
                onChange={(e) => setJobHolder(e.target.value)}
              >
                <option value="">Select Jobholder</option>
                {users?.map((jobHold, i) => (
                  <option value={jobHold?.name} key={i}>
                    {jobHold.name}
                  </option>
                ))}
              </select>
            )}

            <button
              disabled={loading}
              className={`${style.button1} text-[15px]`}
              type="submit"
              style={{ padding: ".4rem 1rem" }}
            >
              {loading ? (
                <TbLoader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span>Send</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}