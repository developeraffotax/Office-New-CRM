import React, { useEffect, useState } from "react";
import ApexCharts from "apexcharts";

// clients, and partners

const clients = ["Limited", "LLP", "Individual", "Non UK"];
const partners = ["Affotax", "Outsource", "OTL"];

const JobSourceClientPartnerDonutCharts = ({
  workFlowData,
  selectedMonth,
  selectedYear,
}) => {
  const [chartData, setChartData] = useState({
    sourceLabels: [],
    sourceSeries: [],
    clientLabels: [],
    clientSeries: [],
    partnerLabels: [],
    partnerSeries: [],
  });

  useEffect(() => {
    // Filter workFlowData by selected month and year
    let filteredData = workFlowData;

    if (selectedYear) {
      filteredData = filteredData.filter((job) => {
        const jobYear = new Date(job.createdAt).getFullYear();
        return jobYear === parseInt(selectedYear);
      });
    }

    if (selectedMonth) {
      filteredData = filteredData.filter((job) => {
        const jobMonth = new Date(job.createdAt).getMonth() + 1; // Month is 0-indexed
        return jobMonth === parseInt(selectedMonth);
      });
    }

    // Count occurrences of each clientType
    const clientCount = clients.reduce((acc, client) => {
      acc[client] = 0;
      return acc;
    }, {});

    // Count occurrences of each partner
    const partnerCount = partners.reduce((acc, partner) => {
      acc[partner] = 0;
      return acc;
    }, {});

    // Count the occurrences for sources, clients, and partners
    filteredData.forEach((job) => {
      if (clients.includes(job.clientType)) {
        clientCount[job.clientType] += 1;
      }
      if (partners.includes(job.partner)) {
        partnerCount[job.partner] += 1;
      }
    });

    // Prepare chart data
    setChartData({
      clientLabels: Object.keys(clientCount),
      clientSeries: Object.values(clientCount),
      partnerLabels: Object.keys(partnerCount),
      partnerSeries: Object.values(partnerCount),
    });
  }, [workFlowData, selectedMonth, selectedYear]); // Depend on workFlowData, selectedMonth, and selectedYear

  const generateChartOptions = (labels, series, title) => ({
    chart: {
      type: "donut",
      height: 400,
    },
    labels: labels,
    series: series,
    title: {
      text: title,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%", // Adjust the size of the donut
        },
      },
    },
    legend: {
      position: "bottom",
    },
    colors: [
      "#FF5733", // Source Colors
      "#33FF57",
      "#3357FF",
      "#F3FF33",
      "#FF33F0",
      "#33F0FF",
    ],
    tooltip: {
      y: {
        formatter: (val) => `${val} Jobs`, // Display job count in tooltip
      },
    },
  });

  useEffect(() => {
    // Render the charts if the data is ready
    const chartElement = document.querySelector("#apex-source-donut-chart");
    if (chartElement && chartData.sourceLabels.length > 0) {
      const sourceChart = new ApexCharts(
        chartElement,
        generateChartOptions(
          chartData.sourceLabels,
          chartData.sourceSeries,
          "Job Sources Count"
        )
      );
      sourceChart.render();
      return () => sourceChart.destroy();
    }

    const clientElement = document.querySelector("#apex-client-donut-chart");
    if (clientElement && chartData.clientLabels.length > 0) {
      const clientChart = new ApexCharts(
        clientElement,
        generateChartOptions(
          chartData.clientLabels,
          chartData.clientSeries,
          "Client Type Count"
        )
      );
      clientChart.render();
      return () => clientChart.destroy();
    }

    const partnerElement = document.querySelector("#apex-partner-donut-chart");
    if (partnerElement && chartData.partnerLabels.length > 0) {
      const partnerChart = new ApexCharts(
        partnerElement,
        generateChartOptions(
          chartData.partnerLabels,
          chartData.partnerSeries,
          "Partner Count"
        )
      );
      partnerChart.render();
      return () => partnerChart.destroy();
    }
  }, [chartData]);

  return (
    <div>
      <div id="apex-client-donut-chart" style={{ marginBottom: "30px" }}></div>
      <div id="apex-partner-donut-chart"></div>
    </div>
  );
};

export default JobSourceClientPartnerDonutCharts;
