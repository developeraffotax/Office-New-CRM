import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { style } from "../../utlis/CommonStyle";
import { BiLoaderCircle } from "react-icons/bi";
import axios from "axios";


const jobStatuses = [ "Quote", "Data", "Progress", "Queries", "Approval", "Submission", "Billing", "Feedback", ]


export default function CopyJobModel({ setIsOpen, allClientJobData, jobId }) {
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [source, setSource] = useState("");
  const [clientType, setClientType] = useState("");
  const [partner, setPartner] = useState("");
  const [country, setCountry] = useState("");
  const [fee, setFee] = useState("");
  const [ctLogin, setCtLogin] = useState("");
  const [pyeLogin, setPyeLogin] = useState("");
  const [trLogin, setTrLogin] = useState("");
  const [vatLogin, setVatLogin] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [ctPassword, setCtPassowrd] = useState("");
  const [pyePassword, setPyePassowrd] = useState("");
  const [trPassword, setTrPassowrd] = useState("");
  const [vatPassword, setVatPassowrd] = useState("");
  const [utr, setUtr] = useState("");

    const [clientPaidFee, setClientPaidFee] = useState("");


  const [clientBookKeepingFormData, setClientBookKeepingFormData] = useState({
    clientId: "",
    jobName: "Bookkeeping",
    yearEnd: "",
    jobDeadline: "",
    workDeadline: "",
    hours: "",
    fee: "",
    lead: "",
    jobHolder: "",

    jobStatus: ""
  });
  const [clientPayRollFormData, setClientPayRollFormData] = useState({
    clientId: "",
    jobName: "Payroll",
    yearEnd: "",
    jobDeadline: "",
    workDeadline: "",
    hours: "",
    fee: "",
    lead: "",
    jobHolder: "",

    jobStatus: ""
  });
  const [clientVatReturnFormData, setClientVatReturnFormData] = useState({
    clientId: "",
    jobName: "Vat Return",
    yearEnd: "",
    jobDeadline: "",
    workDeadline: "",
    hours: "",
    fee: "",
    lead: "",
    jobHolder: "",

    jobStatus: ""
  });
  const [clientPersonalTaxFormData, setClientPersonalTaxFormData] = useState({
    clientId: "",
    jobName: "Personal Tax",
    yearEnd: "",
    jobDeadline: "",
    workDeadline: "",
    hours: "",
    fee: "",
    lead: "",
    jobHolder: "",

    jobStatus: ""
  });
  const [clientAccountsFormData, setClientAccountsFormData] = useState({
    clientId: "",
    jobName: "Accounts",
    yearEnd: "",
    jobDeadline: "",
    workDeadline: "",
    hours: "",
    fee: "",
    lead: "",
    jobHolder: "",

    jobStatus: ""
  });

  const [clientCompanySecFormData, setClientCompanySecFormData] = useState({
    clientId: "",
    jobName: "Company Sec",
    yearEnd: "",
    jobDeadline: "",
    workDeadline: "",
    hours: "",
    fee: "",
    lead: "",
    jobHolder: "",

    jobStatus: ""
  });

  const [clientAddressFormData, setClientAddressFormData] = useState({
    clientId: "",
    jobName: "Address",
    yearEnd: "",
    jobDeadline: "",
    workDeadline: "",
    hours: "",
    fee: "",
    lead: "",
    jobHolder: "",

    jobStatus: ""
  });

  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);

  console.log("jobs:", jobs);

  const sources = ["FIV", "UPW", "PPH", "Website", "Direct", "Partner"];
  const clients = ["Limited", "LLP", "Individual", "Non UK"];
  const partners = ["Affotax", "Outsource", "OTL"];

  //   Date Format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  //   Get Existing Client Job

  const getClient = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/single/client/${jobId}`
      );

      const clientDetail = data.clientJob;
      console.log("JobDetails", clientDetail);
      // const formattedDate = new Date(
      //   clientDetail.currentDate
      // ).toLocaleDateString("en-CA");

      const formattedDate = new Date().toLocaleDateString("en-CA");



      setClientName(clientDetail.clientName);
      // setRegNumber(clientDetail.regNumber);
      // setCompanyName(clientDetail.companyName);
      setEmail(clientDetail.email);
       setPhone(clientDetail?.phone);
      setTotalHours(clientDetail.totalHours);
      setCurrentDate(formattedDate);
      setSource(clientDetail.source);
      setClientType(clientDetail.clientType);
      setFee(clientDetail.fee);
      // setCountry(clientDetail.country);
      // setCtLogin(clientDetail.ctLogin);
      // setPyeLogin(clientDetail.pyeLogin);
      // setTrLogin(clientDetail.trLogin);
      // setVatLogin(clientDetail.vatLogin);
      // setAuthCode(clientDetail.authCode);
      // setUtr(clientDetail.utr);
      // setCtPassowrd(clientDetail.ctPassword);
      // setPyePassowrd(clientDetail.pyePassword);
      // setTrPassowrd(clientDetail.trPassword);
      // setVatPassowrd(clientDetail.vatPassword);

      setPartner(clientDetail.partner);
      setClientPaidFee(clientDetail?.clientPaidFee);
      getJobs(clientDetail.companyName);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClient();
    // eslint-disable-next-line
  }, []);

  //   Get ALl Jobs
  const getJobs = async (companyName) => {
    try {
      const encodedCompanyName = encodeURIComponent(companyName);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/jobs?companyName=${encodedCompanyName}`
      );

      const clientJobs = data.clientJobs;

      clientJobs.forEach((jobEntry) => {
        const { job } = jobEntry;
        const { _id } = jobEntry;

        switch (job.jobName) {
          case "Bookkeeping":
            setClientBookKeepingFormData((prevFormData) => {
              const updatedFormData = {
                ...prevFormData,
                clientId: _id,
                jobName: job.jobName,
                yearEnd: formatDate(job.yearEnd) || prevFormData.yearEnd,
                jobDeadline:
                  formatDate(job.jobDeadline) || prevFormData.jobDeadline,
                workDeadline:
                  formatDate(job.workDeadline) || prevFormData.workDeadline,
                hours: job.hours || prevFormData.hours,
                fee: job.fee || prevFormData.fee,
                lead: job.lead || prevFormData.lead,
                jobHolder: job.jobHolder || prevFormData.jobHolder,

                jobStatus: job.jobStatus || prevFormData.jobStatus,
              };
              if (Object.values(updatedFormData).some((value) => value)) {
                handleCheckboxChange(updatedFormData, true);
              }
              return updatedFormData;
            });
            break;

          case "Payroll":
            setClientPayRollFormData((prevFormData) => {
              const updatedFormData = {
                ...prevFormData,
                clientId: _id,
                jobName: job.jobName,
                yearEnd: formatDate(job.yearEnd) || prevFormData.yearEnd,
                jobDeadline:
                  formatDate(job.jobDeadline) || prevFormData.jobDeadline,
                workDeadline:
                  formatDate(job.workDeadline) || prevFormData.workDeadline,
                hours: job.hours || prevFormData.hours,
                fee: job.fee || prevFormData.fee,
                lead: job.lead || prevFormData.lead,
                jobHolder: job.jobHolder || prevFormData.jobHolder,

                jobStatus: job.jobStatus || prevFormData.jobStatus,
              };
              if (Object.values(updatedFormData).some((value) => value)) {
                handleCheckboxChange(updatedFormData, true);
              }
              return updatedFormData;
            });
            break;

          case "Vat Return":
            setClientVatReturnFormData((prevFormData) => {
              const updatedFormData = {
                ...prevFormData,
                clientId: _id,
                jobName: job.jobName,
                yearEnd: formatDate(job.yearEnd) || prevFormData.yearEnd,
                jobDeadline:
                  formatDate(job.jobDeadline) || prevFormData.jobDeadline,
                workDeadline:
                  formatDate(job.workDeadline) || prevFormData.workDeadline,
                hours: job.hours || prevFormData.hours,
                fee: job.fee || prevFormData.fee,
                lead: job.lead || prevFormData.lead,
                jobHolder: job.jobHolder || prevFormData.jobHolder,

                jobStatus: job.jobStatus || prevFormData.jobStatus,
              };
              if (Object.values(updatedFormData).some((value) => value)) {
                handleCheckboxChange(updatedFormData, true);
              }
              return updatedFormData;
            });
            break;

          case "Personal Tax":
            setClientPersonalTaxFormData((prevFormData) => {
              const updatedFormData = {
                ...prevFormData,
                clientId: _id,
                jobName: job.jobName,
                yearEnd: formatDate(job.yearEnd) || prevFormData.yearEnd,
                jobDeadline:
                  formatDate(job.jobDeadline) || prevFormData.jobDeadline,
                workDeadline:
                  formatDate(job.workDeadline) || prevFormData.workDeadline,
                hours: job.hours || prevFormData.hours,
                fee: job.fee || prevFormData.fee,
                lead: job.lead || prevFormData.lead,
                jobHolder: job.jobHolder || prevFormData.jobHolder,

                jobStatus: job.jobStatus || prevFormData.jobStatus,
              };
              if (Object.values(updatedFormData).some((value) => value)) {
                handleCheckboxChange(updatedFormData, true);
              }
              return updatedFormData;
            });
            break;

          case "Accounts":
            setClientAccountsFormData((prevFormData) => {
              const updatedFormData = {
                ...prevFormData,
                clientId: _id,
                jobName: job.jobName,
                yearEnd: formatDate(job.yearEnd) || prevFormData.yearEnd,
                jobDeadline:
                  formatDate(job.jobDeadline) || prevFormData.jobDeadline,
                workDeadline:
                  formatDate(job.workDeadline) || prevFormData.workDeadline,
                hours: job.hours || prevFormData.hours,
                fee: job.fee || prevFormData.fee,
                lead: job.lead || prevFormData.lead,
                jobHolder: job.jobHolder || prevFormData.jobHolder,

                jobStatus: job.jobStatus || prevFormData.jobStatus,
              };
              if (Object.values(updatedFormData).some((value) => value)) {
                handleCheckboxChange(updatedFormData, true);
              }
              return updatedFormData;
            });
            break;

          case "Company Sec":
            setClientCompanySecFormData((prevFormData) => {
              const updatedFormData = {
                ...prevFormData,
                clientId: _id,
                jobName: job.jobName,
                yearEnd: formatDate(job.yearEnd) || prevFormData.yearEnd,
                jobDeadline:
                  formatDate(job.jobDeadline) || prevFormData.jobDeadline,
                workDeadline:
                  formatDate(job.workDeadline) || prevFormData.workDeadline,
                hours: job.hours || prevFormData.hours,
                fee: job.fee || prevFormData.fee,
                lead: job.lead || prevFormData.lead,
                jobHolder: job.jobHolder || prevFormData.jobHolder,

                jobStatus: job.jobStatus || prevFormData.jobStatus,
              };
              if (Object.values(updatedFormData).some((value) => value)) {
                handleCheckboxChange(updatedFormData, true);
              }
              return updatedFormData;
            });
            break;

          case "Address":
            setClientAddressFormData((prevFormData) => {
              const updatedFormData = {
                ...prevFormData,
                clientId: _id,
                jobName: job.jobName,
                yearEnd: formatDate(job.yearEnd) || prevFormData.yearEnd,
                jobDeadline:
                  formatDate(job.jobDeadline) || prevFormData.jobDeadline,
                workDeadline:
                  formatDate(job.workDeadline) || prevFormData.workDeadline,
                hours: job.hours || prevFormData.hours,
                fee: job.fee || prevFormData.fee,
                lead: job.lead || prevFormData.lead,
                jobHolder: job.jobHolder || prevFormData.jobHolder,

                jobStatus: job.jobStatus || prevFormData.jobStatus,
              };
              if (Object.values(updatedFormData).some((value) => value)) {
                handleCheckboxChange(updatedFormData, true);
              }
              return updatedFormData;
            });
            break;

          default:
            break;
        }
      });
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Error in fetching client jobs"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Add & remove Jobs

  const handleCheckboxChange = (formData, isChecked) => {
    if (isChecked) {
      setJobs((prevJobs) => [...prevJobs, formData]);
    } else {
      setJobs((prevJobs) =>
        prevJobs.filter((job) => job.jobName !== formData.jobName)
      );
    }
  };

  // Handle Update Value in Jobs
  const handleFormDataChange = (formData, setFormData, field, value) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData, [field]: value };

      setJobs((prevJobs) => {
        const jobIndex = prevJobs.findIndex(
          (job) => job.jobName === updatedData.jobName
        );
        if (jobIndex !== -1) {
          const updatedJobs = [...prevJobs];
          updatedJobs[jobIndex] = updatedData;
          return updatedJobs;
        }
        return prevJobs;
      });

      return updatedData;
    });
  };

  // Get All Users

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(
        data?.users?.filter((user) =>
          user?.role?.access?.some((item) => item?.permission?.includes("Jobs"))
        )
      );
      console.log("users", data?.users);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();

    //eslint-disable-next-line
  }, []);

  //   Update Job
  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (jobs.length === 0) {
      return toast.error("At least one job is required!");
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/client/create/client/job`,
        {
          clientName,
          regNumber,
          companyName,
          email,
          phone,
          totalHours,
          currentDate,
          source,
          clientType,
          partner,
          country,
          fee,
          ctLogin,
          pyeLogin,
          trLogin,
          vatLogin,
          authCode,
          ctPassword,
          pyePassword,
          trPassword,
          vatPassword,
          utr,
          clientPaidFee,

          jobs,
        }
      );
      if (data) {
        allClientJobData();
        toast.success("Job updated successfully!");
        setIsOpen(false);
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  //   Get Currect Date
  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Set the current date when the component mounts
  useEffect(() => {
    const date = getCurrentDate();
    setCurrentDate(date);
  }, []);









     const isJobSelected = (jobs, jobName) => {
  return jobs.some((job) => job.jobName === jobName);
};



    return (
      <div className="relative w-full sm:w-full lg:w-[95%] xl:w-[85%] 2xl:w-[80%] 3xl:w-[70%]    z-[50]  px-12 py-5 shadow-md shadow-black/25 rounded-xl bg-gray-200 hidden1   ">
        {/* <div className="w-full py-1 bg-orange-500/35 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="h-[3rem] w-[8rem]" />
        </div> */}
  
                 <button
         onClick={() => setIsOpen(false)}
          className="absolute top-0 translate-x-[50%] -translate-y-[50%] z-[9999] right-0 p-2 rounded-full bg-gray-500 shadow-md hover:shadow-lg transition-all duration-200 text-white  hover:bg-orange-500 outline-none"
          aria-label="Close Modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
  
        <div className="flex flex-col gap-2">
          <div className="w-full"></div>
          <h1 className="text-lg font-medium my-3 w-full text-center py-2 px-4 rounded-md text-white bg-[#254e7f]">
            Create Client Job (Copy Job)
          </h1>
  
          <form
            className="w-full h-full flex flex-col gap-8 "
            onSubmit={handleCreateJob}
          >
            <div className="w-full max-w-[1000px] mx-auto    h-full grid grid-cols-1 gap-6 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:[grid-template-columns:1fr_1fr_1.5fr_1fr] ">
              {/* 1 */}
              <div className=" flex flex-col gap-3  ">
                <h3 className="w-full h-[2.7rem] rounded-md text-white bg-[#254e7f] flex items-center justify-center text-[16px] sm:text-[18px] font-[300] ">
                  Job Details
                </h3>
                <input
                  type="text"
                  placeholder="Client Name"
                  className={`${style.input} `}
                  value={clientName}
                  required
                  onChange={(e) => setClientName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Reg Number"
                  className={`${style.input}`}
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Company Name"
                  required
                  className={`${style.input}`}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className={`${style.input}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
  
  
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className={`${style.input}`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
  
  
  
                
              </div>
              {/* 2 */}
              <div className="flex flex-col gap-3">
                <h3 className="w-full h-[2.7rem] rounded-md text-white bg-[#254e7f] flex items-center justify-center text-[16px] sm:text-[18px] font-[300] ">
                  Sales Details
                </h3>
                <input
                  type="date"
                  placeholder="Current Date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className={`${style.input}`}
                />
                <select
                  className={`${style.input} h-[2.5rem] `}
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="">Source</option>
                  {sources?.map((s, i) => (
                    <option value={s} key={i}>
                      {s}
                    </option>
                  ))}
                </select>
  
                <select
                  className={`${style.input} h-[2.5rem] `}
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value)}
                >
                  <option value="">Client Type</option>
                  {clients?.map((c, i) => (
                    <option value={c} key={i}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  className={`${style.input} h-[2.5rem] `}
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                >
                  <option value="">Partner</option>
                  {partners?.map((part, i) => (
                    <option value={part} key={i}>
                      {part}
                    </option>
                  ))}
                </select>
                
                <div className="w-full flex items-center justify-between gap-2">
  
                  <input
                  type="text"
                  placeholder="Paid Fee"
                  className={`${style.input} w-[50%]`}
                  value={clientPaidFee}
                  onChange={(e) => setClientPaidFee(e.target.value)}
                  required
                />
  
                <input
                  type="text"
                  placeholder="Hours"
                  className={`${style.input} w-[50%]`}
                  value={totalHours}
                  onChange={(e) => setTotalHours(e.target.value)}
                />
  
                </div>
  
              </div>
              {/* 3 */}
              <div className=" flex flex-col gap-3">
                <h3 className="w-full h-[2.7rem] rounded-md text-white bg-[#254e7f] flex items-center justify-center text-[16px] sm:text-[18px] font-[300] ">
                  Login Information
                </h3>
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="test"
                    placeholder="CT User"
                    className={`${style.input}`}
                    value={ctLogin}
                    onChange={(e) => setCtLogin(e.target.value)}
                  />
                  <input
                    type="test"
                    placeholder="CT Password"
                    className={`${style.input}`}
                    value={ctPassword}
                    onChange={(e) => setCtPassowrd(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="test"
                    placeholder="PYE User"
                    className={`${style.input}`}
                    value={pyeLogin}
                    onChange={(e) => setPyeLogin(e.target.value)}
                  />
                  <input
                    type="test"
                    placeholder="PYE Password"
                    className={`${style.input}`}
                    value={pyePassword}
                    onChange={(e) => setPyePassowrd(e.target.value)}
                  />
                </div>
  
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="test"
                    placeholder="TR User"
                    className={`${style.input}`}
                    value={trLogin}
                    onChange={(e) => setTrLogin(e.target.value)}
                  />
                  <input
                    type="test"
                    placeholder="TR Password"
                    className={`${style.input}`}
                    value={trPassword}
                    onChange={(e) => setTrPassowrd(e.target.value)}
                  />
                </div>
  
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="text"
                    placeholder="VAT User"
                    className={`${style.input}`}
                    value={vatLogin}
                    onChange={(e) => setVatLogin(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="VAT Password"
                    className={`${style.input}`}
                    value={vatPassword}
                    onChange={(e) => setVatPassowrd(e.target.value)}
                  />
                </div>
              </div>
              {/* 4 */}
              <div className="flex flex-col gap-3">
                <h3 className="w-full h-[2.7rem] rounded-md text-white bg-[#254e7f] flex items-center justify-center text-[16px] sm:text-[18px] font-[300] ">
                  Tax Number
                </h3>
                <input
                  type="text"
                  placeholder="Authentication Code"
                  className={`${style.input}`}
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="UTR"
                  className={`${style.input}`}
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Country"
                  className={`${style.input}`}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>
  
            {/*---------- Jobs--------- */}
            <div className="flex flex-col gap-4 ">
              {/* Bookkeeping */}
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 w-full">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      handleCheckboxChange(
                        clientBookKeepingFormData,
                        e.target.checked
                      )
                    }
                    checked={jobs.some(
                    (job) => job.jobName === clientBookKeepingFormData.jobName
                  )}
                    style={{ width: "18px", height: "18px" }}
  
                    
  
  
                     
  
                  />
                  <span className="font-medium w-[10rem] bg-gray-300 rounded-md py-[5px] px-[.6rem]">
                    {clientBookKeepingFormData.jobName}
                  </span>
                </label>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Year End"
                    value={clientBookKeepingFormData.yearEnd}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientBookKeepingFormData,
                        setClientBookKeepingFormData,
                        "yearEnd",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Year End</span>
                </div>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Job Deadline"
                    value={clientBookKeepingFormData.jobDeadline}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientBookKeepingFormData,
                        setClientBookKeepingFormData,
                        "jobDeadline",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Deadline</span>
                </div>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Work Deadline"
                    value={clientBookKeepingFormData.workDeadline}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientBookKeepingFormData,
                        setClientBookKeepingFormData,
                        "workDeadline",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Job Date</span>
                </div>
                <div className="inputBox">
                  <input
                    type="text"
                    placeholder="Hours"
                    value={clientBookKeepingFormData.hours}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientBookKeepingFormData,
                        setClientBookKeepingFormData,
                        "hours",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                </div>
                <div className="inputBox ">
                  <input
                    type="text"
                    placeholder="Fee"
                    value={clientBookKeepingFormData.fee}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientBookKeepingFormData,
                        setClientBookKeepingFormData,
                        "fee",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full ${
                      isJobSelected(jobs, clientBookKeepingFormData.jobName) && (clientBookKeepingFormData.fee?.length <= 0)
                        ? "placeholder-red-500 !border-red-500 "
                        : ""
                    }`}
                    required={isJobSelected(jobs, clientBookKeepingFormData.jobName)}
                  />
                </div>
                <select
                  value={clientBookKeepingFormData.lead}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientBookKeepingFormData,
                      setClientBookKeepingFormData,
                      "lead",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Owner</option>
                  {users.map((lead) => (
                    <option key={lead._id} value={lead?.name}>
                      {lead?.name}
                    </option>
                  ))}
                </select>
                <select
                  value={clientBookKeepingFormData.jobHolder}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientBookKeepingFormData,
                      setClientBookKeepingFormData,
                      "jobHolder",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Job holder</option>
                  {users.map((jh) => (
                    <option key={jh._id} value={jh.name}>
                      {jh.name}
                    </option>
                  ))}
                </select>
  
                 <select
                  value={clientBookKeepingFormData.jobStatus}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientBookKeepingFormData,
                      setClientBookKeepingFormData,
                      "jobStatus",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Job Status</option>
                  {jobStatuses.map((el) => (
                    <option key={el} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
  
  
              </div>
  
              {/* Payroll */}
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 w-full">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      handleCheckboxChange(
                        clientPayRollFormData,
                        e.target.checked
                      )
                    }
                    checked={jobs.some(
                    (job) => job.jobName === clientPayRollFormData.jobName
                  )}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span className="font-medium w-[10rem] bg-gray-300 rounded-md py-[5px] px-[.6rem]">
                    {clientPayRollFormData.jobName}
                  </span>
                </label>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Year End"
                    value={clientPayRollFormData.yearEnd}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientPayRollFormData,
                        setClientPayRollFormData,
                        "yearEnd",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Year End</span>
                </div>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Job Deadline"
                    value={clientPayRollFormData.jobDeadline}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientPayRollFormData,
                        setClientPayRollFormData,
                        "jobDeadline",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Deadline</span>
                </div>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Work Deadline"
                    value={clientPayRollFormData.workDeadline}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientPayRollFormData,
                        setClientPayRollFormData,
                        "workDeadline",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Job Date</span>
                </div>
                <div className="inputBox">
                  <input
                    type="text"
                    placeholder="Hours"
                    value={clientPayRollFormData.hours}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientPayRollFormData,
                        setClientPayRollFormData,
                        "hours",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                </div>
                <div className="inputBox">
                  <input
                    type="text"
                    placeholder="Fee"
                    value={clientPayRollFormData.fee}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientPayRollFormData,
                        setClientPayRollFormData,
                        "fee",
                        e.target.value
                      )
                    }
                     
                    className={`${style.input} w-full ${
                      isJobSelected(jobs, clientPayRollFormData.jobName) && (clientPayRollFormData.fee?.length <= 0)
                        ? "placeholder-red-500 !border-red-500 "
                        : ""
                    }`}
                    required={isJobSelected(jobs, clientPayRollFormData.jobName)}
                  />
                </div>
                <select
                  value={clientPayRollFormData.lead}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientPayRollFormData,
                      setClientPayRollFormData,
                      "lead",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Owner</option>
                  {users.map((lead) => (
                    <option key={lead._id} value={lead?.name}>
                      {lead?.name}
                    </option>
                  ))}
                </select>
                <select
                  value={clientPayRollFormData.jobHolder}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientPayRollFormData,
                      setClientPayRollFormData,
                      "jobHolder",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Job holder</option>
                  {users.map((jh) => (
                    <option key={jh._id} value={jh.name}>
                      {jh.name}
                    </option>
                  ))}
                </select>
  
                 <select
                  value={clientPayRollFormData.jobStatus}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientPayRollFormData,
                      setClientPayRollFormData,
                      "jobStatus",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Job Status</option>
                  {jobStatuses.map((el) => (
                    <option key={el} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
  
  
              </div>
  
              {/* VAT Return */}
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 w-full">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      handleCheckboxChange(
                        clientVatReturnFormData,
                        e.target.checked
                      )
                    }
                    checked={jobs.some(
                    (job) => job.jobName === clientVatReturnFormData.jobName
                  )}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span className="font-medium w-[10rem] bg-gray-300 rounded-md py-[5px] px-[.6rem]">
                    {clientVatReturnFormData.jobName}
                  </span>
                </label>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Year End"
                    value={clientVatReturnFormData.yearEnd}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientVatReturnFormData,
                        setClientVatReturnFormData,
                        "yearEnd",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Year End</span>
                </div>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Job Deadline"
                    value={clientVatReturnFormData.jobDeadline}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientVatReturnFormData,
                        setClientVatReturnFormData,
                        "jobDeadline",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Deadline</span>
                </div>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Work Deadline"
                    value={clientVatReturnFormData.workDeadline}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientVatReturnFormData,
                        setClientVatReturnFormData,
                        "workDeadline",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Job Date</span>
                </div>
                <div className="inputBox">
                  <input
                    type="text"
                    placeholder="Hours"
                    value={clientVatReturnFormData.hours}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientVatReturnFormData,
                        setClientVatReturnFormData,
                        "hours",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                </div>
                <div className="inputBox">
                  <input
                    type="text"
                    placeholder="Fee"
                    value={clientVatReturnFormData.fee}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientVatReturnFormData,
                        setClientVatReturnFormData,
                        "fee",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full ${
                      isJobSelected(jobs, clientVatReturnFormData.jobName) && (clientVatReturnFormData.fee?.length <= 0)
                        ? "placeholder-red-500 !border-red-500 "
                        : ""
                    }`}
                    required={isJobSelected(jobs, clientVatReturnFormData.jobName)}
                  />
                </div>
                <select
                  value={clientVatReturnFormData.lead}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientVatReturnFormData,
                      setClientVatReturnFormData,
                      "lead",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Owner</option>
                  {users.map((lead) => (
                    <option key={lead._id} value={lead?.name}>
                      {lead?.name}
                    </option>
                  ))}
                </select>
                <select
                  value={clientVatReturnFormData.jobHolder}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientVatReturnFormData,
                      setClientVatReturnFormData,
                      "jobHolder",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Job holder</option>
                  {users.map((jh) => (
                    <option key={jh._id} value={jh.name}>
                      {jh.name}
                    </option>
                  ))}
                </select>
  
                <select
                  value={clientVatReturnFormData.jobStatus}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientVatReturnFormData,
                      setClientVatReturnFormData,
                      "jobStatus",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Job Status</option>
                  {jobStatuses.map((el) => (
                    <option key={el} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
  
  
              </div>
              {/* 4 */}
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 w-full">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      handleCheckboxChange(
                        clientPersonalTaxFormData,
                        e.target.checked
                      )
                    }
                    checked={jobs.some(
                    (job) => job.jobName === clientPersonalTaxFormData.jobName
                  )}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span className="font-medium w-[10rem] bg-gray-300 rounded-md py-[5px] px-[.6rem]">
                    {clientPersonalTaxFormData.jobName}
                  </span>
                </label>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Year End"
                    value={clientPersonalTaxFormData.yearEnd}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientPersonalTaxFormData,
                        setClientPersonalTaxFormData,
                        "yearEnd",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Year End</span>
                </div>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Job Deadline"
                    value={clientPersonalTaxFormData.jobDeadline}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientPersonalTaxFormData,
                        setClientPersonalTaxFormData,
                        "jobDeadline",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Deadline</span>
                </div>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Work Deadline"
                    value={clientPersonalTaxFormData.workDeadline}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientPersonalTaxFormData,
                        setClientPersonalTaxFormData,
                        "workDeadline",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Job Date</span>
                </div>
                <div className="inputBox">
                  <input
                    type="text"
                    placeholder="Hours"
                    value={clientPersonalTaxFormData.hours}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientPersonalTaxFormData,
                        setClientPersonalTaxFormData,
                        "hours",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                </div>
                <div className="inputBox">
                  <input
                    type="text"
                    placeholder="Fee"
                    value={clientPersonalTaxFormData.fee}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientPersonalTaxFormData,
                        setClientPersonalTaxFormData,
                        "fee",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full ${
                      isJobSelected(jobs, clientPersonalTaxFormData.jobName) && (clientPersonalTaxFormData.fee?.length <= 0)
                        ? "placeholder-red-500 !border-red-500 "
                        : ""
                    }`}
                    required={isJobSelected(jobs, clientPersonalTaxFormData.jobName)}
                  />
                </div>
                <select
                  value={clientPersonalTaxFormData.lead}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientPersonalTaxFormData,
                      setClientPersonalTaxFormData,
                      "lead",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Owner</option>
                  {users.map((lead) => (
                    <option key={lead._id} value={lead?.name}>
                      {lead?.name}
                    </option>
                  ))}
                </select>
                <select
                  value={clientPersonalTaxFormData.jobHolder}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientPersonalTaxFormData,
                      setClientPersonalTaxFormData,
                      "jobHolder",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Job holder</option>
                  {users.map((jh) => (
                    <option key={jh._id} value={jh.name}>
                      {jh.name}
                    </option>
                  ))}
                </select>
  
                <select
                  value={clientPersonalTaxFormData.jobStatus}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientPersonalTaxFormData,
                      setClientPersonalTaxFormData,
                      "jobStatus",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Job Status</option>
                  {jobStatuses.map((el) => (
                    <option key={el} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
  
  
              </div>
              {/* 5 */}
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 w-full">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      handleCheckboxChange(
                        clientAccountsFormData,
                        e.target.checked
                      )
                    }
                     checked={jobs.some(
                    (job) => job.jobName === clientAccountsFormData.jobName
                  )}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span className="font-medium w-[10rem] bg-gray-300 rounded-md py-[5px] px-[.6rem]">
                    {clientAccountsFormData.jobName}
                  </span>
                </label>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Year End"
                    value={clientAccountsFormData.yearEnd}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientAccountsFormData,
                        setClientAccountsFormData,
                        "yearEnd",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Year End</span>
                </div>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Job Deadline"
                    value={clientAccountsFormData.jobDeadline}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientAccountsFormData,
                        setClientAccountsFormData,
                        "jobDeadline",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Deadline</span>
                </div>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Work Deadline"
                    value={clientAccountsFormData.workDeadline}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientAccountsFormData,
                        setClientAccountsFormData,
                        "workDeadline",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Job Date</span>
                </div>
                <div className="inputBox">
                  <input
                    type="text"
                    placeholder="Hours"
                    value={clientAccountsFormData.hours}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientAccountsFormData,
                        setClientAccountsFormData,
                        "hours",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                </div>
                <div className="inputBox">
                  <input
                    type="text"
                    placeholder="Fee"
                    value={clientAccountsFormData.fee}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientAccountsFormData,
                        setClientAccountsFormData,
                        "fee",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full ${
                      isJobSelected(jobs, clientAccountsFormData.jobName) && (clientAccountsFormData.fee?.length <= 0)
                        ? "placeholder-red-500 !border-red-500 "
                        : ""
                    }`}
                    required={isJobSelected(jobs, clientAccountsFormData.jobName)}
                  />
                </div>
                <select
                  value={clientAccountsFormData.lead}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientAccountsFormData,
                      setClientAccountsFormData,
                      "lead",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Owner</option>
                  {users.map((lead) => (
                    <option key={lead._id} value={lead?.name}>
                      {lead?.name}
                    </option>
                  ))}
                </select>
                <select
                  value={clientAccountsFormData.jobHolder}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientAccountsFormData,
                      setClientAccountsFormData,
                      "jobHolder",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Job holder</option>
                  {users.map((jh) => (
                    <option key={jh._id} value={jh.name}>
                      {jh.name}
                    </option>
                  ))}
                </select>
  
                <select
                  value={clientAccountsFormData.jobStatus}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientAccountsFormData,
                      setClientAccountsFormData,
                      "jobStatus",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Job Status</option>
                  {jobStatuses.map((el) => (
                    <option key={el} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
  
  
              </div>
              {/* 6 */}
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 w-full">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      handleCheckboxChange(
                        clientCompanySecFormData,
                        e.target.checked
                      )
                    }
                    checked={jobs.some(
                    (job) => job.jobName === clientCompanySecFormData.jobName
                  )}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span className="font-medium w-[10rem] bg-gray-300 rounded-md py-[5px] px-[.6rem]">
                    {clientCompanySecFormData.jobName}
                  </span>
                </label>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Year End"
                    value={clientCompanySecFormData.yearEnd}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientCompanySecFormData,
                        setClientCompanySecFormData,
                        "yearEnd",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Year End</span>
                </div>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Job Deadline"
                    value={clientCompanySecFormData.jobDeadline}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientCompanySecFormData,
                        setClientCompanySecFormData,
                        "jobDeadline",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Deadline</span>
                </div>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Work Deadline"
                    value={clientCompanySecFormData.workDeadline}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientCompanySecFormData,
                        setClientCompanySecFormData,
                        "workDeadline",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Job Date</span>
                </div>
                <div className="inputBox">
                  <input
                    type="text"
                    placeholder="Hours"
                    value={clientCompanySecFormData.hours}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientCompanySecFormData,
                        setClientCompanySecFormData,
                        "hours",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                </div>
                <div className="inputBox">
                  <input
                    type="text"
                    placeholder="Fee"
                    value={clientCompanySecFormData.fee}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientCompanySecFormData,
                        setClientCompanySecFormData,
                        "fee",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full ${
                      isJobSelected(jobs, clientCompanySecFormData.jobName) && (clientCompanySecFormData.fee?.length <= 0)
                        ? "placeholder-red-500 !border-red-500 "
                        : ""
                    }`}
                    required={isJobSelected(jobs, clientCompanySecFormData.jobName)}
                  />
                </div>
                <select
                  value={clientCompanySecFormData.lead}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientCompanySecFormData,
                      setClientCompanySecFormData,
                      "lead",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Owner</option>
                  {users.map((lead) => (
                    <option key={lead._id} value={lead?.name}>
                      {lead?.name}
                    </option>
                  ))}
                </select>
                <select
                  value={clientCompanySecFormData.jobHolder}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientCompanySecFormData,
                      setClientCompanySecFormData,
                      "jobHolder",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Job holder</option>
                  {users.map((jh) => (
                    <option key={jh._id} value={jh.name}>
                      {jh.name}
                    </option>
                  ))}
                </select>
  
  
                <select
                  value={clientCompanySecFormData.jobStatus}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientAccountsFormData,
                      setClientCompanySecFormData,
                      "jobStatus",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Job Status</option>
                  {jobStatuses.map((el) => (
                    <option key={el} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
  
  
              </div>
              {/* 7 */}
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 w-full">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      handleCheckboxChange(
                        clientAddressFormData,
                        e.target.checked
                      )
                    }
                    checked={jobs.some(
                    (job) => job.jobName === clientAddressFormData.jobName
                  )}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span className="font-medium w-[10rem] bg-gray-300 rounded-md py-[5px] px-[.6rem]">
                    {clientAddressFormData.jobName}
                  </span>
                </label>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Year End"
                    value={clientAddressFormData.yearEnd}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientAddressFormData,
                        setClientAddressFormData,
                        "yearEnd",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Year End</span>
                </div>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Job Deadline"
                    value={clientAddressFormData.jobDeadline}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientAddressFormData,
                        setClientAddressFormData,
                        "jobDeadline",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Deadline</span>
                </div>
                <div className="inputBox">
                  <input
                    type="date"
                    placeholder="Work Deadline"
                    value={clientAddressFormData.workDeadline}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientAddressFormData,
                        setClientAddressFormData,
                        "workDeadline",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                  <span>Job Date</span>
                </div>
                <div className="inputBox">
                  <input
                    type="text"
                    placeholder="Hours"
                    value={clientAddressFormData.hours}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientAddressFormData,
                        setClientAddressFormData,
                        "hours",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full `}
                  />
                </div>
                <div className="inputBox">
                  <input
                    type="text"
                    placeholder="Fee"
                    value={clientAddressFormData.fee}
                    onChange={(e) =>
                      handleFormDataChange(
                        clientAddressFormData,
                        setClientAddressFormData,
                        "fee",
                        e.target.value
                      )
                    }
                    className={`${style.input} w-full ${
                      isJobSelected(jobs, clientAddressFormData.jobName) && (clientAddressFormData.fee?.length <= 0)
                        ? "placeholder-red-500 !border-red-500 "
                        : ""
                    }`}
                    required={isJobSelected(jobs, clientAddressFormData.jobName)}
                  />
                </div>
                <select
                  value={clientAddressFormData.lead}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientAddressFormData,
                      setClientAddressFormData,
                      "lead",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Owner</option>
                  {users.map((lead) => (
                    <option key={lead._id} value={lead?.name}>
                      {lead?.name}
                    </option>
                  ))}
                </select>
                <select
                  value={clientAddressFormData.jobHolder}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientAddressFormData,
                      setClientAddressFormData,
                      "jobHolder",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Job holder</option>
                  {users.map((jh) => (
                    <option key={jh._id} value={jh.name}>
                      {jh.name}
                    </option>
                  ))}
                </select>
  
                <select
                  value={clientAddressFormData.jobStatus}
                  onChange={(e) =>
                    handleFormDataChange(
                      clientAddressFormData,
                      setClientAddressFormData,
                      "jobStatus",
                      e.target.value
                    )
                  }
                  className={`${style.input} w-full `}
                >
                  <option value="">Job Status</option>
                  {jobStatuses.map((el) => (
                    <option key={el} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/*  */}
            <div className="flex items-center justify-end pb-6">
              <button
                disabled={loading}
                className={`${style.btn} ${loading && "cursor-not-allowed"}`}
              >
                {loading ? (
                  <BiLoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}
