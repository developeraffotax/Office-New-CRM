import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import Select from "react-select";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";

export default function AddComplaint({
  setShow,
  users,
  setComplaintId,
  complaintId,
  getComplaints,
  errorData,
  solutionData,
}) {
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState("");
  const [client, setClient] = useState("");
  const [department, setDepartment] = useState("");
  const [assign, setAssign] = useState("");
  const [errorType, setErrorType] = useState("");
  const [solution, setSolution] = useState("");
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  const [jobData, setJobData] = useState([]);
  const [createdAt, setCreatedAt] = useState("");

  const departments = [
    "Bookkeeping",
    "Payroll",
    "Vat Return",
    "Personal Tax",
    "Accounts",
    "Company Sec",
    "Address",
  ];

  // Fetch Proposal
  const fetchProposal = async () => {
    if (!complaintId) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/complaints/fetch/single/complaint/${complaintId}`
      );
      const formattedJobDate = new Date(
        data.complaint.createdAt
      ).toLocaleDateString("en-CA");

      if (data) {
        setCompany(data.complaint.company);
        setClient(data.complaint.client);
        setDepartment(data.complaint.department);
        setAssign(data.complaint.assign);
        setErrorType(data.complaint.errorType);
        setSolution(data.complaint.solution);
        setPoints(data.complaint.points);
        setNote(data.complaint.note);
        setCreatedAt(formattedJobDate);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchProposal();

    // eslint-disable-next-line
  }, [complaintId]);

  //   Fetch Unique Company Name
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

  // Handle Proposal
  const handleComplaint = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (complaintId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/complaints/update/complaint/${complaintId}`,
          {
            company,
            client,
            department,
            assign,
            errorType,
            solution,
            points,
            note,
            createdAt,
          }
        );

        if (data) {
          getComplaints();
          setShow(false);
          setLoading(false);
          toast.success("Complaint update successfully.");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/complaints/create/complaint`,
          {
            company,
            client,
            department,
            assign,
            errorType,
            solution,
            points,
            note,
          }
        );
        if (data) {
          getComplaints();
          setShow(false);
          setLoading(false);
          toast.success("New complaint added successfully.");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  //   Handle Select Company
  const coptions = jobData.map((item) => ({
    value: item.companyName,
    label: item.companyName,
  }));

  const selectedCompanyOption = coptions.find(
    (option) => option.value === company
  );

  const handleComplanyChange = (selectedOption) => {
    if (selectedOption) {
      setCompany(selectedOption.value);
    } else {
      setClient("");
    }
  };

  // Handle Select Client
  const clientoptions = jobData.map((item) => ({
    value: item.clientName,
    label: item.clientName,
  }));

  const selectedClientOption = clientoptions.find(
    (option) => option.value === client
  );

  const handleClientChange = (selectedOption) => {
    if (selectedOption) {
      setClient(selectedOption.value);
    } else {
      setClient("");
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

  return (
    <div className=" w-[21rem] sm:w-[42rem] max-h-[105vh] mt-[3rem]  rounded-lg shadow-md bg-white">
      <div className="flex items-center justify-between py-4 px-3 sm:px-4 border-b border-gray-300">
        <h1 className="text-2xl font-semibold">
          {complaintId ? "Update Complaint" : "Add Complaint"}
        </h1>
        <span
          onClick={() => {
            setShow(false);
            setComplaintId("");
          }}
        >
          <IoClose className="h-7 w-7 cursor-pointer" />
        </span>
      </div>
      <form
        onSubmit={handleComplaint}
        className="py-4 px-3 sm:px-4 mt-3 flex flex-col gap-4 w-full"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            className={`${style.input} h-[2.6rem] flex items-center justify-center px-0 py-0`}
            value={selectedCompanyOption || company}
            onChange={handleComplanyChange}
            options={coptions}
            placeholder="Select Company"
            styles={customStyles}
            isClearable
          />
          <Select
            className={`${style.input} h-[2.6rem] flex items-center justify-center px-0 py-0`}
            value={selectedClientOption || client}
            onChange={handleClientChange}
            options={clientoptions}
            placeholder="Select Client"
            styles={customStyles}
            isClearable
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="inputBox">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={`${style.input} w-full `}
            >
              <option value="">Select Department</option>
              {departments?.map((dep, i) => (
                <option key={i} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>
          <div className="inputBox">
            <select
              value={assign}
              onChange={(e) => setAssign(e.target.value)}
              className={`${style.input} w-full `}
            >
              <option value="">Select Assign</option>
              {users?.map((user, i) => (
                <option key={i} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="inputBox">
            <select
              value={errorType}
              onChange={(e) => setErrorType(e.target.value)}
              className={`${style.input} w-full `}
            >
              <option value="">Select Error Type</option>
              {errorData?.map((error, i) => (
                <option key={i} value={error._id}>
                  {error.name}
                </option>
              ))}
            </select>
          </div>
          <div className="inputBox">
            <select
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              className={`${style.input} w-full `}
            >
              <option value="">Select Solution</option>
              {solutionData?.map((sol, i) => (
                <option key={i} value={sol._id}>
                  {sol.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {complaintId ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="inputBox">
              <input
                type="date"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className={`${style.input} w-full `}
              />
              <span>Created Date</span>
            </div>
            <div className="inputBox">
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className={`${style.input} w-full `}
              />
              <span>Points</span>
            </div>
          </div>
        ) : (
          <div className="inputBox">
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className={`${style.input} w-full `}
            />
            <span>Points</span>
          </div>
        )}

        <div className="inputBox">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`${style.input} w-full`}
            style={{ height: "9rem" }}
            placeholder="Write complaint here..."
          />
          <span>Note</span>
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
              <span>{complaintId ? "Update" : "Create"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
