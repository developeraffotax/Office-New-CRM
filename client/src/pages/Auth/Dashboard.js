import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import Layout from "../../components/Loyout/Layout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../../utlis/Loader";
import {
  FiAward,
  FiCheckCircle,
  FiClipboard,
  FiTag,
  FiUsers,
} from "react-icons/fi";
// import Chart from "react-apexcharts";
// import { style } from "../../utlis/CommonStyle";
// import RunningGame from "../../utlis/RunningGame";
// import MindGame from "../../utlis/MindGame";
// import PuzzleGame from "../../components/games/PuzzleGame";

export default function UDashboard() {
  const { auth } = useAuth();
  const router = useNavigate();
  const [projects, setProjects] = useState(0);
  const [clients, setClients] = useState(0);
  const [tasksData, setTasksData] = useState([]);
  const [completedClients, setCompletedClient] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);
  const [loading, setLoading] = useState(false);

  console.log("completedTasks:", tasksData);

  //   Get ALl Projects(Progress)
  const getAllTasks = async () => {
    if (!auth.user) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/all`
      );

      const filteredTasks = data?.tasks?.filter(
        (item) => item?.jobHolder.trim() === auth?.user?.name.trim()
      );

      console.log("filteredTasks:", filteredTasks, data?.tasks);

      setProjects(filteredTasks.length || 0);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllTasks();
    // eslint-disable-next-line
  }, [auth]);

  // Function to fetch completed tasks
  const getCompletedTasks = async () => {
    if (!auth.user) return;

    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/completed`
      );

      const filteredTasks = data?.tasks?.filter(
        (item) => item?.jobHolder.trim() === auth?.user?.name
      );

      // Map data to chart format
      const formattedData = filteredTasks.map((task) => ({
        x: new Date(task.createdAt).getTime(),
        y: task.value || Math.floor(Math.random() * 90) + 10,
      }));

      setTasksData(formattedData);
      //   setChartSeries([{ data: formattedData }]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCompletedTasks();
    // eslint-disable-next-line
  }, [auth]);

  //   Get Job's Count (Progress)

  const allClientData = async () => {
    setLoading(true);
    if (!auth.user) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/dashboard/clients/completed`
      );
      if (data) {
        const filteredJobs = data?.clients.filter(
          (client) => client.job?.jobHolder.trim() === auth?.user?.name.trim()
        );

        setClients(filteredJobs.length || 0);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allClientData();
    // eslint-disable-next-line
  }, [auth]);

  //   Completed Jobs
  const allCompletedClientData = async () => {
    if (!auth.user) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/completed/clients`
      );
      if (data) {
        const filteredJobs = data?.clients.filter(
          (client) => client.job?.jobHolder.trim() === auth?.user?.name.trim()
        );
        setCompletedClient(filteredJobs.length || 0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    allCompletedClientData();
    // eslint-disable-next-line
  }, [auth]);

  // Get Ticket Count
  const fetchTicketData = async () => {
    if (!auth.user) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/dashboard/tickets`
      );
      if (data) {
        const filteredJobs = data?.emails?.filter(
          (email) => email.jobHolder.trim() === auth?.user?.name.trim()
        );

        setTicketCount(filteredJobs.length || 0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTicketData();
    // eslint-disable-next-line
  }, [auth]);

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4 py-4 px-4">
        <h1 className="text-xl sm:text-3xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
          Welcome, {auth?.user?.name}!
        </h1>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
            {/* Total Assign Tasks */}
            <div
              onClick={() => router("/tasks")}
              className="flex cursor-pointer items-center justify-center flex-col gap-4 bg-gradient-to-tr from-orange-100 via-orange-200 to-orange-300 p-6 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-orange-400 text-white rounded-full shadow-lg">
                <FiClipboard className="text-3xl" />
              </div>
              <h2 className="text-lg font-medium text-center text-gray-800">
                Total Assign Tasks
              </h2>
              <p className="text-3xl font-bold text-center text-gray-900">
                {projects ? projects : 0}
              </p>
            </div>

            {/* Total Completed Tasks */}
            <div
              onClick={() => router("/tasks")}
              className="flex cursor-pointer items-center justify-center flex-col gap-4 bg-gradient-to-tr from-pink-100 via-pink-200 to-pink-300 p-6 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-pink-400 text-white rounded-full shadow-lg">
                <FiCheckCircle className="text-3xl" />
              </div>
              <h2 className="text-lg font-medium text-center text-gray-800">
                Total Completed Tasks
              </h2>
              <p className="text-3xl font-bold text-center text-gray-900">
                {tasksData ? tasksData?.length : 0}
              </p>
            </div>

            {/* Assign Clients */}
            <div
              onClick={() => router("/job-planning")}
              className="flex cursor-pointer items-center justify-center flex-col gap-4 bg-gradient-to-tr from-green-100 via-green-200 to-green-300 p-6 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-green-400 text-white rounded-full shadow-lg">
                <FiUsers className="text-3xl" />
              </div>
              <h2 className="text-lg font-medium text-center text-gray-800">
                Assign Clients (Inprogress)
              </h2>
              <p className="text-3xl font-bold text-center text-gray-900">
                {clients ? clients : 0}
              </p>
            </div>

            {/* Total Completed Clients */}
            <div
              onClick={() => router("/job-planning")}
              className="flex cursor-pointer items-center justify-center flex-col gap-4 bg-gradient-to-tr from-purple-100 via-purple-200 to-purple-300 p-6 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-purple-400 text-white rounded-full shadow-lg">
                <FiAward className="text-3xl" />
              </div>
              <h2 className="text-lg font-medium text-center text-gray-800">
                Total Completed Clients
              </h2>
              <p className="text-3xl font-bold text-center text-gray-900">
                {completedClients ? completedClients : 0}
              </p>
            </div>

            {/* Assign Tickets */}
            <div
              onClick={() => router("/tickets")}
              className="flex cursor-pointer items-center justify-center flex-col gap-4 bg-gradient-to-tr from-lime-100 via-lime-200 to-lime-300 p-6 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-lime-400 text-white rounded-full shadow-lg">
                <FiTag className="text-3xl" />
              </div>
              <h2 className="text-lg font-medium text-center text-gray-800">
                Assign Tickets
              </h2>
              <p className="text-3xl font-bold text-center text-gray-900">
                {ticketCount ? ticketCount : 0}
              </p>
            </div>
          </div>
        )}

        {/* <-------------Game------------> */}
        <div className="mt-4 w-full flex items-center justify-center gap-5">
          {/* <RunningGame /> */}
          {/* <MindGame /> */}
          {/* <PuzzleGame /> */}
        </div>
      </div>
    </Layout>
  );
}
