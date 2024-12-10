import React, { useEffect } from "react";
import ApexCharts from "apexcharts";

export default function ChartData({ goalsData, selectChart }) {
  useEffect(() => {
    if (goalsData && goalsData.length > 0) {
      const achievedCounts = goalsData.map((goal) => goal.achievedCount);
      const achievements = goalsData.map((goal) => goal.achievement);

      const goalLabels = goalsData.map((goal) => {
        const startDate = new Date(goal.startDate);
        // const endDate = new Date(goal.endDate);

        const formatter = new Intl.DateTimeFormat("en-US", {
          month: "short",
          year: "numeric",
        });

        const formattedStartDate = formatter.format(startDate);
        // const formattedEndDate = formatter.format(endDate);

        return `${formattedStartDate}`;
      });

      const options = {
        series: [
          {
            name: "Target (Achievement) (Bar)",
            type: "column",
            data: achievements,
          },
          {
            name: "Achieved Count (Bar)",
            type: "column",
            data: achievedCounts,
          },
          {
            name: "Target (Achievement) (Line)",
            type: "area",
            data: achievements,
          },
          // {
          //   name: "Achieved Count (Line)",
          //   type: "area",
          //   data: achievedCounts,
          // },
        ],
        chart: {
          height: 600,
          type: "line",
          stacked: false,
          toolbar: {
            show: true,
          },
        },
        colors: ["#0D92F4", "#00E396", "#FEB019", "#FF4560"],
        stroke: {
          width: [0, 0, 2, 2],
          curve: "smooth",
        },
        plotOptions: {
          bar: {
            columnWidth: `${goalsData.length > 2 ? "60%" : "30%"}`,
            borderRadius: 4,
            gap: ".5rem",
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
          enabled: false,
          // style: {
          //   fontSize: "12px",
          //   colors: ["#333"],
          // },
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

  // Render Spline Area Chart
  useEffect(() => {
    if (selectChart === "Area Chart") {
      const areaDataAchievedCounts = goalsData.map(
        (goal) => goal.achievedCount
      );
      const areaDataAchievements = goalsData.map((goal) => goal.achievement);
      const areaDataDifference = areaDataAchievedCounts.map(
        (count, index) => count - areaDataAchievements[index]
      );

      const areaOptions = {
        series: [
          {
            name: "Achieved Count",
            data: areaDataAchievedCounts,
          },
          {
            name: "Target (Achievement)",
            data: areaDataAchievements,
          },
          {
            name: "Difference (Achieved Count - Target)",
            data: areaDataDifference,
          },
        ],
        chart: {
          height: 600,
          type: "area",
        },
        stroke: {
          curve: "smooth",
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: "light",
            type: "vertical",
            opacityFrom: 0.6,
            opacityTo: 0.2,
          },
        },
        xaxis: {
          categories: goalsData.map((goal) => goal.goalType),
        },
        yaxis: {
          title: {
            text: "Counts",
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
        },
      };

      const areaElement = document.querySelector("#area-chart");
      if (areaElement) {
        const areaChart = new ApexCharts(areaElement, areaOptions);
        areaChart.render();

        return () => {
          areaChart.destroy();
        };
      }
    }
  }, [selectChart, goalsData]);

  return (
    <div>
      {selectChart === "Line & Bar" ? (
        <div id="chart" style={{ width: "100%", height: "600px" }} />
      ) : (
        <div id="area-chart" style={{ width: "100%", height: "600px" }} />
      )}
    </div>
  );
}
