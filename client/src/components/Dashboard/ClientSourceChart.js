import React, { useEffect, useState } from "react";
import ApexCharts from "apexcharts";

const sources = ["FIV", "UPW", "PPH", "Website", "Direct", "Partner"];

const JobSourcePieChart = ({ workFlowData, selectedMonth, selectedYear }) => {
  const [chartData, setChartData] = useState({ labels: [], series: [] });

  useEffect(() => {
    // Filter the data based on selected month and year
    let filteredData = workFlowData;

    if (selectedYear) {
      filteredData = filteredData.filter((job) => {
        const jobYear = new Date(job.currentDate).getFullYear();
        return jobYear === parseInt(selectedYear);
      });
    }

    if (selectedMonth) {
      filteredData = filteredData.filter((job) => {
        const jobMonth = new Date(job.currentDate).getMonth() + 1; // Month is 0-indexed
        return jobMonth === parseInt(selectedMonth);
      });
    }

    // Count occurrences of each source
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

    // Prepare chart data
    const labels = Object.keys(sourceCount);
    const series = Object.values(sourceCount);

    setChartData({ labels, series });
  }, [workFlowData, selectedMonth, selectedYear]); // Depend on selectedMonth and selectedYear

  useEffect(() => {
    if (chartData.labels.length > 0) {
      const chartOptions = {
        chart: {
          type: "pie",
          height: 300,
        },
        labels: chartData.labels,
        series: chartData.series,
        title: {
          text: "Job Sources Count",
        },
        colors: [
          "#FF5733", // FIV
          "#33FF57", // UPW
          "#3357FF", // PPH
          "#F3FF33", // Website
          "#FF33F0", // Referal
          "#33F0FF", // Partner
        ],
        legend: {
          position: "bottom",
        },
        tooltip: {
          y: {
            formatter: (val) => `${val} Jobs`, // Display job count in tooltip
          },
        },
      };

      const chartElement = document.querySelector("#apex-source-pie-chart");
      if (chartElement) {
        const sourceChart = new ApexCharts(chartElement, chartOptions);
        sourceChart.render();
        return () => sourceChart.destroy();
      }
    }
  }, [chartData]);

  return <div id="apex-source-pie-chart"></div>;
};

export default JobSourcePieChart;
