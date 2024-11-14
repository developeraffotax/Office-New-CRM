import React, { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { IoIosArrowDropdown } from "react-icons/io";
import { IoIosArrowDropup } from "react-icons/io";

export default function HR({
  selectedMonth,
  selectedYear,
  userData,
  holidaysData,
  complaintData,
  selectedUser,
  clientData,
}) {
  const [users, setUsers] = useState([]);
  const [userHolidayCount, setUserHolidayCount] = useState([]);
  const [userComplainCounts, setUserComplainCount] = useState([]);
  const [userClientCounts, setUserClientCount] = useState([]);
  const [holidayDropDown, setHolidayDropDown] = useState(false);
  const [complaintDropDown, setComplaintDropDown] = useState(false);
  const [clientDropDown, setClientDropDown] = useState(false);

  // console.log("userData:", users);
  console.log("userClientCounts:", userClientCounts);
  console.log("clientData:", clientData);

  useEffect(() => {
    const users = userData.map((user) => user.name);
    setUsers(users);
  }, [userData]);

  // Get ALL Holidays
  useEffect(() => {
    const filteredHolidays = holidaysData?.filter((holiday) => {
      const holidayDate = new Date(holiday.createdAt);
      const matchesMonth = selectedMonth
        ? holidayDate.getMonth() + 1 === parseInt(selectedMonth)
        : true;
      const matchesYear = selectedYear
        ? holidayDate.getFullYear() === parseInt(selectedYear)
        : true;
      const matchesUser = selectedUser
        ? holiday.jobHolderName === selectedUser
        : true;
      return matchesMonth && matchesYear && matchesUser;
    });

    console.log("filteredHolidays:", filteredHolidays);

    // Count holidays for each user
    const holidayCount = users?.reduce((acc, user) => {
      const count = filteredHolidays?.filter(
        (holiday) => holiday.jobHolderName === user
      ).length;
      acc[user] = count;
      return acc;
    }, {});

    // Format holiday count for display
    const formattedSourceCount = Object.entries(holidayCount)
      .filter(([_, count]) => count > 0)
      .map(([user, count]) => ({
        user,
        count,
      }));

    setUserHolidayCount(formattedSourceCount);
  }, [users, holidaysData, selectedMonth, selectedYear, selectedUser]);

  // Get All Complains
  useEffect(() => {
    const filteredComplaint = complaintData?.filter((complain) => {
      const complainDate = new Date(complain.createdAt);
      const matchesMonth = selectedMonth
        ? complainDate.getMonth() + 1 === parseInt(selectedMonth)
        : true;
      const matchesYear = selectedYear
        ? complainDate.getFullYear() === parseInt(selectedYear)
        : true;
      const matchesUser = selectedUser
        ? complain?.assign?.name === selectedUser
        : true;
      return matchesMonth && matchesYear && matchesUser;
    });

    // Count Complaint for each user
    const complainCount = users?.reduce((acc, user) => {
      const count = filteredComplaint?.filter(
        (holiday) => holiday?.assign?.name === user
      ).length;
      acc[user] = count;
      return acc;
    }, {});

    // Format Complaint count for display
    const formattedSourceCount = Object.entries(complainCount)
      .filter(([_, count]) => count > 0)
      .map(([user, count]) => ({
        user,
        count,
      }));

    setUserComplainCount(formattedSourceCount);
  }, [users, holidaysData, selectedMonth, selectedYear, selectedUser]);

  // Get ALl CLients
  useEffect(() => {
    const filteredClients = clientData?.filter((client) => {
      const clientDate = new Date(client.createdAt);
      const matchesMonth = selectedMonth
        ? clientDate.getMonth() + 1 === parseInt(selectedMonth)
        : true;
      const matchesYear = selectedYear
        ? clientDate.getFullYear() === parseInt(selectedYear)
        : true;
      const matchesUser = selectedUser
        ? client?.job?.lead === selectedUser
        : true;
      return matchesMonth && matchesYear && matchesUser;
    });

    // Count holidays for each user
    const clientsCount = users?.reduce((acc, user) => {
      const count = filteredClients?.filter(
        (client) => client?.job?.lead === user
      ).length;
      acc[user] = count;
      return acc;
    }, {});

    // Format holiday count for display
    const formattedSourceCount = Object.entries(clientsCount)
      .filter(([_, count]) => count > 0)
      .map(([user, count]) => ({
        user,
        count,
      }));

    setUserClientCount(formattedSourceCount);
  }, [users, clientData, selectedMonth, selectedYear, selectedUser]);

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4">
          {/* Total Leads (Lead - Proposal Lead) */}
          <div className="flex flex-col items-center min-h-[16.5rem] justify-center gap-4 w-full p-6 rounded-2xl bg-gradient-to-br from-pink-200 via-pink-300 to-pink-400 shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 h-fit">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 text-pink-700 shadow-lg">
              <FaUsers size={40} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center">
              Total Users
            </h3>
            <h1 className="text-5xl font-bold text-gray-900 text-center tracking-wide">
              {userData.length}
            </h1>
          </div>
          {/* ------ */}

          {/* Complain Count */}
          <div className="w-full flex flex-col items-center p-4 h-fit  rounded-xl bg-gradient-to-br from-red-200 via-red-300 to-red-400 shadow-xl hover:shadow-2xl  ">
            <div className="flex flex-col gap-3 w-full">
              {/* Header */}
              <div className="w-full flex items-center justify-between gap-2 p-3 rounded-md border border-red-300 shadow-lg bg-white">
                <h3 className="font-semibold text-2xl  text-red-700">
                  Employee's
                </h3>
                <h3 className="font-semibold text-2xl text-red-700">
                  Complaint's
                </h3>
              </div>

              {/* User Holiday Counts */}
              <div className="flex flex-col gap-3">
                {userComplainCounts.length > 0 ? (
                  <>
                    {(!complaintDropDown
                      ? userComplainCounts?.slice(0, 3)
                      : userComplainCounts
                    )?.map((complain) => (
                      <>
                        <div
                          key={complain.user}
                          className="w-full flex items-center justify-between gap-3 px-2 py-1 hover:py-2 rounded-md border border-red-200 shadow-md bg-white/70 hover:bg-white transition-all transform duration-300 ease-in-out hover:scale-105 cursor-pointer"
                        >
                          <h3 className="font-medium text-lg capitalize text-gray-700 w-full">
                            {complain.user}
                          </h3>
                          <div className="w-full flex items-center justify-end pr-2">
                            <div className="bg-gradient-to-br  from-red-200 to-red-400 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-xl font-semibold text-red-900">
                                {complain.count}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center p-6 rounded-lg bg-white shadow-md border border-gray-200">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-16 h-16 bg-red-100 text-red-500 rounded-full mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        width="36"
                        height="36"
                      >
                        {/* Warning icon for complaints */}
                        <path d="M1 21h22L12 2 1 21zM12 16h-2v2h2v-2zm0-6h-2v4h2v-4z" />
                      </svg>
                    </div>

                    {/* Message */}
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Complaint Found!
                    </h3>
                    <p className="text-gray-500 text-center w-full">
                      Currently, there are no{" "}
                      {selectedUser ? `${selectedUser}'s` : ""} complaints.
                    </p>
                  </div>
                )}

                <div className="w-full flex items-center justify-end  px-2 py-2 rounded-md border border-red-200 shadow-md  bg-white  cursor-pointer">
                  <span
                    className="cursor-pointer "
                    onClick={() => setComplaintDropDown(!complaintDropDown)}
                  >
                    {complaintDropDown ? (
                      <IoIosArrowDropup className="h-6 w-6 text-red-800 " />
                    ) : (
                      <IoIosArrowDropdown className="h-6 w-6 text-red-800 " />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Holidays Count */}
          <div className="w-full flex flex-col h-fit items-center p-4 rounded-xl bg-gradient-to-br from-teal-200 via-teal-300 to-teal-400 shadow-xl hover:shadow-2xl  ">
            <div className="flex flex-col gap-3 w-full">
              {/* Header */}
              <div className="w-full flex items-center gap-2 p-3 rounded-md border border-teal-300 shadow-lg bg-white">
                <h3 className="font-semibold text-2xl w-[75%] text-teal-700">
                  Employee's
                </h3>
                <h3 className="font-semibold text-2xl text-teal-700">
                  Holidays
                </h3>
              </div>

              {/* User Holiday Counts */}
              <div className="flex flex-col gap-3">
                {userHolidayCount.length > 0 ? (
                  <>
                    {(!holidayDropDown
                      ? userHolidayCount.slice(0, 2)
                      : userHolidayCount
                    )?.map((holiday) => (
                      <>
                        <div
                          key={holiday.user}
                          className={`w-full flex items-center justify-between gap-3 px-2 py-1 hover:py-2 rounded-md border border-teal-200 shadow-md bg-white/70 hover:bg-white transition-all transform duration-300 ease-in-out hover:scale-105 cursor-pointer`}
                        >
                          <h3 className="font-medium text-lg w-full capitalize text-gray-700">
                            {holiday.user}
                          </h3>
                          <div className="w-full flex items-center justify-end pr-2">
                            <div className="bg-gradient-to-br from-teal-200 to-teal-400 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-xl font-semibold text-teal-900">
                                {holiday.count}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center p-6 rounded-lg bg-white shadow-md border border-gray-200">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-500 rounded-full mb-4">
                      {/* Replace with a holiday or user icon of your choice */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        width="36"
                        height="36"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-7h8v2H8v-2zm0-4h8v2H8V9z" />
                      </svg>
                    </div>

                    {/* Message */}
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Holidays Found
                    </h3>
                    <p className="text-gray-500 text-center w-full">
                      Currently, there are no{" "}
                      {selectedUser ? `${selectedUser}'s` : ""} holidays.
                    </p>
                  </div>
                )}
                <div className="w-full flex items-center justify-end  px-2 py-2 rounded-md border border-teal-200 shadow-md  bg-white  cursor-pointer">
                  <span
                    className="cursor-pointer "
                    onClick={() => setHolidayDropDown(!holidayDropDown)}
                  >
                    {holidayDropDown ? (
                      <IoIosArrowDropup className="h-6 w-6 text-teal-800 " />
                    ) : (
                      <IoIosArrowDropdown className="h-6 w-6 text-teal-800 " />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Count */}
          <div className="w-full flex flex-col h-fit items-center p-4 rounded-xl bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 shadow-xl hover:shadow-2xl  ">
            <div className="flex flex-col gap-3 w-full">
              {/* Header */}
              <div className="w-full flex items-center gap-2 p-3 rounded-md border border-purple-300 shadow-lg bg-white">
                <h3 className="font-semibold text-2xl w-[75%] text-purple-700">
                  Owner
                </h3>
                <h3 className="font-semibold text-2xl text-purple-700">
                  Clients
                </h3>
              </div>

              {/* User Client Counts */}
              <div className="flex flex-col gap-3">
                {userClientCounts.length > 0 ? (
                  <>
                    {(!clientDropDown
                      ? userClientCounts.slice(0, 2)
                      : userClientCounts
                    )?.map((client) => (
                      <>
                        <div
                          key={client.user}
                          className={`w-full flex items-center justify-between gap-3 px-2 py-1 hover:py-2 rounded-md border border-purple-200 shadow-md bg-white/70 hover:bg-white transition-all transform duration-300 ease-in-out hover:scale-105 cursor-pointer`}
                        >
                          <h3 className="font-medium text-lg w-full capitalize text-gray-700">
                            {client.user}
                          </h3>
                          <div className="w-full flex items-center justify-end pr-2">
                            <div className="bg-gradient-to-br from-purple-200 to-purple-400 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-xl font-semibold text-purple-900">
                                {client.count}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center p-6 rounded-lg bg-white shadow-md border border-gray-200">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-500 rounded-full mb-4">
                      {/* Replace with a holiday or user icon of your choice */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        width="36"
                        height="36"
                      >
                        {/* Briefcase icon representing jobs */}
                        <path d="M10 4h4v2h-4V4zm10 4h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v4H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-1 12H5v-7h14v7zm0-9H5V10h14v1z" />
                      </svg>
                    </div>

                    {/* Message */}
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Clients Found
                    </h3>
                    <p className="text-gray-500 text-center w-full">
                      Currently, there are no{" "}
                      {selectedUser ? `${selectedUser}'s` : ""} clients.
                    </p>
                  </div>
                )}
                <div className="w-full flex items-center justify-end  px-2 py-2 rounded-md border border-purple-200 shadow-md  bg-white  cursor-pointer">
                  <span
                    className="cursor-pointer "
                    onClick={() => setClientDropDown(!clientDropDown)}
                  >
                    {clientDropDown ? (
                      <IoIosArrowDropup className="h-6 w-6 text-purple-800 " />
                    ) : (
                      <IoIosArrowDropdown className="h-6 w-6 text-purple-800 " />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/*  */}
        </div>
      </div>
    </div>
  );
}
