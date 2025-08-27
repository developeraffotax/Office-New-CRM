import React, { useState } from "react";
import dayjs from "dayjs";
import LeadsChart from "./LeadChart";
import LeadDonutChart from "./LeadDonutChart";
import Filters from "./Filters";
import PageHeading from "./PageHeading";

import LeadStatusAreaChart from "./LeadStatusAreaChart";
import ConversionRateCard from "./ConversionRateCard";

const LeadsStats = () => {
  // store start & end directly
  // const [filter, setFilter] = useState({
  //   start: dayjs().startOf("month").format("YYYY-MM-DD"),
  //   end: dayjs().endOf("month").format("YYYY-MM-DD"),
  // });

  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);
  const [lead_Source, setLeadSource] = useState("");
  const [department, setDepartment] = useState("");

  const [start, end] = dateRange;

  return (
    <div className="w-full ">
      <div className="relative w-full mb-6 ">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-3xl"></div>

        {/* Foreground Content */}
        <div className="relative z-10 py-2 px-5   bg-white/70 backdrop-blur-md shadow-lg border border-white/20 flex flex-row justify-between items-center gap-8 ">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4">
            {/* Title & Subtitle */}
            <PageHeading />
          </div>
          <Filters
            dateRange={dateRange}
            setDateRange={setDateRange}
            lead_Source={lead_Source}
            setLeadSource={setLeadSource}
            department={department}
            setDepartment={setDepartment}
          />
        </div>
      </div>

      {/* Charts using start/end directly */}

      <div className="w-full p-5 ">
        <div className="w-full flex flex-row justify-center gap-12 items-start mb-8 ">
          <div className="w-[70%] space-y-8">
            <LeadsChart
              start={start}
              end={end}
              lead_Source={lead_Source}
              setLeadSource={setLeadSource}
              department={department}
              setDepartment={setDepartment}
            />

            <LeadStatusAreaChart
              start={start}
              end={end}
              lead_Source={lead_Source}
              setLeadSource={setLeadSource}
              department={department}
              setDepartment={setDepartment}
            />
          </div>

          <div className="w-[30%]">
            <ConversionRateCard
              start={start}
              end={end}
              lead_Source={lead_Source}
              setLeadSource={setLeadSource}
              department={department}
              setDepartment={setDepartment}
            />
            <LeadDonutChart
              start={start}
              end={end}
              lead_Source={lead_Source}
              setLeadSource={setLeadSource}
              department={department}
              setDepartment={setDepartment}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsStats;
