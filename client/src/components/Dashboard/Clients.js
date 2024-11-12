import axios from "axios";
import React, { useEffect, useState } from "react";
import ApexCharts from "apexcharts";
import Loader from "../../utlis/Loader";
import { style } from "../../utlis/CommonStyle";
import JobSourcePieChart from "./ClientSourceChart";
import JobSourceClientPartnerDonutCharts from "./ClientpartnerChart";

export default function Clients({
  selectedMonth,
  selectedYear,
  selectedSource,
  selectedClient,
  selectedPartner,
  selectedDepartment,
}) {
  const [loading, setLoading] = useState(false);
  const [workFlowData, setWorkflowData] = useState([]);
  const [clients, setClients] = useState([]);
  const [fee, setFee] = useState("");
  const [selectChart, setSelectChart] = useState("bar");

  console.log("clients:", clients, "workflow:", workFlowData);

  const departments = [
    "Bookkeeping",
    "Payroll",
    "Vat Return",
    "Personal Tax",
    "Accounts",
    "Company Sec",
    "Address",
  ];

  // ---------------All Client_Job Data----------->
  const allClientJobData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/workflow/clients`
      );
      if (data) {
        setWorkflowData(data?.clients);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allClientJobData();
    // eslint-disable-next-line
  }, []);

  //------------ Department wise Total-------->
  useEffect(() => {
    const departmentTotals = departments.map((department) => {
      // Filter jobs by department
      const departmentJobs = workFlowData.filter(
        (job) => job.job.jobName === department
      );

      // Calculate total hours, fees, and job count for the department
      const totalHours = departmentJobs
        .reduce((sum, job) => sum + parseFloat(job.totalHours || 0), 0)
        .toFixed(2);
      const totalFee = departmentJobs.reduce(
        (sum, job) => sum + parseFloat(job.fee || 0),
        0
      );
      const totalDepartmentCount = departmentJobs?.length;

      // Calculate lead-wise totals and job counts
      const leadWiseTotals = departmentJobs.reduce((acc, job) => {
        const lead = job.job.lead;
        if (!acc[lead]) {
          acc[lead] = { totalHours: 0, totalFee: 0, departmentCount: 0 };
        }
        acc[lead].totalHours += parseFloat(job.totalHours || 0);
        acc[lead].totalFee += parseFloat(job.fee || 0);
        acc[lead].departmentCount += 1;
        return acc;
      }, {});

      return {
        department,
        totalHours,
        totalFee,
        totalDepartmentCount,
        leadWiseTotals,
      };
    });

    setClients(departmentTotals);

    // eslint-disable-next-line
  }, [workFlowData]);

  // ------------Total Fee-------->
  useEffect(() => {
    const calculateTotalFee = (data) => {
      return data.reduce((sum, client) => sum + Number(client.totalFee), 0);
    };

    setFee(calculateTotalFee(clients).toFixed(0));
  }, [clients]);

  // --Render Department Count Chart------->
  useEffect(() => {
    const departmentCounts = clients.map(
      (client) => client.totalDepartmentCount
    );
    const departmentLabels = clients.map((client) => client.department);

    const optionsCount = {
      series: [{ name: "Total Count", data: departmentCounts }],
      chart: { type: "bar", height: 350 },
      plotOptions: { bar: { columnWidth: "50%", borderRadius: 5 } },
      xaxis: { categories: departmentLabels, title: { text: "Department" } },
      yaxis: { title: { text: "Total Count" } },
    };

    const chartElementCount = document.querySelector("#department-count-chart");
    if (chartElementCount) {
      const chartCount = new ApexCharts(chartElementCount, optionsCount);
      chartCount.render();
      return () => chartCount.destroy();
    }
  }, [clients]);

  // Render Department Fee Chart
  useEffect(() => {
    const departmentFees = clients.map((client) => client.totalFee);
    const departmentLabels = clients.map((client) => client.department);

    const optionsFee = {
      series: [
        {
          name: "Total Fee",
          data: departmentFees,
          color: "#a21caf",
        },
      ],
      chart: {
        type: "bar",
        height: 350,
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          columnWidth: "50%",
          borderRadius: 5,
          colors: {
            backgroundBarColors: ["#f0f0f0"],
            backgroundBarOpacity: 0.4,
          },
        },
      },
      xaxis: {
        categories: departmentLabels,
        title: {
          text: "Department",
          style: { fontWeight: "bold" },
        },
        labels: { style: { colors: "#4B5563", fontSize: "12px" } },
      },
      yaxis: {
        title: {
          text: "Total Fee ($)",
          style: { fontWeight: "bold" },
        },
        labels: { style: { colors: "#4B5563", fontSize: "12px" } },
      },
      tooltip: {
        theme: "light",
        y: {
          formatter: (value) => `$${value.toLocaleString()}`,
        },
      },
    };

    const chartElementFee = document.querySelector("#department-fee-chart");
    if (chartElementFee) {
      const chartFee = new ApexCharts(chartElementFee, optionsFee);
      chartFee.render();
      return () => chartFee.destroy();
    }
  }, [clients]);

  // Filter By Depertment

  useEffect(() => {
    const filterData = () => {
      let filteredData = [...workFlowData];

      // Filter by department
      if (selectedDepartment) {
        filteredData = filteredData.filter(
          (job) => job.job.jobName === selectedDepartment
        );
      }

      // Filter by month and year
      if (selectedMonth && selectedYear) {
        filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.createdAt);
          const jobMonth = jobDate.getMonth() + 1;
          const jobYear = jobDate.getFullYear();

          return jobMonth === selectedMonth && jobYear === selectedYear;
        });
      } else if (selectedMonth) {
        filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.createdAt);
          const jobMonth = jobDate.getMonth() + 1;
          return jobMonth === parseInt(selectedMonth);
        });
      } else if (selectedYear) {
        filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.createdAt);
          const jobYear = jobDate.getFullYear();
          return jobYear === parseInt(selectedYear);
        });
      }

      console.log("filteredData:", filteredData);

      return filteredData;
    };

    const departmentTotals = departments.map((department) => {
      const departmentJobs = filterData().filter(
        (job) => job.job.jobName === department
      );

      // Calculate total hours, fees, and job count for the department
      const totalHours = departmentJobs
        .reduce((sum, job) => sum + parseFloat(job.totalHours || 0), 0)
        .toFixed(2);
      const totalFee = departmentJobs.reduce(
        (sum, job) => sum + parseFloat(job.fee || 0),
        0
      );
      const totalDepartmentCount = departmentJobs.length;

      // Calculate lead-wise totals and job counts
      const leadWiseTotals = departmentJobs.reduce((acc, job) => {
        const lead = job.job.lead;
        if (!acc[lead]) {
          acc[lead] = { totalHours: 0, totalFee: 0, departmentCount: 0 };
        }
        acc[lead].totalHours += parseFloat(job.totalHours || 0);
        acc[lead].totalFee += parseFloat(job.fee || 0);
        acc[lead].departmentCount += 1;
        return acc;
      }, {});

      return {
        department,
        totalHours,
        totalFee,
        totalDepartmentCount,
        leadWiseTotals,
      };
    });

    setClients(departmentTotals);
    // eslint-disable-next-line
  }, [workFlowData, selectedDepartment, selectedMonth, selectedYear]);

  //------------------------ Filter Data By Depertment || Month || Year || Source || Client Type------>
  const filterData = workFlowData.filter((job) => {
    const jobDate = new Date(job.createdAt);
    const jobMonth = jobDate.getMonth() + 1;
    const jobYear = jobDate.getFullYear();

    return (
      // Apply month filter (0-indexed, so we adjust selectedMonth by subtracting 1)
      (selectedMonth ? jobMonth === parseInt(selectedMonth) : true) &&
      // Apply year filter
      (selectedYear ? jobYear === parseInt(selectedYear) : true) &&
      (selectedSource ? job.source === selectedSource : true) &&
      (selectedClient ? job.clientType === selectedClient : true) &&
      (selectedPartner ? job.partner === selectedPartner : true) &&
      (selectedDepartment ? job.job.jobName === selectedDepartment : true)
    );
  });

  console.log("Filter Data", filterData);

  // Map data for month-wise total job count and fee totals
  const monthData = filterData.reduce((acc, job) => {
    const jobDate = new Date(job.createdAt);
    const month = jobDate.toLocaleString("default", { month: "short" });

    // Initialize month if not already present
    if (!acc[month]) acc[month] = { jobCount: 0, totalFee: 0 };

    // Increment job count and total fee for the month
    acc[month].jobCount += 1;
    acc[month].totalFee += parseFloat(job.fee || 0);

    return acc;
  }, {});

  // Get months for the chart
  const months = Object.keys(monthData);

  // Prepare data series for month-wise job count
  const jobCountSeries = [
    {
      name: "Total Jobs",
      data: months.map((month) => monthData[month]?.jobCount || 0),
    },
  ];

  // Prepare data series for month-wise fee totals
  const feeSeries = [
    {
      name: "Total Fee",
      data: months.map((month) => monthData[month]?.totalFee || 0),
    },
  ];

  // Render charts
  useEffect(() => {
    // Job Count Chart
    const jobCountChartOptions = {
      series: jobCountSeries,
      chart: { type: selectChart, height: 350 },
      xaxis: { categories: months, title: { text: "Month" } },
      yaxis: { title: { text: "Total Jobs" } },
      plotOptions:
        selectChart === "bar"
          ? {
              bar: {
                columnWidth: `${selectedMonth ? "10%" : "40%"}`,
                borderRadius: 5,
              },
            }
          : {},
    };

    const jobCountChartElement = document.querySelector("#apex-jobcount-chart");
    if (jobCountChartElement) {
      const jobCountChart = new ApexCharts(
        jobCountChartElement,
        jobCountChartOptions
      );
      jobCountChart.render();
      return () => jobCountChart.destroy();
    }
  }, [selectChart, months, jobCountSeries]);

  useEffect(() => {
    // Fee Total Chart
    const feeChartOptions = {
      series: feeSeries,
      chart: { type: selectChart, height: 350 },
      xaxis: { categories: months, title: { text: "Month" } },
      yaxis: { title: { text: "Total Fee" } },
      plotOptions:
        selectChart === "bar"
          ? { bar: { columnWidth: "50%", borderRadius: 5 } }
          : {},
    };

    const feeChartElement = document.querySelector("#apex-fee-chart");
    if (feeChartElement) {
      const feeChart = new ApexCharts(feeChartElement, feeChartOptions);
      feeChart.render();
      return () => feeChart.destroy();
    }
  }, [selectChart, months, feeSeries]);

  return (
    <div className="w-full h-full">
      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-4 overflow-x-auto py-4 mx-auto max-w-[98%] hidden1 scroll-smooth">
            <div className="flex flex-col items-center min-w-[11rem] p-6 cursor-pointer bg-gradient-to-br from-rose-100 via-rose-200 to-rose-300 rounded-lg shadow-lg hover:shadow-xl transform transition-transform duration-300 hover:scale-105">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
                Departments
              </h2>
              <div className="flex items-center flex-col justify-center w-full gap-3">
                <p className="text-lg font-medium text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Total Clients:
                  </span>{" "}
                </p>
                <p className="text-lg font-medium text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Total Fee:
                  </span>
                </p>
              </div>
            </div>
            {clients?.map((job) => (
              <div
                key={job._id}
                className={`flex flex-col items-center min-w-[13rem]  p-6 cursor-pointer transition-transform duration-300 transform hover:scale-105 rounded-lg shadow-lg hover:shadow-xl ${
                  job?.department === "Bookkeeping"
                    ? "bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300"
                    : job?.department === "Payroll"
                    ? "bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300"
                    : job?.department === "Vat Return"
                    ? "bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300"
                    : job?.department === "Personal Tax"
                    ? "bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300"
                    : job?.department === "Accounts"
                    ? "bg-gradient-to-br from-sky-100 via-sky-200 to-sky-300"
                    : job?.department === "Company Sec"
                    ? "bg-gradient-to-br from-green-100 via-green-200 to-green-300"
                    : "bg-gradient-to-br from-fuchsia-100 via-fuchsia-200 to-fuchsia-300"
                }  ${
                  (job?.department === "Training" ||
                    job?.department === "CRM.Affotax") &&
                  "hidden"
                }`}
              >
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
                  {job?.department}
                </h2>
                <div className="flex flex-col items-center w-full space-y-2">
                  {/*  */}
                  <p className="text-2xl font-medium text-gray-700 text-center">
                    {job?.totalDepartmentCount}
                  </p>

                  <p className="text-2xl font-medium text-gray-700 text-center">
                    ${" "}
                    {parseFloat(job?.totalFee).toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex flex-col items-center min-w-[13rem]  p-6 cursor-pointer bg-gradient-to-br from-rose-100 via-rose-200 to-rose-300 rounded-lg shadow-lg hover:shadow-xl transform transition-transform duration-300 hover:scale-105">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
                Total Dep
              </h2>
              <p className="text-2xl font-medium text-gray-700 text-center">
                {workFlowData?.length}
              </p>
              <p className="text-2xl font-medium text-gray-700 text-center">
                ${" "}
                {parseFloat(fee).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* -----------------------Bar/Line/Area Charts--------------- */}
          <div className="w-full flex flex-col gap-4">
            {/* ------------Month Wise Department Total------------ */}
            <div className="w-full shadow-md rounded-md cursor-pointer border p-2">
              <div className="flex items-center gap-6">
                <h3 className="text-xl font-semibold text-center">
                  Client Department Analytics
                </h3>
                <select
                  onChange={(e) => setSelectChart(e.target.value)}
                  value={selectChart}
                  className={`${style.input} shadow-md drop-shadow-md`}
                  style={{ height: "2.2rem" }}
                >
                  <option value={"bar"}>Bar Chart</option>
                  <option value={"line"}>Line Chart</option>
                  <option value={"area"}>Area Chart</option>
                </select>
              </div>
              {/* (Month Wise) Department Total */}
              <div className="mt-3" id="apex-jobcount-chart" />
            </div>
            {/* ------------Month Wise Fee------------ */}
            <div className="w-full shadow-md rounded-md cursor-pointer border p-2">
              <div className="flex items-center gap-6">
                <h3 className="text-xl font-semibold text-center">
                  Client Fee Analytics
                </h3>
              </div>
              {/* (Month Wise) Fee Total */}
              <div className="mt-3" id="apex-fee-chart" />
            </div>
          </div>

          {/* -----------------Graphic----------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            <div className="w-full shadow-md rounded-md cursor-pointer border p-2">
              <h3 className="text-lg font-semibold text-center">
                Department-wise Total Count
              </h3>
              <div id="department-count-chart" />
            </div>
            <div className="w-full shadow-md rounded-md cursor-pointer border p-2">
              <h3 className="text-lg font-semibold text-center">
                Department-wise Fee Count
              </h3>
              <div id="department-fee-chart" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            <div className="w-full shadow-md rounded-md cursor-pointer border p-2">
              <JobSourcePieChart
                workFlowData={workFlowData}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            </div>
            <div className="w-full shadow-md rounded-md cursor-pointer border p-2">
              <JobSourceClientPartnerDonutCharts
                workFlowData={workFlowData}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
