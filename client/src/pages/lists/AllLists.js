import React, { useEffect, useRef, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { IoClose, IoReload } from "react-icons/io5";
import Tasks from "../../components/MyLists/Tasks";
import Jobs from "../../components/MyLists/Jobs";
import Leads from "../../components/MyLists/Leads";
import Proposals from "../../components/MyLists/Proposals";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import Tickets from "../../components/MyLists/Tickets";
import Templates from "../../components/MyLists/Templates";
import Goals from "../../components/MyLists/Goals";
import Subscriptions from "../../components/MyLists/Subscriptions";
import Timesheet from "../../components/TimeSheet/Timesheet";
import Dashboard from "../../components/MyLists/LDashboard";
import HR from "../../components/MyLists/Hr";

export default function AllLists() {
  const { auth } = useAuth();
  const [selectedTab, setSelectedTab] = useState("Hr");
  const [tasksData, setTasksData] = useState([]);

  const [hrTasks, setHrTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [emailData, setEmailData] = useState([]);
  const [proposalData, setProposalData] = useState([]);
  const [templateData, setTemplateData] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [goalsData, setGoalsData] = useState([]);
  const tasksRef = useRef(null);
  const childRef = useRef(null);
  const [isload, setIsload] = useState(false);
  const [timerData, setTimerData] = useState([]);
  // DashboardClients
  // Client
  const [workFlowData, setWorkflowData] = useState([]);
  const [uniqueClients, setUniqueClients] = useState([]);

  const refreshHandler = () => {
    childRef.current.refreshData();
  };


    // --------------Get All Hr Tasks---------->
    const getAllHrTasks = async () => {
     
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/hr/all/tasks`
        );

        console.log("hr tasks",data);
        setHrTasks(data?.tasks);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
       
      }
    };
  
    useEffect(() => {
      getAllHrTasks();
      // eslint-disable-next-line
    }, []);




  // Get All Tasks
  const getAllTasks = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/all`
      );

      setTasksData(data?.tasks);

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTasks();
    // eslint-disable-next-line
  }, []);

  // ---------------All Client_Job Data----------->
  const allClientJobData = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/all/client/job`
      );
      if (data) {
        setTableData(data?.clients);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    allClientJobData();
    // eslint-disable-next-line
  }, []);

  // -------Get All Tickets-------
  const getAllEmails = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/tickets`
      );
      if (data) {
        setEmailData(data.emails);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllEmails();
  }, []);

  // -------Get All Proposal-------
  const getAllProposal = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/proposal/fetch/proposal`
      );
      if (data) {
        setProposalData(data.proposals);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllProposal();
  }, []);

  // Get ALl Templates
  // --------------Get All Templates---------->
  const getAllTemplates = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/templates/get/all/template`
      );

      setTemplateData(data?.templates);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllTemplates();
    // eslint-disable-next-line
  }, []);

  // -------Get Subscription Data-------
  const getAllSubscriptions = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/subscriptions/fetch/all`
      );
      if (data) {
        setSubscriptionData(data.subscriptions);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllSubscriptions();
  }, []);

  // -------Get All Proposal-------
  const getAllGoals = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/fetch/all/goals`
      );
      if (data) {
        setGoalsData(data.goals);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllGoals();
  }, []);

  // Get TimeSheet Data
  const getAllTimeSheetData = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/get/all/timers`
      );

      setTimerData(data.timers);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllTimeSheetData();
  }, []);

  // ---------------------------MyList Dashoard------------->
  // ---------------All Client_Job Data----------->
  const allDashboardClientData = async () => {
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
    }
  };

  useEffect(() => {
    allDashboardClientData();
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <div className=" relative w-full h-[100%] overflow-y-auto py-4 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              My List's
            </h1>

            <span
              className={`p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400 mb-1 hover:rotate-180 `}
              onClick={() => tasksRef.current.handleClearFilters()}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6 text-white" />
            </span>
          </div>

          {/* ---------Template Buttons--------- */}
        </div>
        {/*  */}
        <>
          <div className=" w-full flex items-center gap-4 overflow-x-auto hidden1">
            <div className="flex items-center  border-2  border-orange-500 overflow-x-auto hidden1 rounded-sm overflow-hidden mt-5 transition-all duration-300 w-fit">
              <button
                className={`py-[6px] px-2 outline-none min-w-[8rem] text-[13px] sm:text-[15px] w-[8.5rem] transition-all duration-300   ${
                  selectedTab === "Tasks"
                    ? "bg-orange-500 text-white border-r-2 border-orange-500 scale-105 shadow-md"
                    : "text-black bg-gray-100"
                }`}
                onClick={() => setSelectedTab("Tasks")}
              >
                Tasks
              </button>
              <button
                className={`py-[6px] px-2 outline-none min-w-[8rem] text-[13px] sm:text-[15px] transition-all border-l-2 border-orange-600 duration-300 w-[8.5rem]  ${
                  selectedTab === "Jobs"
                    ? "bg-orange-500 text-white scale-105 shadow-md"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setSelectedTab("Jobs");
                }}
              >
                Jobs
              </button>
              <button
                className={`py-[6px] px-2 outline-none min-w-[8rem] text-[13px] sm:text-[15px] transition-all border-l-2 border-orange-600 duration-300 w-[8.5rem]  ${
                  selectedTab === "Tickets"
                    ? "bg-orange-500 text-white scale-105 shadow-md"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setSelectedTab("Tickets");
                }}
              >
                Tickets
              </button>
              <button
                className={`py-[6px] px-2 outline-none min-w-[8rem] text-[13px] sm:text-[15px] transition-all border-l-2 border-orange-600 duration-300 w-[8.5rem]  ${
                  selectedTab === "Leads"
                    ? "bg-orange-500 text-white scale-105 shadow-md"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setSelectedTab("Leads");
                }}
              >
                Leads
              </button>
              <button
                className={`py-[6px] px-2 outline-none min-w-[8rem] text-[13px] sm:text-[15px] transition-all border-l-2 border-orange-600 duration-300 w-[8.5rem]  ${
                  selectedTab === "Proposals"
                    ? "bg-orange-500 text-white scale-105 shadow-md"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setSelectedTab("Proposals");
                }}
              >
                Proposals
              </button>
              <button
                className={`py-[6px] px-2 outline-none min-w-[8rem] text-[13px] sm:text-[15px] transition-all border-l-2 border-orange-600 duration-300 w-[8.5rem]  ${
                  selectedTab === "Templates"
                    ? "bg-orange-500 text-white scale-105 shadow-md"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setSelectedTab("Templates");
                }}
              >
                Templates
              </button>
              <button
                className={`py-[6px] px-2 min-w-[8rem] text-[13px] sm:text-[15px] outline-none transition-all border-l-2 border-orange-600 duration-300 w-[8.5rem]  ${
                  selectedTab === "Goals"
                    ? "bg-orange-500 text-white scale-105 shadow-md"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setSelectedTab("Goals");
                }}
              >
                Goals
              </button>
              <button
                className={`py-[6px] px-2 min-w-[8rem] text-[13px] sm:text-[15px] outline-none transition-all border-l-2 border-orange-600 duration-300 w-[8.5rem]  ${
                  selectedTab === "Subscription"
                    ? "bg-orange-500 text-white scale-105 shadow-md"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setSelectedTab("Subscription");
                }}
              >
                Subscription
              </button>
              <button
                className={`py-[6px] hidden sm:block px-2 min-w-[8rem] text-[13px] sm:text-[15px] outline-none transition-all border-l-2 border-orange-600 duration-300 w-[8.5rem]  ${
                  selectedTab === "TimeSheet"
                    ? "bg-orange-500 text-white scale-105 shadow-md"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setSelectedTab("TimeSheet");
                }}
              >
                TimeSheet
              </button>


              <button
                className={`py-[6px] hidden sm:block px-2 min-w-[8rem] text-[13px] sm:text-[15px] outline-none transition-all border-l-2 border-orange-600 duration-300 w-[8.5rem]  ${
                  selectedTab === "Hr"
                    ? "bg-orange-500 text-white scale-105 shadow-md"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setSelectedTab("Hr");
                }}
              >
                HR
              </button>



              <button
                className={`py-[6px] px-2 min-w-[8rem] text-[13px] sm:text-[15px] outline-none w-[8.5rem] border-l-2 border-orange-600  transition-all duration-300   ${
                  selectedTab === "Dashboard"
                    ? "bg-orange-500 text-white border-r-2 border-orange-500 scale-105 shadow-md"
                    : "text-black bg-gray-100"
                }`}
                onClick={() => setSelectedTab("Dashboard")}
              >
                Dashboard
              </button>
              {/* RiRefreshFill */}
            </div>
            <span
              onClick={refreshHandler}
              title="Refresh"
              className="p-1 mt-5 cursor-pointer rounded-full bg-gray-200/50 hover:bg-gray-300/50 hover:shadow-md"
            >
              <IoReload className="h-6 w-6 text-orange-500 hover:text-orange-600" />
            </span>
          </div>

          <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />
        </>
        {isload && (
          <div className="pb-5">
            <div class="loader"></div>
          </div>
        )}
        <div className=" mt-[1rem]">
          {selectedTab === "Tasks" ? (
            <Tasks
              tasksData={tasksData}
              loading={loading}
              setTasksData={setTasksData}
              ref={tasksRef}
              childRef={childRef}
              setIsload={setIsload}
            />
          ) : selectedTab === "Jobs" ? (
            <Jobs
              ref={tasksRef}
              tableData={tableData}
              setTableData={setTableData}
              childRef={childRef}
              setIsload={setIsload}
            />
          ) : selectedTab === "Tickets" ? (
            <Tickets
              ref={tasksRef}
              emailData={emailData}
              setEmailData={setEmailData}
              childRef={childRef}
              setIsload={setIsload}
            />
          ) : selectedTab === "Leads" ? (
            <Leads ref={tasksRef} childRef={childRef} setIsload={setIsload} />
          ) : selectedTab === "Proposals" ? (
            <Proposals
              ref={tasksRef}
              proposalData={proposalData}
              setProposalData={setProposalData}
              childRef={childRef}
              setIsload={setIsload}
            />
          ) : selectedTab === "Templates" ? (
            <Templates
              ref={tasksRef}
              templateData={templateData}
              setTemplateData={setTemplateData}
              childRef={childRef}
              setIsload={setIsload}
            />
          ) : selectedTab === "Goals" ? (
            <Goals
              ref={tasksRef}
              goalsData={goalsData}
              setGoalsData={setGoalsData}
              childRef={childRef}
              setIsload={setIsload}
            />
          ) : selectedTab === "Hr" ? (
            <HR
              ref={tasksRef}
              taskData={hrTasks}
              setTaskData={setHrTasks}
              childRef={childRef}
              setIsload={setIsload}
            />
          ) : selectedTab === "TimeSheet" ? (
            <Timesheet
              ref={tasksRef}
              timerData={timerData}
              setTimerData={setTimerData}
              childRef={childRef}
              setIsload={setIsload}
            />
          ) : selectedTab === "Dashboard" ? (
            <Dashboard
              workFlowData={workFlowData}
              uniqueClients={uniqueClients}
              // ref={tasksRef}
              // timerData={timerData}
              // setTimerData={setTimerData}
              // childRef={childRef}
              // setIsload={setIsload}
            />
          ) : (
            <Subscriptions
              ref={tasksRef}
              subscriptionData={subscriptionData}
              setSubscriptionData={setSubscriptionData}
              childRef={childRef}
              setIsload={setIsload}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
