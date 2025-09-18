// helpers/aggregators.js
import { monthOrder } from "./filters";

// Aggregate jobs
export function aggregateJobs(data) {
  return data.reduce((acc, job) => {
    const date = new Date(job.currentDate);
    const monthKey = `${date.toLocaleString("default", { month: "short" })}`;
    if (!acc[monthKey]) acc[monthKey] = { jobCount: 0, totalFee: 0 };

    acc[monthKey].jobCount += 1;
    acc[monthKey].totalFee += parseFloat(job.fee || 0);

    return acc;
  }, {});
}

// Aggregate leads
export function aggregateLeads(data) {
  const acc = data.reduce((acc, lead) => {
    const date = new Date(lead.createdAt);
    const monthKey = `${date.toLocaleString("default", { month: "short" })}`;
    if (!acc[monthKey]) acc[monthKey] = { leadCount: 0 };
    acc[monthKey].leadCount += 1;
    return acc;
  }, {});

   


  return acc;
}

// Format for chart series
export function buildSeries(data, months, type) {
  return [
    {
      name: type,
      data: months.map((m) => data[m]?.[type === "Total Leads" ? "leadCount" : type === "Total Jobs" ? "jobCount" : "totalFee"] || 0),
    },
  ];
}
