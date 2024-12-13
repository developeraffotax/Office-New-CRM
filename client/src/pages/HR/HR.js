import React, { useEffect, useRef, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import HandleHRModal from "../../components/hr/HandleHRModal";

export default function HR() {
  const { auth } = useAuth();
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const initialLoad = useRef(true);
  const [isloading, setIsLoading] = useState(false);

  // --------------Get All Tasks---------->
  const getAllTasks = async () => {
    if (initialLoad.current) {
      setIsLoading(true);
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/hr/all/tasks`
      );
      setTaskData(data?.tasks);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    } finally {
      if (initialLoad) {
        setIsLoading(false);
        initialLoad.current = false;
      }
    }
  };

  useEffect(() => {
    getAllTasks();
    // eslint-disable-next-line
  }, []);

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access.some((item) => item?.permission?.includes("HR"))
        ) || []
      );

      setUserName(
        data?.users
          ?.filter((user) =>
            user.role?.access.some((item) => item?.permission?.includes("HR"))
          )
          .map((user) => user.name)
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <div className=" relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              HR
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

          {/* ---------Template Buttons */}
          <div className="flex items-center gap-4">
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShowAddTask(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Add Task
            </button>
          </div>
        </div>
        <hr className="w-full h-[1px] bg-gray-300 my-5" />
        {/*  */}

        {/* -----------------Handle HR Tasks--------------- */}
        {showAddTask && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full py-4 px-4 bg-gray-300/70 flex items-center justify-center">
            <div className="w-[45rem]">
              <HandleHRModal
                setShowAddTask={setShowAddTask}
                users={users}
                taskId={taskId}
                setTaskId={setTaskId}
                getAllTasks={getAllTasks}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
