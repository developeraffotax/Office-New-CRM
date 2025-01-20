import React, { useState, useEffect } from "react";
import { style } from "../../utlis/CommonStyle";
import axios from "axios";
import Loader from "../../utlis/Loader";

export default function ActivityLogs({
  userData,
  selectedUser,
  setSelectedUser,
}) {
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };
  const [activityData, setActivityData] = useState([]);
  const [date, setDate] = useState(formatDate(new Date()));
  const [active, setActive] = useState("today");
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [userwiseActivies, setUserwiseActivies] = useState([]);
  const [userwiseActiviesCount, setUserwiseActiviesCount] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log("userwiseActiviesCount:", userwiseActiviesCount);
  console.log("filteredActivities:", filteredActivities);
  console.log("userData:", userData);

  const today = formatDate(new Date());
  const yesterday = formatDate(
    new Date(new Date().setDate(new Date().getDate() - 1))
  );

  // Get All ActiviessetActivityData
  const getAllActivies = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/activies/all/activies/${date}`
      );
      if (data) {
        setActivityData(data?.activities);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllActivies();
    // eslint-disable-next-line
  }, [date]);

  // Collect User-wise Activities
  useEffect(() => {
    if (!userData || !activityData) return;

    const userActivitiesMap = {};

    activityData.forEach((activity) => {
      const userName = activity?.user?.name?.trim();

      if (userName) {
        if (!userActivitiesMap[userName]) {
          userActivitiesMap[userName] = [];
        }

        userActivitiesMap[userName].push({
          ...activity,
          user: activity.user,
        });
      }
    });

    setUserwiseActivies(userActivitiesMap);

    const userActivitiesCount = Object.keys(userActivitiesMap).map((user) => ({
      user: userActivitiesMap[user][0]?.user,
      activity: userActivitiesMap[user],
    }));

    setUserwiseActiviesCount(userActivitiesCount);
  }, [userData, activityData]);

  // Filter by selected user
  useEffect(() => {
    if (!userwiseActiviesCount) return;

    let filtered = userwiseActiviesCount;

    if (selectedUser) {
      filtered = filtered.filter((activity) => {
        const userName = activity?.user.name || "";
        return (
          userName?.trim().toLowerCase() === selectedUser.trim().toLowerCase()
        );
      });
    }

    setFilteredActivities(filtered);
  }, [userwiseActiviesCount, selectedUser]);

  return (
    <div className="w-full h-full p-2 sm:p-6 flex items-center justify-center ">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg border overflow-hidden">
        {/* Header Section */}
        <div className="p-4 bg-green-600 flex items-center gap-4">
          <div className="pr-4 border-r-2 border-green-300">
            <span className="text-lg  sm:text-2xl font-bold text-white">
              Filters
            </span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto hidden1">
            {/* Date Filters */}
            {[
              { label: "Today", value: today },
              { label: "Yesterday", value: yesterday },
            ].map((filter) => (
              <button
                key={filter.label}
                onClick={() => {
                  setDate(filter.value);
                  setActive(filter.label.toLowerCase());
                }}
                className={`px-4 sm:px-6 py-1 sm:py-2 rounded-full text-[13px]  sm:text-[15px] font-semibold transition-transform duration-300 ${
                  active === filter.label.toLowerCase()
                    ? "bg-white text-green-600 shadow-lg scale-105"
                    : "text-white border border-white hover:bg-gray-50 hover:text-green-600"
                }`}
              >
                {filter.label}
              </button>
            ))}

            {/* Custom Date Picker */}
            <button
              onClick={() => setActive("custom")}
              className={`px-4 sm:px-6 py-1 sm:py-2 text-[13px]  sm:text-[15px]  rounded-full font-semibold transition-transform duration-300 ${
                active === "custom"
                  ? "bg-white text-green-600 shadow-lg scale-105"
                  : "text-white border border-white hover:bg-gray-50 hover:text-green-600"
              }`}
            >
              Custom
            </button>
            {active === "custom" && (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="ml-3 px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            )}
            <select
              onChange={(e) => setSelectedUser(e.target.value)}
              value={selectedUser}
              className={`${style.input} shadow-md drop-shadow-md`}
              style={{ border: "2px #fff" }}
            >
              <option value="">Select User</option>
              {userData.map((user) => (
                <option key={user._id} value={user?.name}>
                  {user?.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activities Section */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Activities for {date || today}
          </h2>
          {loading ? (
            <Loader />
          ) : (
            <div className="relative mt-6">
              {filteredActivities.length > 0 ? (
                <div className="space-y-8 relative">
                  {filteredActivities.map((userActivity, index) => (
                    <div
                      key={index}
                      className={`relative p-4 bg-gradient-to-r from-slate-300 to-slate-500 shadow-lg rounded-xl flex flex-col gap-4 ${
                        index !== filteredActivities.length - 1 ? "pb-16" : ""
                      }`}
                    >
                      {/* Connecting Line */}
                      {index !== filteredActivities.length - 1 && (
                        <div className="absolute left-6 top-full h-16 w-[2px] border-dotted border-l-2 border-green-500"></div>
                      )}

                      {/* User Info */}
                      <div className="flex items-center gap-4 w-full p-4 bg-gradient-to-r from-green-50 to-green-200 rounded-lg shadow-md">
                        <div className="flex-shrink-0">
                          {userActivity?.user.avatar ? (
                            <img
                              src={userActivity?.user.avatar}
                              alt="Avatar"
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-full text-white font-semibold flex items-center justify-center"
                              style={{
                                backgroundColor: `#${Math.floor(
                                  Math.random() * 16777215
                                ).toString(16)}`,
                              }}
                            >
                              {userActivity?.user.name.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-green-800">
                            {userActivity?.user.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {userActivity?.user?.role.name || "User Role"}
                          </p>
                        </div>
                      </div>

                      {/* User's Activity */}
                      <div className="relative ml-0 sm:ml-6">
                        {userActivity?.activity?.map(
                          (activity, activityIndex) => (
                            <div
                              key={activityIndex}
                              className={`relative py-2 px-4 mt-3 overflow-hidden bg-white rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                                activityIndex !==
                                userActivity.activity.length - 1
                                  ? "pb-12"
                                  : ""
                              }`}
                            >
                              {/* Connecting Line */}
                              {activityIndex !==
                                userActivity.activity.length - 1 && (
                                <div className="absolute left-[1.2rem] top-full h-10 w-[2px] border-dotted border-l-2 border-orange-500"></div>
                              )}

                              <p className="mb-2 text-[15px] font-medium text-green-500 mt-2 flex items-center gap-2">
                                <span className="w-[.8rem] h-[.8rem] rounded-full bg-green-500"></span>
                                {new Date(activity.createdAt).toLocaleString()}
                              </p>
                              <p className="text-[15px] text-gray-700">
                                <strong className="text-gray-900 text-lg text-[17px]">
                                  Action:
                                </strong>{" "}
                                {activity?.action}
                              </p>
                              <pre className="text-[15px] text-gray-700 mt-2 ">
                                <strong className="text-gray-900 text-lg text-[14px] sm:text-[17px] ">
                                  Details:
                                </strong>{" "}
                                {activity?.details}
                              </pre>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center w-full min-h-[50vh]">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <img
                      src="/rb_25051.png"
                      alt="notfound"
                      className="h-[14rem] w-[14rem] animate-pulse"
                    />
                    <p className="text-[14px] text-gray-800 font-medium text-center">
                      No activities to display for the selected date or user!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
