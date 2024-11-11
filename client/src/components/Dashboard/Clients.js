import axios from "axios";
import React, { useEffect, useState } from "react";
import ApexCharts from "apexcharts";

export default function Clients({ selectedMonth, selectedYear }) {
  const [loading, setLoading] = useState(false);
  const [workFlowData, setWorkflowData] = useState([]);
  const [clients, setClients] = useState([]);
  const [fee, setFee] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

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

  // Get Client Lead Wise Total
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
  }, [workFlowData]);

  // ------------Total Fee-------->
  useEffect(() => {
    const calculateTotalFee = (data) => {
      return data.reduce((sum, client) => sum + Number(client.totalFee), 0);
    };

    setFee(calculateTotalFee(clients).toFixed(0));
  }, [clients]);

  // Render Department Count Chart
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

  // Filter Data
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
          return jobMonth === selectedMonth;
        });
      } else if (selectedYear) {
        filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.createdAt);
          const jobYear = jobDate.getFullYear();
          return jobYear === selectedYear;
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

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex gap-4 overflow-x-auto py-4 mx-auto max-w-[98%] hidden1 scroll-smooth">
          {clients?.map((job) => (
            <div
              key={job._id}
              className={`flex flex-col items-center min-w-[15rem] max-w-[15rem] p-6 cursor-pointer transition-transform duration-300 transform hover:scale-105 rounded-lg shadow-lg hover:shadow-xl ${
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
              }`}
              onClick={() => setSelectedDepartment(job?.department)}
            >
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
                {job?.department}
              </h2>
              <div className="flex flex-col items-start w-full space-y-2">
                <p className="text-lg font-medium text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Total Clients:
                  </span>{" "}
                  {job?.totalDepartmentCount}
                </p>
                <p className="text-lg font-medium text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Total Fee:
                  </span>{" "}
                  $ {job?.totalFee}
                </p>
              </div>
            </div>
          ))}
          <div
            onClick={() => setSelectedDepartment("")}
            className="flex flex-col items-center min-w-[15rem] max-w-[15rem] p-6 cursor-pointer bg-gradient-to-br from-rose-100 via-rose-200 to-rose-300 rounded-lg shadow-lg hover:shadow-xl transform transition-transform duration-300 hover:scale-105"
          >
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
              Total
            </h2>
            <p className="text-lg font-medium text-gray-700">
              <span className="font-semibold text-gray-900">
                Total Clients:
              </span>{" "}
              {workFlowData?.length}
            </p>
            <p className="text-lg font-medium text-gray-700">
              <span className="font-semibold text-gray-900">Total Fee:</span> ${" "}
              {fee}
            </p>
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
      </div>
    </div>
  );
}
