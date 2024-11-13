import React, { useEffect, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import Clients from "../../components/Dashboard/Clients";
import Tasks from "../../components/Dashboard/Tasks";
import { style } from "../../utlis/CommonStyle";
import { IoClose } from "react-icons/io5";
import Sales from "../../components/Dashboard/Sales";
import axios from "axios";

export default function Dashboard() {
  // Client
  const [workFlowData, setWorkflowData] = useState([]);
  const [uniqueClients, setUniqueClients] = useState([]);
  const [loading, setLoading] = useState(false);
  //
  const [selectedTab, setSelectedTab] = useState("Clients");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedPartner, setSelectedPartner] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const departments = [
    "Bookkeeping",
    "Payroll",
    "Vat Return",
    "Personal Tax",
    "Accounts",
    "Company Sec",
    "Address",
  ];
  const sources = ["FIV", "UPW", "PPH", "Website", "Referal", "Partner"];
  const clients = ["Limited", "LLP", "Individual", "Non UK"];
  const partners = ["Affotax", "Outsource", "OTL"];
  // Sales
  const [salesData, setSalesData] = useState([]);
  // console.log("salesData:", salesData);

  // ---------------All Client_Job Data----------->
  const allClientJobData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/workflow/clients`
      );
      if (data) {
        setWorkflowData(data?.clients);
        setUniqueClients(data.uniqueClients);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allClientJobData();
    // eslint-disable-next-line
  }, []);

  // ---------------All Leads Data----------->
  const allLeadData = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/dashboard/lead`
      );
      if (data) {
        setSalesData(data.salesData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    allLeadData();
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <div className="relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4  bg-gray-100">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              Dashboard
            </h1>
            <span
              className={`p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400 mb-1 hover:rotate-180 `}
              onClick={() => {
                setSelectedClient("");
                setSelectedDepartment("");
                setSelectedMonth("");
                setSelectedPartner("");
                setSelectedSource("");
                setSelectedYear("");
              }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6 text-white" />
            </span>
          </div>
          {/* ----------Tabs--------- */}
          <div className="flex items-center flex-wrap  gap-5">
            <div className="flex items-center mt-3 sm:mt-0 ml-5 sm:ml-[5rem]  border-2 border-orange-500 rounded-sm overflow-hidden  transition-all duration-300 w-fit">
              <button
                className={`py-[.4rem] px-2 outline-none w-[8rem] transition-all duration-300   ${
                  selectedTab === "Clients"
                    ? "bg-orange-500 text-white border-r-2 border-orange-500"
                    : "text-black bg-gray-100 "
                }`}
                onClick={() => setSelectedTab("Clients")}
              >
                Clients
              </button>
              <button
                className={`py-[.4rem] px-2 outline-none w-[8rem] border-l-2 border-orange-600 transition-all duration-300   ${
                  selectedTab === "Sales"
                    ? "bg-orange-500 text-white border-r-2 border-orange-500"
                    : "text-black bg-gray-100"
                }`}
                onClick={() => setSelectedTab("Sales")}
              >
                Sales
              </button>
              <button
                className={`py-[.4rem] px-2 outline-none w-[8rem] border-l-2 border-orange-600 transition-all duration-300   ${
                  selectedTab === "hr"
                    ? "bg-orange-500 text-white border-r-2 border-orange-500"
                    : "text-black bg-gray-100"
                }`}
                onClick={() => setSelectedTab("hr")}
              >
                HR
              </button>
            </div>

            {/* --------------Date Filters------------- */}
            {selectedTab === "Clients" && (
              <div className="flex gap-4 my-4 ml-5">
                {/* Department */}
                <select
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  value={selectedDepartment}
                  className={`${style.input} shadow-md drop-shadow-md`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
                <select
                  onChange={(e) => setSelectedYear(e.target.value)}
                  value={selectedYear}
                  className={`${style.input} shadow-md drop-shadow-md`}
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>

                <select
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  value={selectedMonth}
                  className={`${style.input} shadow-md drop-shadow-md`}
                >
                  <option value="">Select Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
                {/* Source */}
                <select
                  onChange={(e) => setSelectedSource(e.target.value)}
                  value={selectedSource}
                  className={`${style.input} shadow-md drop-shadow-md`}
                >
                  <option value="">Select Source</option>
                  {sources.map((sou) => (
                    <option key={sou} value={sou}>
                      {sou}
                    </option>
                  ))}
                </select>
                <select
                  onChange={(e) => setSelectedClient(e.target.value)}
                  value={selectedClient}
                  className={`${style.input} shadow-md drop-shadow-md`}
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client} value={client}>
                      {client}
                    </option>
                  ))}
                </select>
                <select
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  value={selectedPartner}
                  className={`${style.input} shadow-md drop-shadow-md`}
                >
                  <option value="">Select Partner</option>
                  {partners.map((part) => (
                    <option key={part} value={part}>
                      {part}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* Sales */}
            {selectedTab === "Sales" && (
              <div className="flex gap-4 my-4 ml-5">
                <select
                  onChange={(e) => setSelectedYear(e.target.value)}
                  value={selectedYear}
                  className={`${style.input} shadow-md drop-shadow-md`}
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>

                <select
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  value={selectedMonth}
                  className={`${style.input} shadow-md drop-shadow-md`}
                >
                  <option value="">Select Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/*  */}
          <hr className="mb-1 bg-gray-200 w-full h-[1px]" />
          {/* -------------Detail------- */}

          {selectedTab === "Clients" ? (
            <div className="w-full h-full">
              <Clients
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                selectedSource={selectedSource}
                selectedClient={selectedClient}
                selectedPartner={selectedPartner}
                selectedDepartment={selectedDepartment}
                workFlowData={workFlowData}
                uniqueClients={uniqueClients}
                loading={loading}
              />
            </div>
          ) : selectedTab === "Sales" ? (
            <div className="w-full h-full">
              <Sales
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                salesData={salesData}
                uniqueClients={uniqueClients.length}
              />
            </div>
          ) : selectedTab === "Tasks" ? (
            <div className="w-full h-full">
              <Tasks
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            </div>
          ) : (
            <div className="w-full h-full">
              <Clients />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
