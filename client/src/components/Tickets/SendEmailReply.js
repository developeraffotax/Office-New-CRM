import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";
import CustomEditor from "../../utlis/CustomEditor";
import { TbLoader2 } from "react-icons/tb";
import { RiUploadCloud2Fill } from "react-icons/ri";
import { filterOption, HighlightedOption, sortOptions } from "./HighlightedOption";
import { useSelector } from "react-redux";
import AIReplySelector from "../ai/AIReplySelector";

export default function SendEmailReply({
  setShowReply,
  subject,
  threadId,
  company,
  ticketId,
  emailSendTo,
  getEmailDetail,

  setEmailData,

  
  emailDetail
}) {
  const [clientId, setClientId] = useState("");
  const [message, setMessage] = useState("");
  const [templates, setTemplates] = useState([]);

   const auth = useSelector((state) => state.auth.auth);

const [inputValue, setInputValue] = useState("");

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  console.log("message:", message);
  console.log("emailSendTo:", emailSendTo);


    const [users, setUsers] = useState([]);
    const [jobHolder, setJobHolder] = useState("");
  
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
          ? "#f0f0f0" // selected
          : state.isFocused
          ? "#e6f0ff" // hover/focus
          : "white",
        color: "black",
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

  const sendEmailReply = async (e) => {
    e.preventDefault();

    if(!message) {
      toast.error("Message is required");
      return;
    } 

    setLoading(true);
    try {
      const emailData = new FormData();
      emailData.append("company", company);
      emailData.append("clientId", clientId);
      emailData.append("subject", subject);
      emailData.append("message", message);
      emailData.append("threadId", threadId);
      emailData.append("ticketId", ticketId);
      emailData.append("emailSendTo", emailSendTo);

      if(jobHolder) {
        emailData.append("jobHolder", jobHolder);

      }
      files.forEach((file) => {
        emailData.append("files", file);
      });
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/reply/email`,
        emailData
      );
      if (data) {
        getEmailDetail();
        toast.success("Email reply successfully!");
        setLoading(false);
        setShowReply(false);
        setFiles([]);
        setMessage("");
        setClientId("");
        setTemplates("");

        if(setEmailData && data.success) {
          setEmailData(prev => prev.map((t) => t._id === data.updatedTicket._id ? {...t, ...data.updatedTicket} : t));
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message || "Error while send email!");
    }
  };








  useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation(); // prevent parent handler
      setShowReply(false);
    }
  };

  
    window.addEventListener("keydown", handleKeyDown);
  

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);




  return (
    <div className="w-full h-[100%] flex items-center justify-center py-3 px-4 overflow-y-auto rounded-md ">




      <div className="w-[55rem] rounded-md  border flex flex-col gap-4 bg-white mt-[5rem] 3xl:mt-0 relative">
      {/* <AIReplySelector threadMessages={emailDetail?.decryptedMessages || []} onSelect={(suggestedReply) => setMessage(suggestedReply)} /> */}
        <div className="flex items-center justify-between px-4 pt-2">
          <h1 className="text-[20px] font-semibold text-black">Reply</h1>
          <span
            className=" cursor-pointer"
            onClick={() => {
              setShowReply(false);
            }}
          >
            <IoClose className="h-6 w-6 " />
          </span>
        </div>
        <hr className="h-[1px] w-full bg-gray-400 " />
        <form
          className="flex flex-col gap-4 w-full pb-4 px-4 "
          onSubmit={sendEmailReply}
        >
          {/*  */}
          <Select
            className={`${style.input} w-full h-[2.6rem] flex items-center justify-center px-0 py-0`}
            value={selectedTemplateOption}
            onChange={handleTemplateChange}
            options={sortOptions(templateOptions, inputValue)} // sorted each render
            placeholder="Template"
            components={{ Option: HighlightedOption }}
            filterOption={filterOption} // keep react-select filtering
            isClearable
            styles={customStyles}
            onInputChange={(val) => setInputValue(val)}
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

         <div
                     className={`w-full flex items-center ${
                       auth?.user?.role?.name === "Admin"
                         ? "justify-between"
                         : "justify-end"
                     } gap-8`}
                   >
                     {auth?.user?.role?.name === "Admin" && (
                       <select
                         value={jobHolder}
                         className="w-[160px] h-[2rem] rounded-md border border-gray-400 outline-none text-[15px] px-2 py-1 bg-gray-50"
                         onChange={(e) => {
                           setJobHolder(e.target.value);
                         }}
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
                       className={`${style.button1} text-[15px]  `}
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
