import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";
import CustomEditor from "../../utlis/CustomEditor";
import { TbLoader2 } from "react-icons/tb";
import { RiUploadCloud2Fill } from "react-icons/ri";

export default function SendEmailModal({ setShowSendModal }) {
  const [company, setCompany] = useState("");
  const [clientId, setClientId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [templates, setTemplates] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  console.log("Files:", files);

  console.log("message:", message);

  const allClientJobData = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/tickets/clients`
      );
      if (data) {
        setJobData(data?.clients);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    }
  };

  useEffect(() => {
    allClientJobData();
    // eslint-disable-next-line
  }, []);

  //   Select Job CLient
  const options = jobData.map((item) => ({
    value: item.id,
    label: `${item.companyName} - ${item.clientName} `,
  }));

  const selectedOption = options.find((option) => option.value === clientId);

  const handleChange = (selectedOption) => {
    if (selectedOption) {
      setClientId(selectedOption.value);
    } else {
      setClientId("");
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "none",
      boxShadow: "none",
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
      backgroundColor: state.isSelected ? "#f0f0f0" : "white",
      color: state.isSelected ? "black" : "black",
      cursor: "pointer",
    }),
  };
  // --------------Get All Templates---------->
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
    label: `${item.name} - ${item.description} `,
    description: item.template,
  }));

  const selectedTemplateOption = templateOptions.find(
    (option) => option.value === clientId
  );

  const handleTemplateChange = (selectedOption) => {
    if (selectedOption) {
      setMessage(selectedOption.description);
    } else {
      setClientId("");
    }
  };

  //   -----------------Send Email------------>
  const handleSelectedFile = (e) => {
    const selectedFile = Array.from(e.target.files);
    setFiles([...files, ...selectedFile]);
  };

  const removeSelectFile = (name) => {
    const filterFiles = Array.from(files).filter((item) => item.name !== name);
    setFiles(filterFiles);
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const emailData = new FormData();
      emailData.append("company", company);
      emailData.append("clientId", clientId);
      emailData.append("subject", subject);
      emailData.append("message", message);
      files.forEach((file) => {
        emailData.append("files", file);
      });
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/send/email`,
        emailData
      );
      if (data) {
        toast.success("Email send successfully!");
        setLoading(false);
        setShowSendModal(false);
        setCompany("");
        setFiles([]);
        setMessage("");
        setClientId("");
        setSubject("");
        setTemplates("");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message || "Error while send email!");
    }
  };

  return (
    <div className="w-full h-[100%] flex items-center justify-center py-3 px-4 overflow-y-auto rounded-md ">
      <div className="w-[48rem] rounded-md  border flex flex-col gap-4 bg-white mt-[5rem] 3xl:mt-0">
        <div className="flex items-center justify-between px-4 pt-2">
          <h1 className="text-[20px] font-semibold text-black">
            Create New Ticket
          </h1>
          <span
            className=" cursor-pointer"
            onClick={() => {
              setShowSendModal(false);
            }}
          >
            <IoClose className="h-6 w-6 " />
          </span>
        </div>
        <hr className="h-[1px] w-full bg-gray-400 " />
        <form
          className="flex flex-col gap-4 w-full pb-4 px-4 "
          onSubmit={sendEmail}
        >
          <select
            className={`${style.input}`}
            value={company}
            required
            onChange={(e) => setCompany(e.target.value)}
          >
            <option>Select Company</option>
            <option value="Affotax">Affotax-info@affotax.com</option>
            <option value="Outsource">
              Outsource-admin@outsourceaccountings.co.uk
            </option>
          </select>
          {/*  */}
          <Select
            className={`${style.input} px-0 py-0`}
            value={selectedOption}
            onChange={handleChange}
            options={options}
            placeholder="To"
            styles={customStyles}
            isClearable
          />
          {/*  */}
          <input
            type="text"
            placeholder="Subject"
            required
            className={`${style.input} w-full`}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          {/*  */}
          <Select
            className={`${style.input} px-0 py-0`}
            value={selectedTemplateOption}
            onChange={handleTemplateChange}
            options={templateOptions}
            placeholder="Template"
            styles={customStyles}
            isClearable
          />
          {/*  */}
          <CustomEditor template={message} setTemplate={setMessage} />
          {/*  */}
          <div className="flex items-start">
            <input
              type="file"
              id="file"
              multiple
              accept="image/*, .pdf, .doc, .xls, .xlsx, .ppt, .pptx, .txt, .rtf, .odt, .ods, .csv"
              className="hidden"
              onChange={(e) => handleSelectedFile(e)}
            />
            <label
              htmlFor="file"
              title="Upload File"
              className="w-[3rem] h-[3rem] rounded-md border-2 border-orange-600 cursor-pointer border-dashed flex items-center justify-center flex-col"
            >
              <RiUploadCloud2Fill className="h-6 w-6 text-orange-600" />
              {/* <span>Upload file</span> */}
            </label>
            <div className="flex items-center flex-wrap gap-2 ml-1">
              {files &&
                Array.from(files)?.map((item) => (
                  <div className="w-fit gap-2 py-1 px-1 rounded-sm bg-gray-50 flex items-center">
                    <span className="text-blue-500 font-medium text-[12px]">
                      {item.name}
                    </span>
                    <span
                      onClick={() => removeSelectFile(item.name)}
                      className="cursor-pointer"
                    >
                      <IoClose className="h-4 w-4 " />
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex items-center justify-end ">
            <button
              disabled={loading}
              className={`${style.button1} text-[15px] `}
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
