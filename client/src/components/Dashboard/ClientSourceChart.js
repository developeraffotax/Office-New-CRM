import React, { useEffect, useState } from "react";
import ApexCharts from "apexcharts";
import { style } from "../../utlis/CommonStyle";

const sources = ["FIV", "UPW", "PPH", "Website", "Direct", "Partner"];

const JobSourceChart = ({ workFlowData, selectedMonth, selectedYear }) => {
  const [chartType, setChartType] = useState("pie"); // Toggle between Pie and Area chart
  const [chartData, setChartData] = useState({ labels: [], series: [] });

  useEffect(() => {
    let filteredData = workFlowData;

    if (selectedYear) {
      filteredData = filteredData.filter((job) => {
        const jobYear = new Date(job.currentDate).getFullYear();
        return jobYear === parseInt(selectedYear);
      });
    }

    if (selectedMonth) {
      filteredData = filteredData.filter((job) => {
        const jobMonth = new Date(job.currentDate).getMonth() + 1;
        return jobMonth === parseInt(selectedMonth);
      });
    }

    const sourceCount = sources.reduce((acc, source) => {
      acc[source] = 0;
      return acc;
    }, {});

    filteredData.forEach((job) => {
      const jobSource = job.source;
      if (sources.includes(jobSource)) {
        sourceCount[jobSource] += 1;
      }
    });

    setChartData({
      labels: Object.keys(sourceCount),
      series: Object.values(sourceCount),
    });
  }, [workFlowData, selectedMonth, selectedYear]);

  useEffect(() => {
    if (chartData.labels.length > 0) {
      const formattedLabels = chartData.labels.map(
        (label, index) => `${label} (${chartData.series[index]})`
      );

      const chartOptions = {
        chart: {
          type: chartType,
          height: 300,
        },
        colors: [
          "#FF5733",
          "#33FF57",
          "#3357FF",
          "#F3FF33",
          "#FF33F0",
          "#33F0FF",
        ],
        legend: { position: "bottom" },
        tooltip: {
          y: {
            formatter: (val) => `${val} Jobs`,
          },
        },
        stroke: chartType === "area" ? { curve: "smooth" } : {},
        fill:
          chartType === "area"
            ? {
                type: "gradient",
                gradient: {
                  shadeIntensity: 0.4,
                  opacityFrom: 0.6,
                  opacityTo: 0.2,
                },
              }
            : {},
        series:
          chartType === "area"
            ? [{ name: "Job Sources", data: chartData.series }]
            : chartData.series,
        labels: formattedLabels, // ✅ Updated labels with count
      };

      const chartElement = document.querySelector("#job-source-chart");
      if (chartElement) {
        const sourceChart = new ApexCharts(chartElement, chartOptions);
        sourceChart.render();
        return () => sourceChart.destroy();
      }
    }
  }, [chartData, chartType]);

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 text-center mb-3">
          Job Sources
        </h2>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className={`${style.input} w-[12rem] shadow-md drop-shadow-md`}
        >
          <option value="pie">Pie Chart</option>
          <option value="area">Area Chart</option>
        </select>
      </div>
      <div id="job-source-chart" className="mt-4"></div>
    </div>
  );
};

export default JobSourceChart;
