// helpers/chartUtils.js
import ApexCharts from "apexcharts";

export function renderChart({
  selector,
  series,
  seriesForPastYear,
  months,
  chartType,
  yAxisTitle,
  selectedYear,
  selectedMonth,
  colors,
}) {
  const finalSeries = selectedYear ? series : seriesForPastYear;

  const options = {
    series: finalSeries,
    chart: { type: chartType, height: 300 },
    xaxis: { categories: months, title: { text: "Month" } },
    yaxis: { title: { text: yAxisTitle } },
    plotOptions:
      chartType === "bar"
        ? {
            bar: {
              columnWidth: `${selectedMonth ? "10%" : "40%"}`,
              borderRadius: 5,
            },
          }
        : {},
    colors,
  };

  const element = document.querySelector(selector);
  if (element) {
    const chart = new ApexCharts(element, options);
    chart.render();
    return () => chart.destroy();
  }
}
