import React, { useEffect, useState } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import Layout from "../../components/Loyout/Layout";
import { style } from "../../utlis/CommonStyle";

export default function Dashboard() {
  const [tasksData, setTasksData] = useState([]);
  const [chartOptions, setChartOptions] = useState({
    chart: {
      id: "realtime",
      height: 350,
      type: "area",
      animations: {
        enabled: true,
        easing: "linear",
        dynamicAnimation: { speed: 1000 },
      },
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: ["#FDD835"],
        inverseColors: false,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      max: 100,
    },
    title: {
      align: "left",
    },
    markers: {
      size: 0,
    },
  });
  const [chartSeries, setChartSeries] = useState([{ data: [] }]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Fetch tasks data
  const getAllTasks = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/dashboard/tasks`
      );
      const formattedData = data.tasks.map((task) => ({
        x: new Date(task.createdAt).getTime(),
        y: task.value || Math.floor(Math.random() * 90) + 10,
      }));
      setTasksData(formattedData);
      setChartSeries([{ data: formattedData }]);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    getAllTasks();
  }, []);

  // Filtering function
  const filterData = () => {
    let filteredData = tasksData;

    // Apply year filter
    if (selectedYear) {
      filteredData = filteredData.filter(
        (task) => new Date(task.x).getFullYear() === parseInt(selectedYear)
      );
    }

    // Apply month filter
    if (selectedMonth) {
      filteredData = filteredData.filter(
        (task) => new Date(task.x).getMonth() === parseInt(selectedMonth) - 1 // Adjust for 0-indexed months
      );
    }

    setChartSeries([{ data: filteredData }]);
  };

  // Filter data when selectedMonth or selectedYear changes
  useEffect(() => {
    filterData();
  }, [selectedMonth, selectedYear, tasksData]);

  return (
    <Layout>
      <div className="relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4  bg-gray-100">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              Dashboard
            </h1>
          </div>
          {/* Filters */}
          <div className="flex gap-4 my-4">
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
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          {/* Chart */}
          <div className="flex flex-col gap-4 shadow-md rounded-md py-2 px-2 bg-white drop-shadow-md">
            <h2 className="text-lg font-semibold">Tasks Analytics</h2>
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={450}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
