import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import Layout from "../../components/Loyout/Layout";
import { BsStopCircleFill } from "react-icons/bs";
import toast from "react-hot-toast";
import { style } from "../../utlis/CommonStyle";
import { ImSpinner6 } from "react-icons/im";
import { useDispatch, useSelector } from "react-redux";
import { setSearchValue } from "../../redux/slices/authSlice";

export default function RunningTimers({ setIsRunning, users }) {
  
    const dispatch = useDispatch();
     const auth = useSelector((state => state.auth.auth));
     const searchValue = useSelector((state => state.auth.searchValue));
 

  const [timerData, setTimerData] = useState([]);
  const [filterUserData, setFilterUserData] = useState([]);
  const [note, setNote] = useState("");
  const [activity, setActivity] = useState("Chargeable");
  const [isShow, setIsShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timerId, setTimerId] = useState("");

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

  // Handle Stop Timer
  const stopTimer = async () => {
    if (!timerId) {
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/stop/timer/${timerId}`,
        { note, activity }
      );
      removeTimerStatus(data.timer.clientId);
      if (data) {
        getTimers();
        setIsShow(false);
        setLoading(false);
        toast.success("Timer Stoped!");
        setTimerId("");
        setNote("");
        setActivity("Chargeable");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // --------Remove Timer Status-------
  const removeTimerStatus = async (userId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/remove/timer_task/Status/${userId}`
      );
    } catch (error) {
      console.log(error);
    }
  };
  // Filter the user based on timer's clientId
  const filterUser = (userId) => {
    return users.find((user) => user._id === userId);
  };

  useEffect(() => {
    const filteredData = timerData.filter((item) =>
      item.jobHolderName.toLowerCase().includes(searchValue.toLowerCase())
    );

    setFilterUserData(filteredData);
  }, [searchValue, timerData]);

  return (
    <Layout>
      <div className="relative w-full min-h-[100vh] bg-gray-100 mt-2 overflow-y-auto overflow-hidden scroll-smooth  ">
        <div className="flex items-center justify-between py-4 px-4 ">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              All Running Timer{" "}
              <span className="text-[2rem] hourglass-animation">⏳</span>
            </h1>
            <span
              className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
              onClick={() => {
                dispatch(setSearchValue(""));
              }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6  cursor-pointer" />
            </span>
          </div>

          <span
            onClick={() => {
              setIsRunning(false);
            }}
          >
            <IoClose className="h-7 w-7 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors" />
          </span>
        </div>
        <hr className="mt-4 mb-6 border-gray-300" />
        <div className="py-4 px-3 w-full">
          {(searchValue ? filterUserData.length > 0 : timerData.length > 0) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 gap-5 ">
              {(filterUserData || searchValue
                ? filterUserData
                : timerData
              )?.map((timer) => {
                const currentUser = filterUser(timer.clientId);
                const timeElapsed = new Date() - new Date(timer.startTime);

                return (
                  <div
                    className="w-full rounded-lg shadow-lg hover:shadow-xl cursor-pointer py-6 px-5 transition-transform transform hover:scale-[1.05] bg-gradient-to-r from-orange-600 via-orange-400 to-orange-300 flex flex-col items-center justify-center gap-4 relative"
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

                      <span
                        className="bg-white rounded-full p-2 hover:shadow-md"
                        title="Stop Timer"
                        onClick={() => {
                          setTimerId(timer._id);
                          setIsShow(true);
                        }}
                      >
                        <BsStopCircleFill className="h-6 w-6 text-red-500 hover:text-red-600" />
                      </span>

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

        {/* -------------Stop Timer Btn-----------*/}
        {isShow && timerId && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/80 flex items-center justify-center">
            <div className="w-[32rem] rounded-md bg-white shadow-md">
              <div className="flex  flex-col gap-3 ">
                <div className=" w-full flex items-center justify-between py-2 mt-1 px-4">
                  <h3 className="text-[19px] font-semibold text-gray-800">
                    Enter End Note
                  </h3>
                  <span
                    onClick={() => {
                      setIsShow(false);
                    }}
                  >
                    <IoClose className="text-black cursor-pointer h-6 w-6 " />
                  </span>
                </div>
                <hr className="w-full h-[1px] bg-gray-500 " />
                <div className="flex items-start px-4 py-2 ">
                  {activity === "Chargeable" ? (
                    <button
                      className={`px-4 h-[2.6rem] min-w-[5rem] flex items-center justify-center  rounded-md cursor-pointer shadow-md  text-white border-none outline-none bg-green-500 hover:bg-green-600`}
                      onClick={() => setActivity("Non-Chargeable")}
                      style={{ width: "8rem", fontSize: "14px" }}
                    >
                      Chargeable
                    </button>
                  ) : (
                    <button
                      className={`px-4 h-[2.6rem] min-w-[5rem] flex items-center justify-center  rounded-md cursor-pointer shadow-md  text-white border-none outline-none bg-red-500 hover:bg-red-600`}
                      onClick={() => setActivity("Chargeable")}
                      style={{ width: "9rem", fontSize: "14px" }}
                    >
                      Non-Chargeable
                    </button>
                  )}
                </div>
                <div className=" w-full px-4 py-2 flex-col gap-4">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add note here..."
                    className="w-full h-[6rem] rounded-md resize-none py-1 px-2 shadow border-2 border-gray-700"
                  />
                  <div className="flex items-center justify-end mt-4">
                    <button
                      disabled={loading}
                      className={`${style.btn}`}
                      onClick={stopTimer}
                    >
                      {loading ? <ImSpinner6 /> : "Submit"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
