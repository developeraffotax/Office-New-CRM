// import { addMonths, format, isAfter, startOfMonth, startOfQuarter, subMonths } from "date-fns";
// import React, { useEffect } from "react";
// import ApexCharts from "apexcharts";

// const ClientFeeChart = ({
//     uniqueClients,
//     setFilteredUniqueClient ,
//     featureFilter,
//     selectChart,
//     selectedDepartment,

// }) => {


    
    
//     const getMonthsBackFromFilter = (filter) => {
//       switch (filter) {
//         case "This Month":
//           return 0;
//         case "This Quarter":
//           return 2;
//         case "Last 6 Months":
//           return 5;
//         case "Last 12 Months":
//           return 11;
//         default:
//           return 11;
//       }
//     };
    
    
//     const getAllMonthsInRange = (monthsBack = 12) => {
//       const now = new Date();
//       const start = subMonths(now, monthsBack);
//       const months = [];
    
//       for (let i = 0; i <= monthsBack; i++) {
//         const current = addMonths(start, i);
//         months.push(format(current, "MMM yyyy"));
//       }
    
//       return months;
//     };
    
    
//     const buildChartCategories = (filteredDataArray = [], featureFilter = "") => {
//       const monthsBack = getMonthsBackFromFilter(featureFilter);
//       return getAllMonthsInRange(monthsBack);
//     };
    
//     const buildChartSeries = (filteredDataArray = [], featureFilter = "") => {
//       const monthsBack = getMonthsBackFromFilter(featureFilter);
//       const allMonths = getAllMonthsInRange(monthsBack);
//       const monthCounts = {};
    
//       filteredDataArray.forEach((item) => {
//         const date = new Date(item.currentDate);
//         const month = format(date, "MMM yyyy");
        
//         const fee = parseFloat(item.fee || 0);

//         if (!monthCounts[month]) {
//           monthCounts[month] = 0;
//         }
    
//         monthCounts[month] += fee;
//       });
      
//       console.log("monthCounts:", monthCounts);

//       const seriesData = allMonths.map((month) => monthCounts[month] || 0);
    
//       return [
//         {
//           name: "Number of Jobs",
//           data: seriesData,
//         },
//       ];
//     };
    
    
    
    
    
    
    
//       // Render charts
//       useEffect(() => {
//         // Job Count Chart  
    
    
//             const now = new Date();
          
//             let filteredData = [];
          
//             switch (featureFilter) {
//               case "This Month":
//                 filteredData = uniqueClients.filter((item) =>
//                   isAfter(new Date(item.currentDate), startOfMonth(now))
//                 );
//                 break;
          
//               case "This Quarter":
//                 filteredData = uniqueClients.filter((item) =>
//                   isAfter(new Date(item.currentDate), startOfQuarter(now))
//                 );
//                 break;
          
//               case "Last 6 Months":
//                 filteredData = uniqueClients.filter((item) =>
//                   isAfter(new Date(item.currentDate), subMonths(now, 5))
//                 );
//                 break;
          
//               case "Last 12 Months":
//                 filteredData = uniqueClients.filter((item) =>
//                   isAfter(new Date(item.currentDate), subMonths(now, 11))
//                 );
//                 break;
          
//               default:
//                 filteredData = uniqueClients;
//             }
            
//                   // Then filter by selected department (optional)
//             if (selectedDepartment) {
//               filteredData = filteredData.filter(
//                 (item) =>
//                   item.jobName === selectedDepartment
//               );
//             }
            
//             setFilteredUniqueClient(filteredData);
             
    
    
    
       
//       //    const series = buildChartSeries(filteredData);
//       // const categories = buildChartCategories(filteredData);
    
     
            
    
    
    
    
//          const series = buildChartSeries(filteredData, featureFilter);
//     const categories = buildChartCategories(filteredData, featureFilter);
    
//         console.log("series:", series);
//          console.log("categories:", categories);
        
    
//         const jobCountChartOptions = {
//           series: series ,
//           chart: { type: selectChart, height: 300 },
//           xaxis: { categories: categories, title: { text: "Month." } },
//           yaxis: { title: { text: "Total Fee" } },
//           plotOptions:
//           selectChart === "bar"
//             ? { bar: { columnWidth: featureFilter === "This Month" ? "10%" : featureFilter ===  "This Quarter" ? "20%" : featureFilter ===  "Last 6 Months" ? "30%" : "50%"  } }
//             : {},
//           colors: ["#FF5733", "#33FF57", "#3357FF"],
          
//         };
    
//         const jobCountChartElement = document.querySelector("#apex-fee-chart-feature-filter");
//         if (jobCountChartElement) {
//           const jobCountChart = new ApexCharts(
//             jobCountChartElement,
//             jobCountChartOptions
//           );
//           jobCountChart.render();
//           return () => jobCountChart.destroy();
//         }
    
//         // eslint-disable-next-line
//       }, [selectChart, featureFilter, selectedDepartment]);
    
    
    
    
    
    


//   return <div id="apex-fee-chart-feature-filter" />
// };

// export default ClientFeeChart;
