import React from "react";
import LeadsChart from "./LeadChart";
import LeadDonutChart from "./LeadDonutChart";
import Filters from "./Filters";
import PageHeading from "./PageHeading";
import LeadStatusAreaChart from "./LeadStatusAreaChart";
import ConversionRateCard from "./ConversionRateCard";
import { useStatsFilters } from "./hooks/useStatsFilters";

const LeadsStats = () => {
  const {
    dateRange,
    setDateRange,
    activeLabel,
    lead_Source,
    setLeadSource,
    department,
    setDepartment,
    applyPreset,
    resetFilters,
    start,
    end,
  } = useStatsFilters();

  return (
    <div className="w-full ">
      <div className="relative w-full mb-6 ">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-3xl"></div>

        {/* Foreground Content */}
        <div className="relative z-10 py-2 px-5   bg-white/70 backdrop-blur-md shadow-lg border border-white/20 flex flex-row justify-between items-center gap-8 ">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4">
            <PageHeading />
          </div>
          <Filters
            dateRange={dateRange}
            setDateRange={setDateRange}
            activeLabel={activeLabel}
            lead_Source={lead_Source}
            setLeadSource={setLeadSource}
            department={department}
            setDepartment={setDepartment}
            applyPreset={applyPreset}
            resetFilters={resetFilters}
          />
        </div>
      </div>

      <div className="w-full p-5 ">
        <div className="w-full flex flex-row justify-center gap-12 items-start mb-8 ">
          <div className="w-[70%] space-y-8">
            <LeadsChart
              start={start}
              end={end}
              lead_Source={lead_Source}
              department={department}
            />
            <LeadStatusAreaChart
              start={start}
              end={end}
              lead_Source={lead_Source}
              department={department}
            />
          </div>

          <div className="w-[30%]">
            <ConversionRateCard
              start={start}
              end={end}
              lead_Source={lead_Source}
              department={department}
            />
            <LeadDonutChart
              start={start}
              end={end}
              lead_Source={lead_Source}
              department={department}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsStats;
