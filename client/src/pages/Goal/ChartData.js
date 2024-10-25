import React, { useEffect } from "react";
import ApexCharts from "apexcharts";

const goalTypes = [
  "Increase Client",
  "Increase Fee",
  "Total Proposal",
  "Total Lead",
  "Lead Won",
];

export default function ChartData({ goalsData, selectChart }) {
  useEffect(() => {
    if (goalsData && goalsData.length > 0) {
      const achievedCounts = goalsData.map((goal) => goal.achievedCount);
      const achievements = goalsData.map((goal) => goal.achievement);

      const goalLabels = goalsData.map((goal) => {
        const startDate = new Date(goal.startDate).toLocaleDateString();
        const endDate = new Date(goal.endDate).toLocaleDateString();
        return `${startDate} - ${endDate}`;
      });

      const options = {
        series: [
          {
            name: "Achieved Count (Bar)",
            type: "column",
            data: achievedCounts,
          },
          {
            name: "Target (Achievement) (Bar)",
            type: "column",
            data: achievements,
          },
          {
            name: "Achieved Count (Line)",
            type: "area",
            data: achievedCounts,
          },
          {
            name: "Target (Achievement) (Line)",
            type: "area",
            data: achievements,
          },
        ],
        chart: {
          height: 450,
          type: "line",
          stacked: false,
          toolbar: {
            show: true,
          },
        },
        colors: ["#00E396", "#775DD0", "#FEB019", "#FF4560"],
        stroke: {
          width: [0, 0, 2, 2],
          curve: "smooth",
        },
        plotOptions: {
          bar: {
            columnWidth: "50%",
            borderRadius: 4,
          },
        },
        fill: {
          opacity: [0.85, 0.85, 0.3, 0.3],
          type: ["solid", "solid", "gradient", "gradient"],
          gradient: {
            shade: "light",
            type: "vertical",
            opacityFrom: 0.6,
            opacityTo: 0.2,
          },
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: "12px",
            colors: ["#333"],
          },
        },
        labels: goalLabels,
        xaxis: {
          type: "category",
          labels: {
            rotate: -45,
            style: {
              fontSize: "12px",
              fontWeight: "bold",
            },
          },
        },
        yaxis: {
          title: {
            text: "Counts",
          },
          labels: {
            style: {
              fontWeight: "bold",
            },
          },
        },
        legend: {
          position: "top",
          horizontalAlign: "center",
          labels: {
            colors: "#333",
            useSeriesColors: true,
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(0) + " counts";
              }
              return y;
            },
          },
        },
      };

      // Check if the chart container exists before rendering
      const chartElement = document.querySelector("#chart");
      if (chartElement) {
        const chart = new ApexCharts(chartElement, options);
        chart.render();

        // Cleanup function to destroy the chart on component unmount
        return () => {
          chart.destroy();
        };
      }
    }
  }, [goalsData, selectChart]);

  // Render the Funnel Chart
  useEffect(() => {
    if (selectChart === "Funnel Chart") {
      const funnelData = goalsData.map((goal) => goal.achievedCount);

      const funnelOptions = {
        series: [
          {
            name: "Goals",
            data: funnelData,
          },
        ],
        chart: {
          type: "bar",
          height: 350,
        },
        plotOptions: {
          bar: {
            borderRadius: 0,
            horizontal: true,
            distributed: true,
            barHeight: "80%",
            isFunnel: true,
          },
        },
        colors: ["#F44F5E", "#E55A89", "#D863B1", "#CA6CD8", "#B57BED"],
        dataLabels: {
          enabled: true,
          formatter: function (val, opt) {
            return `${goalTypes[opt.dataPointIndex]}: ${val}`;
          },
          dropShadow: {
            enabled: true,
          },
        },
        title: {
          text: "Funnel Chart",
          align: "middle",
        },
        xaxis: {
          categories: goalTypes,
        },
        legend: {
          show: false,
        },
      };

      const funnelElement = document.querySelector("#funnel-chart");
      if (funnelElement) {
        const funnelChart = new ApexCharts(funnelElement, funnelOptions);
        funnelChart.render();

        // Cleanup function to destroy the funnel chart on component unmount
        return () => {
          funnelChart.destroy();
        };
      }
    }
  }, [selectChart, goalsData]);

  return (
    <div>
      {selectChart === "Line & Bar" ? (
        <div id="chart" style={{ width: "100%", height: "450px" }} />
      ) : (
        <div id="funnel-chart" style={{ width: "100%", height: "350px" }} />
      )}
    </div>
  );
}
