import React, { useEffect, useState } from "react";
import ApexCharts from "apexcharts";
import { style } from "../../utlis/CommonStyle";

// Clients and partners types
const clients = ["Limited", "LLP", "Individual", "Non UK"];
const partners = ["Affotax", "Outsource", "OTL"];

const JobSourceClientPartnerDonutCharts = ({
  workFlowData,
  selectedMonth,
  selectedYear,
}) => {
  const [selected, setSelected] = useState("client");
  const [chartData, setChartData] = useState({
    clientLabels: [],
    clientSeries: [],
    partnerLabels: [],
    partnerSeries: [],
  });

  useEffect(() => {
    if (!workFlowData) return;

    // Filter workFlowData by selected month and year
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

    // Count the occurrences for clients and partners
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
  }, [workFlowData, selectedMonth, selectedYear]);

  const generateChartOptions = (labels, series, title) => ({
    chart: {
      type: "donut",
      height: 300,
    },
    labels: labels,
    series: series,
    title: {
      text: title,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
        },
      },
    },
    legend: {
      position: "bottom",
    },
    colors: ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F0", "#33F0FF"],
    tooltip: {
      y: {
        formatter: (val) => `${val} Jobs`,
      },
    },
  });

  useEffect(() => {
    // Render the Client Type Chart
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

    // Render the Partner Chart
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
  }, [chartData, selected]);

  return (
    <div className="flex flex-col gap-4">
      <select
        onChange={(e) => setSelected(e.target.value)}
        value={selected}
        className={`${style.input} w-[12rem] shadow-md drop-shadow-md`}
      >
       
        <option value="partner">Partner</option>
        <option value="client">Client</option>
      </select>
      {selected === "partner" ? (
        <div
          id="apex-client-donut-chart"
          style={{ marginBottom: "30px" }}
        ></div>
      ) : (
        <div id="apex-partner-donut-chart"></div>
      )}
    </div>
  );
};

export default JobSourceClientPartnerDonutCharts;
