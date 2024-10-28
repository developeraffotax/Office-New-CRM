import React, { useEffect, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import Tasks from "../../components/MyLists/Tasks";
import Jobs from "../../components/MyLists/Jobs";
import Leads from "../../components/MyLists/Leads";
import Proposals from "../../components/MyLists/Proposals";
import axios from "axios";
import { useAuth } from "../../context/authContext";

export default function AllLists() {
  const { auth } = useAuth();
  const [selectedTab, setSelectedTab] = useState("Tasks");
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [projects, setProjects] = useState([]);

  //---------- Get All Projects-----------
  const getAllProjects = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/projects/get_all/project`
      );
      setProjects(data?.projects);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllProjects();
    // eslint-disable-next-line
  }, [auth]);

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

  return (
    <Layout>
      <div className=" relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className=" text-xl sm:text-2xl font-semibold ">My Lists</h1>

            <span
              className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
              // onClick={() => {
              //   handleClearFilters();
              // }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6  cursor-pointer" />
            </span>
          </div>

          {/* ---------Template Buttons--------- */}
          <div className="flex items-center gap-4"></div>
        </div>
        {/*  */}
        <>
          <div className="flex items-center  border-2 border-orange-500 rounded-sm overflow-hidden mt-2 transition-all duration-300 w-fit">
            <button
              className={`py-1 px-2 outline-none w-[6rem] transition-all duration-300   ${
                selectedTab === "Tasks"
                  ? "bg-orange-500 text-white border-r-2 border-orange-500"
                  : "text-black bg-gray-100"
              }`}
              onClick={() => setSelectedTab("Tasks")}
            >
              Tasks
            </button>
            <button
              className={`py-1 px-2 outline-none transition-all border-l-2 border-orange-600 duration-300 w-[6rem]  ${
                selectedTab === "Jobs"
                  ? "bg-orange-500 text-white"
                  : "text-black bg-gray-100 hover:bg-slate-200"
              }`}
              onClick={() => {
                setSelectedTab("Jobs");
              }}
            >
              Jobs
            </button>
            <button
              className={`py-1 px-2 outline-none transition-all border-l-2 border-orange-600 duration-300 w-[6rem]  ${
                selectedTab === "Leads"
                  ? "bg-orange-500 text-white"
                  : "text-black bg-gray-100 hover:bg-slate-200"
              }`}
              onClick={() => {
                setSelectedTab("Leads");
              }}
            >
              Leads
            </button>
            <button
              className={`py-1 px-2 outline-none transition-all border-l-2 border-orange-600 duration-300 w-[6rem]  ${
                selectedTab === "Proposals"
                  ? "bg-orange-500 text-white"
                  : "text-black bg-gray-100 hover:bg-slate-200"
              }`}
              onClick={() => {
                setSelectedTab("Proposals");
              }}
            >
              Proposals
            </button>
            <button
              className={`py-1 px-2 outline-none transition-all border-l-2 border-orange-600 duration-300 w-[6rem]  ${
                selectedTab === "Templates"
                  ? "bg-orange-500 text-white"
                  : "text-black bg-gray-100 hover:bg-slate-200"
              }`}
              onClick={() => {
                setSelectedTab("Templates");
              }}
            >
              Templates
            </button>
          </div>
          <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />
        </>
        <div className="">
          {selectedTab === "Tasks" ? (
            <Tasks />
          ) : selectedTab === "Jobs" ? (
            <Jobs />
          ) : selectedTab === "Leads" ? (
            <Leads />
          ) : selectedTab === "Proposals" ? (
            <Proposals />
          ) : (
            "Templates"
          )}
        </div>
      </div>
    </Layout>
  );
}
