import React, { useEffect, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import axios from "axios";
import { style } from "../../utlis/CommonStyle";

export default function Workflow() {
  const [loading, setLoading] = useState(false);
  const [workFlowData, setWorkflowData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Clients");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [summarizedData, setSummarizedData] = useState([]);
  const [leadWiseData, setLeadWiseData] = useState([]);
  const [departmentWiseData, setDepartmentWiseData] = useState([]);

  const departments = [
    "Bookkeeping",
    "Payroll",
    "Vat Return",
    "Personal Tax",
    "Accounts",
    "Company Sec",
    "Address",
  ];

  console.log("workFlowData:", workFlowData, users);
  console.log("summarizedData:", leadWiseData);
  console.log("departmentWiseData:", departmentWiseData);

  // ---------------All Client_Job Data----------->
  const allClientJobData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/workflow/clients`
      );
      if (data) {
        setWorkflowData(data?.clients);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allClientJobData();
    // eslint-disable-next-line
  }, []);

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );

      setUsers(
        data?.users
          ?.filter((user) =>
            user?.role?.access?.some((item) =>
              item?.permission?.includes("Jobs")
            )
          )
          .map((user) => user.name) || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();

    // eslint-disable-next-line
  }, []);

  // Get Summery
  useEffect(() => {
    // Lead-wise summary
    const leadSummary = workFlowData.reduce((acc, job) => {
      const lead = job.job.lead;

      // Initialize lead entry if not present
      if (!acc[lead]) {
        acc[lead] = { lead, totalFee: 0, totalHours: 0, jobs: [] };
      }

      // Add job details and accumulate fee and hours
      acc[lead].jobs.push(job.job.jobName);
      acc[lead].totalFee += parseFloat(job.fee) || 0;
      acc[lead].totalHours += parseFloat(job.totalHours) || 0;

      return acc;
    }, {});

    // Department-wise summary
    const departmentSummary = workFlowData.reduce((acc, job) => {
      const department = job.jobName;

      // Ensure department exists in the departments array
      if (departments.includes(department)) {
        // Initialize department entry if not present
        if (!acc[department]) {
          acc[department] = { department, totalFee: 0, totalHours: 0 };
        }

        // Accumulate fee and hours for the department
        acc[department].totalFee += parseFloat(job.fee) || 0;
        acc[department].totalHours += parseFloat(job.totalHours) || 0;
      }

      return acc;
    }, {});

    // Convert summaries to arrays for easier display
    setLeadWiseData(Object.values(leadSummary));
    setDepartmentWiseData(Object.values(departmentSummary));
  }, [workFlowData]);

  return (
    <Layout>
      <div className=" relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              Workflow
            </h1>

            <span
              className={`p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400 mb-1 hover:rotate-180 `}
              // onClick={() => {
              //   handleClearFilters();
              // }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6 text-white" />
            </span>
          </div>
        </div>
        {/* ---------Buttons--------- */}
        <>
          <div className="flex items-center gap-5">
            <div className="flex items-center border-2 border-orange-500 rounded-sm overflow-hidden mt-5 transition-all duration-300 w-fit">
              <button
                className={`py-[.35rem] px-2 w-[6.5rem] outline-none transition-all duration-300 ${
                  selectedTab === "Clients"
                    ? "bg-orange-500 text-white border-r-2 border-orange-500"
                    : "text-black bg-gray-100"
                }`}
                onClick={() => setSelectedTab("Clients")}
              >
                Clients
              </button>
              <button
                className={`py-[.35rem] px-2 w-[6.5rem] outline-none transition-all duration-300   ${
                  selectedTab === "Owners"
                    ? "bg-orange-500 text-white"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => setSelectedTab("Owners")}
              >
                Owners
              </button>
            </div>
            <div className="w-[9.5rem] mt-5">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className={`${style.input} w-full `}
                required
              >
                <option value="">Select Owner</option>
                {users?.map((user, i) => (
                  <option key={i} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />
        </>
        <div className="flex flex-col gap-4">
          <div>
            {/* Render lead-wise summarized data */}
            {/* <h2>Lead-wise Summary</h2>
            {leadWiseData.map((data, index) => (
              <div key={index}>
                <h3>Lead: {data.lead}</h3>
                <p>Total Fee: {data.totalFee}</p>
                <p>Total Hours: {data.totalHours}</p>
                <p>Jobs: {data.jobs.join(", ")}</p>
              </div>
            ))} */}

            {/* Render department-wise summarized data */}
            {/* <h2>Department-wise Summary</h2>
            {departmentWiseData.map((data, index) => (
              <div key={index}>
                <h3>Department: {data.department}</h3>
                <p>Total Fee: {data.totalFee}</p>
                <p>Total Hours: {data.totalHours}</p>
              </div>
            ))} */}
          </div>
        </div>
      </div>
    </Layout>
  );
}
