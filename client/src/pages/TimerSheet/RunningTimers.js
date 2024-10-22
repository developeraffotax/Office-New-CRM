import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import Layout from "../../components/Loyout/Layout";

export default function RunningTimers({ setIsRunning, users }) {
  const [timerData, setTimerData] = useState([]);

  // Fetch Running Timer
  const getTimers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/running/timers`
      );
      if (data) {
        setTimerData(data.timers);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTimers();
  }, []);

  // Filter the user based on timer's clientId
  const filterUser = (userId) => {
    return users.find((user) => user._id === userId);
  };

  return (
    <Layout>
      <div className="w-full h-full bg-gray-100 mt-2 overflow-y-auto overflow-hidden scroll-smooth ">
        <div className="flex items-center justify-between py-4 px-4 ">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            All Running Timer{" "}
            <span className="text-[2rem] hourglass-animation">⏳</span>
          </h1>
          <span
            onClick={() => {
              setIsRunning(false);
            }}
          >
            <IoClose className="h-7 w-7 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors" />
          </span>
        </div>
        <hr className="mt-4 mb-6 border-gray-300" />
        <div className="py-4 px-3 w-full h-screen ">
          {timerData.length >= 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 gap-5 ">
              {timerData?.map((timer) => {
                const currentUser = filterUser(timer.clientId);
                const timeElapsed = new Date() - new Date(timer.startTime);

                return (
                  <div
                    className="w-full rounded-lg shadow-lg hover:shadow-xl cursor-pointer py-6 px-5 transition-transform transform hover:scale-105 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-300 flex flex-col items-center justify-center gap-4 relative"
                    key={timer._id}
                  >
                    {currentUser?.avatar ? (
                      <div className="relative w-[5rem] h-[5rem] rounded-full object-cover border-2 border-white shadow-md animate-borderPulse">
                        <img
                          src={currentUser?.avatar || "/profile1.jpeg"}
                          alt="avatar"
                          className="w-full h-full rounded-full"
                        />
                        <span className="w-[.8rem] h-[.8rem] rounded-full bg-green-500 absolute bottom-1 right-[6px] border-2 border-white z-10"></span>
                      </div>
                    ) : (
                      <div className="relative w-[5rem] h-[5rem] rounded-full object-cover border-2 border-white bg-green-800 text-white shadow-md animate-borderPulse flex items-center justify-center">
                        <span className="text-white font-medium text-3xl">
                          {currentUser?.name?.slice(0, 1)}
                        </span>
                        <span className="w-[.8rem] h-[.8rem] rounded-full bg-green-500 absolute bottom-1 right-[6px] border-2 border-white z-10"></span>
                      </div>
                    )}

                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white drop-shadow-md shadow-gray-500">
                        {currentUser?.name || "Unknown User"}
                      </h3>
                      <p className="text-sm text-white opacity-90 drop-shadow-md shadow-gray-500">
                        {timer?.task ||
                          timer?.companyName ||
                          "No task assigned"}
                      </p>
                    </div>

                    <div className="w-full flex items-center justify-between text-white ">
                      <div className="flex items-center gap-1">
                        <span className="text-green-600 font-medium text-sm animate-pulse drop-shadow-md shadow-gray-500">
                          Running
                        </span>
                        <span className="text-[1rem] hourglass-animation">
                          ⏳
                        </span>
                      </div>

                      <span className="text-white font-semibold drop-shadow-md shadow-gray-500">
                        {Math.floor(timeElapsed / 3600000) >= 1 && (
                          <>{Math.floor(timeElapsed / 3600000)}h : </>
                        )}
                        {Math.floor((timeElapsed % 3600000) / 60000)}m
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 px-3 py-1 rounded-[1.5rem] shadow-md bg-gray-100 flex items-center gap-1 text-gray-800 text-sm font-semibold">
                      {/* <span className="text-[1rem] hourglass-animation">⏳</span> */}
                      {new Date(timer.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full min-h-[80vh] flex items-center justify-center flex-col ">
              <div className="relative">
                <img
                  src="/timerImg.png"
                  alt="timer"
                  className="w-[10rem] h-[10rem] sm:w-[15rem] sm:h-[15rem] animate-bounce-slow "
                />
              </div>
              <span className="mt-4 text-lg w-full sm:max-w-[35%] sm:text-xl text-black text-center animate-fade-in">
                Oops! No timer is running right now. Start one to stay on track!
              </span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
