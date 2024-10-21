import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiLoaderCircle } from "react-icons/bi";
import axios from "axios";
import { style } from "../utlis/CommonStyle";
import { IoClose } from "react-icons/io5";
import Select from "react-select";

export default function SubscriptionModel({
  setIsOpen,
  fetchSubscriptions,
  subscriptionId,
  setSubscriptionId,
}) {
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [source, setSource] = useState("");
  const [clientType, setClientType] = useState("");
  const [partner, setPartner] = useState("");
  const [country, setCountry] = useState("");
  const [fee, setFee] = useState("");
  const [ctLogin, setCtLogin] = useState("");
  const [ctPassword, setCtPassowrd] = useState("");
  const [pyeLogin, setPyeLogin] = useState("");
  const [pyePassword, setPyePassowrd] = useState("");
  const [trLogin, setTrLogin] = useState("");
  const [trPassword, setTrPassowrd] = useState("");
  const [vatLogin, setVatLogin] = useState("");
  const [vatPassword, setVatPassowrd] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [utr, setUtr] = useState("");
  const [clientData, setClientData] = useState([]);
  const [clientId, setClientId] = useState("");
  const [job, setJob] = useState({
    jobName: "Subscription",
    billingStart: "",
    billingEnd: "",
    deadline: "",
    hours: "",
    fee: "",
    lead: "",
    jobHolder: "",
  });
  const [users, setUsers] = useState([]);

  const sources = ["FIV", "UPW", "PPH", "Website", "Referal", "Partner"];
  const clients = ["Limited", "LLP", "Individual", "Non UK"];
  const partners = ["Affotax", "Outsource", "OTL"];

  const allClientJobData = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/tickets/clients`
      );
      if (data) {
        setClientData(data?.clients);
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

  // Fetching Client Detail
  const fetchClientDetail = async () => {
    if (!clientId) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/single/client/${clientId}`
      );
      if (data) {
        console.log("Client Detail:", data?.clientJob);
        setClientName(data?.clientJob?.clientName);
        setRegNumber(data?.clientJob?.regNumber);
        setCompanyName(data?.clientJob?.companyName);
        setEmail(data?.clientJob?.email);
        setTotalHours(data?.clientJob?.totalHours);
        setSource(data?.clientJob?.source);
        setClientType(data?.clientJob?.clientType);
        setPartner(data?.clientJob?.partner);
        setFee(data?.clientJob?.fee);
        setVatLogin(data?.clientJob?.vatLogin);
        setVatPassowrd(data?.clientJob?.vatPassword);
        setPyeLogin(data?.clientJob?.pyeLogin);
        setPyePassowrd(data?.clientJob?.pyePassword);
        setTrLogin(data?.clientJob?.trLogin);
        setCtLogin(data?.clientJob?.ctLogin);
        setCtPassowrd(data?.clientJob?.ctPassword);
        setAuthCode(data?.clientJob?.authCode);
        setUtr(data?.clientJob?.utr);
        setCountry(data?.clientJob?.country);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    }
  };

  useEffect(() => {
    fetchClientDetail();
    // eslint-disable-next-line
  }, [clientId]);

  //   Select Client
  const options = clientData.map((item) => ({
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
      backgroundColor: state.isSelected ? "#f0f0f0" : "white",
      color: state.isSelected ? "black" : "black",
      cursor: "pointer",
    }),
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  //   Get Single Subscription
  const singleSubscription = async () => {
    if (!subscriptionId) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/subscriptions/fetch/single/${subscriptionId}`
      );
      if (data) {
        const subscription = data.subscription;
        setClientName(subscription.clientName);
        setRegNumber(subscription.regNumber);
        setCompanyName(subscription.companyName);
        setEmail(subscription.email);
        setTotalHours(subscription.totalHours);
        setCurrentDate(formatDate(subscription.currentDate));
        setSource(subscription.source);
        setClientType(subscription.clientType);
        setPartner(subscription.partner);
        setCountry(subscription.country);
        setFee(subscription.fee);
        setCtLogin(subscription.ctLogin);
        setCtPassowrd(subscription.ctPassword);
        setPyeLogin(subscription.pyeLogin);
        setPyePassowrd(subscription.pyePassword);
        setTrLogin(subscription.trLogin);
        setTrPassowrd(subscription.trPassword);
        setVatLogin(subscription.vatLogin);
        setVatPassowrd(subscription.vatPassword);
        setAuthCode(subscription.authCode);
        setUtr(subscription.utr);
        //
        setJob({
          jobName: "Subscription",
          billingStart: formatDate(subscription.job.billingStart),
          billingEnd: formatDate(subscription.job.billingEnd),
          deadline: formatDate(subscription.job.deadline),
          hours: subscription.job.hours,
          fee: subscription.job.fee,
          lead: subscription.job.lead,
          jobHolder: subscription.job.jobHolder,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    singleSubscription();

    // eslint-disable-next-line
  }, [subscriptionId]);

  // Get All Users

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access.some((item) =>
            item.permission.includes("Subscription")
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

  //   Add Job
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (subscriptionId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/subscriptions/update/subscription/${subscriptionId}`,
          {
            clientName,
            regNumber,
            companyName,
            email,
            totalHours,
            currentDate,
            source,
            clientType,
            partner,
            country,
            fee,
            ctLogin,
            ctPassword,
            pyeLogin,
            pyePassword,
            trLogin,
            trPassword,
            vatLogin,
            vatPassword,
            authCode,
            utr,
            job,
          }
        );
        if (data) {
          fetchSubscriptions();
          toast.success("Subscription update successfully!");
          setIsOpen(false);
        }

        setLoading(false);
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/subscriptions/create/subscription`,
          {
            clientName,
            regNumber,
            companyName,
            email,
            totalHours,
            currentDate,
            source,
            clientType,
            partner,
            country,
            fee,
            ctLogin,
            ctPassword,
            pyeLogin,
            pyePassword,
            trLogin,
            trPassword,
            vatLogin,
            vatPassword,
            authCode,
            utr,
            job,
          }
        );
        if (data) {
          fetchSubscriptions();

          toast.success("Subscription added successfully!");
          setIsOpen(false);
        }

        setLoading(false);
      }
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
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Set the current date
  useEffect(() => {
    const date = getCurrentDate();
    setCurrentDate(date);
  }, []);

  return (
    <div className="w-full sm:w-[75%] min-h-[30vh]  py-3 pb-4  px-3 sm:px-4 bg-gray-200 hidden1 overflow-y-auto rounded-md ">
      <div className="flex flex-col gap-4">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap ">
            <h1 className="text-lg font-medium my-3 w-fit py-2 px-4 rounded-md text-white bg-[#254e7f]">
              {subscriptionId ? "Update Subscription" : " Add New Subscription"}
            </h1>
            <Select
              className={`${style.input} h-[2.6rem] w-[17rem] flex items-center justify-center px-0 py-0`}
              value={selectedOption}
              onChange={handleChange}
              options={options}
              placeholder="Select Client"
              styles={customStyles}
              isClearable
            />
          </div>

          <span
            onClick={() => {
              setIsOpen(false);
              setSubscriptionId("");
            }}
            className="bg-white/50 hover:bg-white/70 p-1 rounded-full"
          >
            <IoClose className="h-6 w-6 cursor-pointer" />
          </span>
        </div>

        <form className="w-full  flex flex-col gap-5 " onSubmit={handleSubmit}>
          <div className="w-full  grid grid-cols-1 gap-6 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
            {/* 1 */}
            <div className="flex flex-col gap-3">
              <h3 className="w-full h-[2.7rem] rounded-md text-white bg-[#254e7f] flex items-center justify-center text-[16px] sm:text-[18px] font-[300] ">
                Job Details
              </h3>
              <input
                type="text"
                placeholder="Client Name"
                className={`${style.input}`}
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
                type="text"
                placeholder="Hours"
                className={`${style.input}`}
                value={totalHours}
                onChange={(e) => setTotalHours(e.target.value)}
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
              <input
                type="text"
                placeholder="Fee"
                className={`${style.input}`}
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </div>
            {/* 3 */}
            <div className="flex flex-col gap-3">
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
          <div className="flex flex-col gap-4">
            {/* Subscription */}
            <div className="flex items-center gap-4">
              <label className="flex items-center space-x-2 w-full">
                <span className="font-medium w-[10rem] text-white bg-[#254e7f] rounded-md py-[7px] px-[.6rem]">
                  {job.jobName}
                </span>
              </label>
              <div className="inputBox">
                <input
                  type="date"
                  placeholder="Billing Start"
                  value={job.billingStart}
                  onChange={(e) =>
                    setJob((prevJob) => ({
                      ...prevJob,
                      billingStart: e.target.value,
                    }))
                  }
                  className={`${style.input} w-full `}
                />
                <span>Billing Start Date</span>
              </div>
              <div className="inputBox">
                <input
                  type="date"
                  placeholder="Billing End Date"
                  value={job.billingEnd}
                  onChange={(e) =>
                    setJob((prevJob) => ({
                      ...prevJob,
                      billingEnd: e.target.value,
                    }))
                  }
                  className={`${style.input} w-full `}
                />
                <span>Billing End Date</span>
              </div>
              <div className="inputBox">
                <input
                  type="date"
                  placeholder="Deadline"
                  value={job.deadline}
                  onChange={(e) =>
                    setJob((prevJob) => ({
                      ...prevJob,
                      deadline: e.target.value,
                    }))
                  }
                  className={`${style.input} w-full `}
                />
                <span>Deadline</span>
              </div>
              <div className="inputBox">
                <input
                  type="text"
                  placeholder="Hours"
                  value={job.hours}
                  onChange={(e) =>
                    setJob((prevJob) => ({
                      ...prevJob,
                      hours: e.target.value,
                    }))
                  }
                  className={`${style.input} w-full `}
                />
              </div>
              <div className="inputBox">
                <input
                  type="text"
                  placeholder="Fee"
                  value={job.fee}
                  onChange={(e) =>
                    setJob((prevJob) => ({
                      ...prevJob,
                      fee: e.target.value,
                    }))
                  }
                  className={`${style.input} w-full `}
                />
              </div>
              <select
                value={job.lead}
                onChange={(e) =>
                  setJob((prevJob) => ({
                    ...prevJob,
                    lead: e.target.value,
                  }))
                }
                className={`${style.input} w-full `}
              >
                <option value="">Lead</option>
                {users.map((lead) => (
                  <option key={lead._id} value={lead?.name}>
                    {lead?.name}
                  </option>
                ))}
              </select>
              <select
                value={job.jobHolder}
                onChange={(e) =>
                  setJob((prevJob) => ({
                    ...prevJob,
                    jobHolder: e.target.value,
                  }))
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
                <>{subscriptionId ? "Update" : "Create"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
