import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import Layout from "../../components/Loyout/Layout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Chart from "react-apexcharts";
import { style } from "../../utlis/CommonStyle";
import RunningGame from "../../utlis/RunningGame";
import MindGame from "../../utlis/MindGame";
import PuzzleGame from "../../components/games/PuzzleGame";

export default function UDashboard() {
  const { auth } = useAuth();
  const router = useNavigate();
  const [projects, setProjects] = useState(0);
  const [clients, setClients] = useState(0);
  const [tasksData, setTasksData] = useState([]);
  const [completedClients, setCompletedClient] = useState(0);

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
        (item) => item?.jobHolder === auth?.user?.name
      );

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
        (item) => item?.jobHolder === auth?.user?.name
      );

      // Map data to chart format
      const formattedData = filteredTasks.map((task) => ({
        x: new Date(task.createdAt).getTime(),
        y: task.value || Math.floor(Math.random() * 90) + 10,
      }));

      // Update tasks data and chart series
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
    if (!auth.user) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/dashboard/clients/completed`
      );
      if (data) {
        const filteredJobs = data?.clients.filter(
          (client) => client.job?.jobHolder === auth?.user?.name
        );

        setClients(filteredJobs.length || 0);
      }
    } catch (error) {
      console.log(error);
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
          (client) => client.job?.jobHolder === auth?.user?.name
        );

        console.log("filteredJobs/complete:", filteredJobs, data);
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

  return (
    <Layout>
      <div className="w-full flex flex-col gap-4 py-4 px-4">
        <h1 className="text-xl sm:text-3xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
          Welcome, {auth?.user?.name}!
        </h1>

        {/* Statistics Cards */}
        <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div
            onClick={() => router("/tasks")}
            className="flex cursor-pointer items-center justify-center flex-col gap-4 bg-gradient-to-tr from-orange-100 via-orange-200 to-orange-300 p-4 rounded shadow"
          >
            <h2 className="text-[18px] font-medium text-center">
              Total Assign Tasks
            </h2>
            <p className="text-2xl font-bold text-center">
              {projects ? projects : 0}
            </p>
          </div>
          <div
            onClick={() => router("/tasks")}
            className="flex cursor-pointer items-center justify-center flex-col gap-4 bg-gradient-to-tr from-pink-100 via-pink-200 to-pink-300 p-4 rounded shadow"
          >
            <h2 className="text-[18px] font-medium text-center">
              Total Completed Tasks
            </h2>
            <p className="text-2xl font-bold text-center">
              {tasksData ? tasksData?.length : 0}
            </p>
          </div>
          {/* Clients */}
          <div
            onClick={() => router("/job-planning")}
            className="flex cursor-pointer items-center justify-center flex-col gap-4 bg-gradient-to-tr from-green-100 via-green-200 to-green-300 p-4 rounded shadow"
          >
            <h2 className="text-[18px] font-medium text-center">
              Total Clients (Inprogress)
            </h2>
            <p className="text-2xl font-bold text-center">
              {clients ? clients : 0}
            </p>
          </div>
          <div
            onClick={() => router("/job-planning")}
            className="flex cursor-pointer items-center justify-center flex-col gap-4 bg-gradient-to-tr from-purple-100 via-purple-200 to-purple-300 p-4 rounded shadow"
          >
            <h2 className="text-[18px] font-medium text-center">
              Total Completed Clients
            </h2>
            <p className="text-2xl font-bold text-center">
              {completedClients ? completedClients : 0}
            </p>
          </div>
        </div>

        {/* Charts and Analytics */}
        {/* <div className="bg-white p-4 rounded shadow bg-gradient-to-tr from-gray-100 via-gray-200 to-gray-300">
          <h2 className="font-semibold mb-2">
            Monthly Progress (Completed Tasks Analytics)
          </h2>
        </div> */}
        {/* Recent Activity */}
        {/* <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Recent Activity</h2>
          <ul>
            <li>- Task "Client Onboarding" completed by John Doe</li>
          </ul>
        </div> */}

        {/* <-------------Animation Game(Lion & Man)------------> */}
        <div className="mt-4 w-full flex items-center justify-center gap-5">
          {/* <RunningGame /> */}
          {/* <MindGame />
          <PuzzleGame /> */}
        </div>
      </div>
    </Layout>
  );
}
