import React, { useEffect, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import Clients from "../../components/Dashboard/Clients";
import Tasks from "../../components/Dashboard/Tasks";
import { style } from "../../utlis/CommonStyle";
import Subscription from "../../components/Dashboard/Subscription";

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState("Clients");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  return (
    <Layout>
      <div className="relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4  bg-gray-100">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              Dashboard
            </h1>
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
                  selectedTab === "Subscription"
                    ? "bg-orange-500 text-white border-r-2 border-orange-500"
                    : "text-black bg-gray-100"
                }`}
                onClick={() => setSelectedTab("Subscription")}
              >
                Subscription
              </button>
              <button
                className={`py-[.4rem] px-2 outline-none w-[8rem] border-l-2 border-orange-600 transition-all duration-300   ${
                  selectedTab === "Tasks"
                    ? "bg-orange-500 text-white border-r-2 border-orange-500"
                    : "text-black bg-gray-100"
                }`}
                onClick={() => setSelectedTab("Tasks")}
              >
                Tasks
              </button>
            </div>

            {/* --------------Date Filters------------- */}
            {/* <div className="flex gap-4 my-4 ml-5">
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
            </div> */}
          </div>
          {/*  */}
          <hr className="mb-1 bg-gray-200 w-full h-[1px]" />
          {/* -------------Detail------- */}

          {selectedTab === "Clients" ? (
            <div className="w-full h-full">
              <Clients
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            </div>
          ) : selectedTab === "Subscription" ? (
            <div className="w-full h-full">
              <Subscription
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
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
