import React, { useEffect, useLayoutEffect, useState } from "react";
import ApexCharts from "apexcharts";
import Loader from "../../utlis/Loader";
import { style } from "../../utlis/CommonStyle";
import JobSourcePieChart from "./ClientSourceChart";
import JobSourceClientPartnerDonutCharts from "./ClientpartnerChart";
import { FiUsers, FiDollarSign, FiLayers } from "react-icons/fi";
import {
  getLastTwelveMonths,
  getLastTwelveMonthsWithLabels,
  shiftArrFromThisMonth,
} from "./utils";
import JobCountChart from "./charts/JobCountChart";
import ClientFeeChart from "./charts/ClientFeeChart";
import StatCard from "./StatCard";
import { SummaryCard } from "./SummaryCard";
import { buildDateFilter, buildJobFilter, fillMissingMonths, monthOrder, sortMonths } from "./helpers/filters";
import { aggregateJobs, aggregateLeads, buildSeries } from "./helpers/aggregators";
import { renderChart } from "./helpers/chartUtils";

export default function Clients({
  selectedMonth,
  selectedYear,
  selectedSource,
  selectedClient,
  selectedPartner,
  selectedDepartment,
  workFlowData,
  uniqueClients,
  loading,
  search,
  userData,
  isClients,
  salesData,

  featureFilter,
}) {
  const [clients, setClients] = useState([]);

  console.log("Sales DATA💙", salesData);

  const [clientsForPastMonthOrYear, setClientsForPastMonthOrYear] = useState(
    []
  );
    const [feeForComparison, setFeeForComparison] = useState("");
     const [filterWorkFlowForComparison, setFilterWorkFlowForComparison] = useState([]);

       const [filterUniqueClientForComparison, setFilteredUniqueClientForComparison] = useState([]);

         const [activeClientsForComparison, setActiveClientsForComparison] = useState({
    totalFee: "0",
    totalClients: "0",
  });


  const [fee, setFee] = useState("");
  const [selectChart, setSelectChart] = useState("bar");
  const [filterWorkFlow, setFilterWorkFlow] = useState([]);
  const [filterUniqueClient, setFilteredUniqueClient] = useState([]);
  const [activeClientJobs, setActiveClientJobs] = useState([]);
  const [activeClients, setActiveClients] = useState({
    totalFee: "0",
    totalClients: "0",
  });

  

  const [lead_source_labels, set_lead_source_labels] = useState([
    "Upwork",
    "Fiverr",
    "PPH",
    "Referral",
    "Partner",
    "Google",
    "Facebook",
    "LinkedIn",
    "CRM",
    "Existing",
    "Other",
  ]);

  const [filtered_leads, set_filtered_leads] = useState([]);

  // Visibility Div
  const initialState = [true, true, true, true, true, true, true, true];
  const [visibility, setVisibility] = useState(() => {
    const savedState = localStorage.getItem("clients");
    return savedState ? JSON.parse(savedState) : initialState;
  });
  useEffect(() => {
    localStorage.setItem("clients", JSON.stringify(visibility));
  }, [visibility]);

  const toggleVisibility = (index) => {
    const updatedVisibility = [...visibility];
    updatedVisibility[index] = !updatedVisibility[index];
    setVisibility(updatedVisibility);
  };

  const visibleCount = visibility.filter(Boolean).length;

  // Dynamically set grid classes based on visible divs
  const getGridClasses = () => {
    if (visibleCount === 1) return "grid grid-cols-1";
    return "grid grid-cols-1 sm:grid-cols-2  items-start ";
  };

  const departments = [
    "Bookkeeping",
    "Payroll",
    "Vat Return",
    "Personal Tax",
    "Accounts",
    "Company Sec",
    "Address",
  ];

  // ---------Filter Unique Clients------>
  useEffect(() => {


 

    const filteredData = uniqueClients?.filter((item) => {
      const createdAtDate = new Date(item.currentDate);
      const itemMonth = createdAtDate.getMonth() + 1;
      const itemYear = createdAtDate.getFullYear();

      const today = new Date();
      const pastDate = new Date();
      if (search && !isNaN(search) && search >= 1) {
        pastDate.setDate(today.getDate() - parseInt(search));
      }

     


        if (!selectedYear && !selectedMonth) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0 = Jan, 11 = Dec

        const startDate = new Date(currentYear, currentMonth - 11, 1); // First day of the month 11 months ago

        const jobDate = new Date(item.currentDate);


        return jobDate >= startDate && jobDate <= now;
      }


         let matchesDateFilter = true;
      let matchesSearchFilter = true;
      // Filter by selected month and year
      if (selectedMonth && selectedYear) {
        matchesDateFilter =
          itemMonth === parseInt(selectedMonth) &&
          itemYear === parseInt(selectedYear);
      } else if (selectedMonth) {
        matchesDateFilter = itemMonth === parseInt(selectedMonth);
      } else if (selectedYear) {
        matchesDateFilter = itemYear === parseInt(selectedYear);
      }

      matchesSearchFilter =
        !search || (createdAtDate >= pastDate && createdAtDate <= today);

      return matchesDateFilter && matchesSearchFilter;
    });

 

    setFilteredUniqueClient(filteredData);
  }, [selectedMonth, selectedYear, uniqueClients, search]);
















    // ---------Filter Unique Clients FOR COMAPRISON------>
  useEffect(() => {
    const filteredData = uniqueClients?.filter((item) => {
      const createdAtDate = new Date(item.currentDate);
      const itemMonth = createdAtDate.getMonth() + 1;
      const itemYear = createdAtDate.getFullYear();

      const today = new Date();
      const pastDate = new Date();
       const doublePastDate = new Date();

      if (search && !isNaN(search) && search >= 1) {
        pastDate.setDate(today.getDate() - parseInt(search));


       

        pastDate.setDate(today.getDate() - search);
        doublePastDate.setDate(today.getDate() - search * 2);
      }



































if (!selectedYear && !selectedMonth) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0 = Jan, 11 = Dec

        // Start of current 12-month window
        const currentStartDate = new Date(currentYear, currentMonth - 11, 1);

        // Previous year's start and end
        const prevYearStart = new Date(
          currentStartDate.getFullYear(),
          currentStartDate.getMonth() - 12,
          1
        );
        const prevYearEnd = new Date(
          currentStartDate.getFullYear(),
          currentStartDate.getMonth(),
          0
        ); // Last day before currentStartDate
        const jobDate = new Date(item.currentDate);

        return jobDate >= prevYearStart && jobDate <= prevYearEnd;
      }


























      let matchesDateFilter = true;
      let matchesSearchFilter = true;

      // Filter by selected month and year
      if (selectedMonth && selectedYear) {
        matchesDateFilter =
          itemMonth === parseInt(selectedMonth) -1 &&
          itemYear === parseInt(selectedYear);
      } else if (selectedMonth) {
        matchesDateFilter = itemMonth === parseInt(selectedMonth) - 1; // Adjusted for past month comparison
      } else if (selectedYear) {
        matchesDateFilter = itemYear === parseInt(selectedYear) - 1; // Adjusted for past year comparison
      }

      matchesSearchFilter =
        !search || (createdAtDate >= doublePastDate && createdAtDate <= pastDate);

      return matchesDateFilter && matchesSearchFilter;
    });

 

    setFilteredUniqueClientForComparison(filteredData);
  }, [selectedMonth, selectedYear, uniqueClients, search]);

  //------------ Department wise Total-------->
  // useEffect(() => {
  //   const departmentTotals = departments.map((department) => {
  //     // Filter jobs by department
  //     const departmentJobs = workFlowData.filter(
  //       (job) => job.job.jobName === department
  //     );

  //     // Calculate total hours, fees, and job count for the department
  //     const totalHours = departmentJobs
  //       .reduce((sum, job) => sum + parseFloat(job.totalHours || 0), 0)
  //       .toFixed(2);
  //     const totalFee = departmentJobs.reduce(
  //       (sum, job) => sum + parseFloat(job.fee || 0),
  //       0
  //     );
  //     const totalDepartmentCount = departmentJobs?.length;

  //     // Calculate lead-wise totals and job counts
  //     const leadWiseTotals = departmentJobs.reduce((acc, job) => {
  //       const lead = job.job.lead;
  //       if (!acc[lead]) {
  //         acc[lead] = { totalHours: 0, totalFee: 0, departmentCount: 0 };
  //       }
  //       acc[lead].totalHours += parseFloat(job.totalHours || 0);
  //       acc[lead].totalFee += parseFloat(job.fee || 0);
  //       acc[lead].departmentCount += 1;
  //       return acc;
  //     }, {});

  //     return {
  //       department,
  //       totalHours,
  //       totalFee,
  //       totalDepartmentCount,
  //       leadWiseTotals,
  //     };
  //   });

  //   setClients(departmentTotals);

  //   // eslint-disable-next-line
  // }, [workFlowData]);

  // console.log("workFlowData:", workFlowData);

  useEffect(() => {
    const departmentTotals = departments.map((department) => {
      // Filter jobs by department
      const departmentJobs = workFlowData.filter(
        (job) => job.job.jobName === department
      );

      // Get current month and last month data
      const currentMonthJobs = departmentJobs.filter((job) => {
        const jobDate = new Date(job.currentDate);
        const currentDate = new Date();
        return (
          jobDate.getMonth() === currentDate.getMonth() &&
          jobDate.getFullYear() === currentDate.getFullYear()
        );
      });

      const lastMonthJobs = departmentJobs.filter((job) => {
        const jobDate = new Date(job.currentDate);
        const currentDate = new Date();
        const lastMonth =
          currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
        const lastMonthYear =
          currentDate.getMonth() === 0
            ? currentDate.getFullYear() - 1
            : currentDate.getFullYear();
        return (
          jobDate.getMonth() === lastMonth &&
          jobDate.getFullYear() === lastMonthYear
        );
      });

      // Calculate total hours, fees, and job count for the current and last month
      const currentMonthFee = currentMonthJobs.reduce(
        (sum, job) => sum + parseFloat(job.fee || 0),
        0
      );
      const lastMonthFee = lastMonthJobs.reduce(
        (sum, job) => sum + parseFloat(job.fee || 0),
        0
      );

      const currentMonthCount = currentMonthJobs.length;
      const lastMonthCount = lastMonthJobs.length;

      // Calculate percentage change for total fee and department count
      const feePercentageChange =
        lastMonthFee === 0
          ? currentMonthFee > 0
            ? "+100.00"
            : "0.00"
          : (((currentMonthFee - lastMonthFee) / lastMonthFee) * 100).toFixed(
              0
            );

      const countPercentageChange =
        lastMonthCount === 0
          ? currentMonthCount > 0
            ? "+100.00"
            : "0.00"
          : (
              ((currentMonthCount - lastMonthCount) / lastMonthCount) *
              100
            ).toFixed(0);

      // Add + or - sign to percentages
      const formattedFeeChange =
        feePercentageChange > 0
          ? `+${feePercentageChange}%`
          : `${feePercentageChange}%`;

      const formattedCountChange =
        countPercentageChange > 0
          ? `+${countPercentageChange}%`
          : `${countPercentageChange}%`;

      const totalHours = departmentJobs
        .reduce((sum, job) => sum + parseFloat(job.totalHours || 0), 0)
        .toFixed(2);
      const totalFee = departmentJobs.reduce(
        (sum, job) => sum + parseFloat(job.fee || 0),
        0
      );
      const totalDepartmentCount = departmentJobs?.length;

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
        feePercentageChange: formattedFeeChange,
        countPercentageChange: formattedCountChange,
        leadWiseTotals,
      };
    });

    setClients(departmentTotals);
  }, [workFlowData]);

  // Active Clients Total
  useEffect(() => {
    const filteredJobs = filterWorkFlow.filter(
      (job) => job.activeClient === "active"
    );

    // Calculate total fee
    const totalFee = filteredJobs
      .reduce((sum, job) => sum + parseFloat(job.fee || 0), 0)
      .toFixed(0);

    // Count total clients
    const totalClients = filteredJobs.length;

    // Set state
    setActiveClientJobs(filteredJobs);
    setActiveClients({
      totalFee: totalFee,
      totalClients: totalClients.toString(),
    });
  }, [workFlowData, filterWorkFlow]);




  // Active Clients Total for comparison
  useEffect(() => {
    const filteredJobs = filterWorkFlowForComparison.filter(
      (job) => job.activeClient === "active"
    );

    // Calculate total fee
    const totalFee = filteredJobs
      .reduce((sum, job) => sum + parseFloat(job.fee || 0), 0)
      .toFixed(0);

    // Count total clients
    const totalClients = filteredJobs.length;

    // Set state
    // setActiveClientJobs(filteredJobs);
    setActiveClientsForComparison({
      totalFee: totalFee,
      totalClients: totalClients.toString(),
    });
  }, [workFlowData, filterWorkFlow]);

















  // ------------Total Fee-------->
  useEffect(() => {
    const calculateTotalFee = (data) => {
      return data.reduce((sum, client) => sum + Number(client.totalFee), 0);
    };

    setFee(calculateTotalFee(clients).toFixed(0));
    setFeeForComparison(calculateTotalFee(clientsForPastMonthOrYear).toFixed(0));
  }, [clients]);

  // --Render Lead Source Chart(#888)------->
  // useEffect(() => {

  //   const now = new Date();
  //   const currentYear = now.getFullYear();
  //   const currentMonth = now.getMonth(); // 0 = Jan, 11 = Dec

  //   const startDate = new Date(currentYear, currentMonth - 11, 1);

  //   const filteredLeads = salesData?.totalLeads?.filter((lead) => {
  //      // Lead Date
  //     const leadDate = new Date(lead.createdAt);
  //     const leadMonth = leadDate.getMonth() + 1;
  //     const leadYear = leadDate.getFullYear();

  //      if(!selectedYear) {
  //     const leadDateN = new Date(leadYear, leadMonth - 1, 1); // month -1 because JS months are 0-indexed
  //     return (
  //       (!selectedMonth || leadMonth === parseInt(selectedMonth)) &&
  //       (leadDateN >= startDate && leadDateN <= now)

  //     )

  //   }

  //     return  (!selectedMonth || leadMonth === parseInt(selectedMonth)) && (!selectedYear || leadYear === parseInt(selectedYear))

  //   })

  //   console.log("filteredLeads💙💙💙", filteredLeads)

  //   // Count how many leads are in each source
  //   // const leadSourceCounts = lead_source_labels.map(label => {
  //   //   // if (label === "Other") {
  //   //   //   return filteredLeads.filter(lead => !lead_source_labels.includes(lead.lead_Source)).length;
  //   //   // }
  //   //   return filteredLeads?.filter(lead => lead.lead_Source === label).length || 0;
  //   // });

  //   const leadSourceCounts2 = lead_source_labels.map(label => {

  //     let countObject = {}

  //     const count = filteredLeads?.filter(lead => lead.lead_Source === label).length || 0;

  //     countObject.label = label;
  //     countObject.count = count;

  //     return countObject;

  //   });

  //     const f  = [{label: "AAAA", count: 2}]

  //       set_filtered_leads(leadSourceCounts2);

  //   console.log("leadSourceCounts2💙💙💙", leadSourceCounts2)

  //   // const newleadSourceCounts = lead_source_labels.map((label) => {

  //   //   let countObject = filteredLeads?.reduce((acc, lead) => {
  //   //     if (lead.lead_Source === label) {
  //   //       acc.count += 1;
  //   //     }

  //   // const optionsCount = {
  //   //   series: [{ name: "Leads", data: leadSourceCounts }],
  //   //   chart: { type: selectChart, height: 300 },
  //   //   plotOptions: {
  //   //     bar: { columnWidth: "50%", borderRadius: 5 },
  //   //   },
  //   //   xaxis: { categories: lead_source_labels, title: { text: "Source" } },
  //   //   yaxis: { title: { text: "Leads" } },
  //   //   colors: [ "#6C757D" ]
  //   // };

  //   // const chartElementCount = document.querySelector("#lead-source-chart");
  //   // if (chartElementCount) {
  //   //   const chartCount = new ApexCharts(chartElementCount, optionsCount);
  //   //   chartCount.render();
  //   //   return () => chartCount.destroy();
  //   // }
  // }, [selectedYear, selectedMonth, selectChart, salesData, lead_source_labels, clients, ]);

  // --Render Department Count Chart(#3)------->
  useEffect(() => {
    const departmentCounts = clients.map(
      (client) => client.totalDepartmentCount
    );
    const departmentLabels = clients.map((client) => client.department);

    const optionsCount = {
      series: [{ name: "Total Count", data: departmentCounts }],
      chart: { type: selectChart, height: 300 },
      plotOptions: {
        bar: { columnWidth: "50%", borderRadius: 5 },
      },
      xaxis: { categories: departmentLabels, title: { text: "Department" } },
      yaxis: { title: { text: "Total Count" } },
      colors: ["#059669", "#FF5733", "#33FF57", "#3357FF"],
    };

    const chartElementCount = document.querySelector("#department-count-chart");
    if (chartElementCount) {
      const chartCount = new ApexCharts(chartElementCount, optionsCount);
      chartCount.render();
      return () => chartCount.destroy();
    }
  }, [clients, selectChart, salesData]);

  // ---------Render Department Fee Chart(#4)---------
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
        type: selectChart,
        height: 300,
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
  }, [clients, selectChart, salesData]);

  // -------Filter By Depertment--------------

  // -------Filter By Depertment--------------

  useEffect(() => {
    const filterData = () => {
      let filteredData = [...workFlowData];

      // Filter by department
      if (selectedDepartment) {
        filteredData = filteredData.filter(
          (job) => job.job.jobName === selectedDepartment
        );
      }

      if (!selectedYear && !selectedMonth) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0 = Jan, 11 = Dec

        // Start of current 12-month window
        const currentStartDate = new Date(currentYear, currentMonth - 11, 1);

        // Previous year's start and end
        const prevYearStart = new Date(
          currentStartDate.getFullYear(),
          currentStartDate.getMonth() - 12,
          1
        );
        const prevYearEnd = new Date(
          currentStartDate.getFullYear(),
          currentStartDate.getMonth(),
          0
        ); // Last day before currentStartDate

        filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.currentDate);

          return jobDate >= prevYearStart && jobDate <= prevYearEnd;
        });
      }

      // Filter by month and year
      if (selectedMonth && selectedYear) {
        filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.currentDate);
          const jobMonth = jobDate.getMonth() + 1;
          const jobYear = jobDate.getFullYear();

          return (
            jobMonth === parseInt(selectedMonth) - 1 &&
            jobYear === parseInt(selectedYear)
          );
        });
      } else if (selectedMonth) {
        filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.currentDate);
          const jobMonth = jobDate.getMonth() + 1;
          return jobMonth === parseInt(selectedMonth) - 1;
        });
      } else if (selectedYear) {
        filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.currentDate);
          const jobYear = jobDate.getFullYear();
          return jobYear === parseInt(selectedYear) - 1;
        });
      }
      // Filter by month and year
      if (search && search >= 1) {
        const today = new Date();
        const pastDate = new Date();

        const doublePastDate = new Date();

        pastDate.setDate(today.getDate() - search);
        doublePastDate.setDate(today.getDate() - search * 2);

        filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.currentDate);
          return jobDate >= doublePastDate && jobDate <= pastDate;
        });
      }

      return filteredData;
    };

   

    setFilterWorkFlowForComparison(filterData);

 

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

    setClientsForPastMonthOrYear(departmentTotals);
    // eslint-disable-next-line
  }, [workFlowData, selectedDepartment, selectedMonth, selectedYear, search]);

 

  useEffect(() => {
    const filterData = () => {
      let filteredData = [...workFlowData];

      // Filter by department
      if (selectedDepartment) {
        filteredData = filteredData.filter(
          (job) => job.job.jobName === selectedDepartment
        );
      }

      if (!selectedYear && !selectedMonth) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0 = Jan, 11 = Dec

        const startDate = new Date(currentYear, currentMonth - 11, 1); // First day of the month 11 months ago

        filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.currentDate);

          return jobDate >= startDate && jobDate <= now;
        });
      }

      // Filter by month and year
      if (selectedMonth && selectedYear) {
        filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.currentDate);
          const jobMonth = jobDate.getMonth() + 1;
          const jobYear = jobDate.getFullYear();

          return (
            jobMonth === parseInt(selectedMonth) &&
            jobYear === parseInt(selectedYear)
          );
        });
      } else if (selectedMonth) {
        filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.currentDate);
          const jobMonth = jobDate.getMonth() + 1;
          return jobMonth === parseInt(selectedMonth);
        });
      } else if (selectedYear) {
        filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.currentDate);
          const jobYear = jobDate.getFullYear();
          return jobYear === parseInt(selectedYear);
        });
      }
      // Filter by month and year
      if (search && search >= 1) {
        const today = new Date();
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - search);

        filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.currentDate);
          return jobDate >= pastDate && jobDate <= today;
        });
      }

      return filteredData;
    };

 

    setFilterWorkFlow(filterData);

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
  }, [workFlowData, selectedDepartment, selectedMonth, selectedYear, search]);
  // useEffect(() => {
  //   const calculatePercentageChange = (current, previous) => {
  //     if (previous === 0) {
  //       return current > 0 ? "+100%" : "0%";
  //     }
  //     const change = (((current - previous) / previous) * 100).toFixed(0);
  //     return `${change > 0 ? "+" : ""}${change}%`;
  //   };

  //   // Function to filter data based on department, month, and year,   last days like(20) search
  //   const filterData = () => {
  //     let filteredData = [...workFlowData];

  //     // Filter by department
  //     if (selectedDepartment) {
  //       filteredData = filteredData.filter(
  //         (job) => job.job.jobName === selectedDepartment
  //       );
  //     }

  //     // Filter by month and year
  //     if (selectedMonth && selectedYear) {
  //       filteredData = filteredData.filter((job) => {
  //         const jobDate = new Date(job.currentDate);
  //         const jobMonth = jobDate.getMonth() + 1;
  //         const jobYear = jobDate.getFullYear();
  //         return (
  //           jobMonth === parseInt(selectedMonth) &&
  //           jobYear === parseInt(selectedYear)
  //         );
  //       });
  //     } else if (selectedMonth) {
  //       filteredData = filteredData.filter((job) => {
  //         const jobDate = new Date(job.currentDate);
  //         const jobMonth = jobDate.getMonth() + 1;
  //         return jobMonth === parseInt(selectedMonth);
  //       });
  //     } else if (selectedYear) {
  //       filteredData = filteredData.filter((job) => {
  //         const jobDate = new Date(job.currentDate);
  //         const jobYear = jobDate.getFullYear();
  //         return jobYear === parseInt(selectedYear);
  //       });
  //     }

  //     if (search && search >= 1) {
  //       const today = new Date();
  //       const pastDate = new Date();
  //       pastDate.setDate(today.getDate() - search);

  //       filteredData = filteredData.filter((job) => {
  //         const jobDate = new Date(job.currentDate);
  //         return jobDate >= pastDate && jobDate <= today;
  //       });
  //     }

  //     return filteredData;
  //   };

  //   // Filtered workflow data
  //   const filteredWorkFlow = filterData();
  //   setFilterWorkFlow(filteredWorkFlow);

  //   // Calculate department totals and percentage changes
  //   const departmentTotals = departments.map((department) => {
  //     // Filter jobs for the department
  //     const departmentJobs = filteredWorkFlow.filter(
  //       (job) => job.job.jobName === department
  //     );

  //     // Calculate total hours, fees, and job count
  //     const totalHours = departmentJobs
  //       .reduce((sum, job) => sum + parseFloat(job.totalHours || 0), 0)
  //       .toFixed(2);

  //     const totalFee = departmentJobs.reduce(
  //       (sum, job) => sum + parseFloat(job.fee || 0),
  //       0
  //     );

  //     const totalDepartmentCount = departmentJobs.length;

  //     // Current and last month/year jobs
  //     const currentDate = new Date();
  //     const currentMonthJobs = departmentJobs.filter((job) => {
  //       const jobDate = new Date(job.currentDate);
  //       return (
  //         jobDate.getMonth() === currentDate.getMonth() &&
  //         jobDate.getFullYear() === currentDate.getFullYear()
  //       );
  //     });

  //     const lastMonthJobs = departmentJobs.filter((job) => {
  //       const jobDate = new Date(job.currentDate);
  //       const lastMonth =
  //         currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
  //       const lastMonthYear =
  //         currentDate.getMonth() === 0
  //           ? currentDate.getFullYear() - 1
  //           : currentDate.getFullYear();
  //       return (
  //         jobDate.getMonth() === lastMonth &&
  //         jobDate.getFullYear() === lastMonthYear
  //       );
  //     });

  //     const currentYearJobs = departmentJobs.filter((job) => {
  //       const jobDate = new Date(job.currentDate);
  //       return jobDate.getFullYear() === currentDate.getFullYear();
  //     });

  //     const lastYearJobs = departmentJobs.filter((job) => {
  //       const jobDate = new Date(job.currentDate);
  //       return jobDate.getFullYear() === currentDate.getFullYear() - 1;
  //     });

  //     // Calculate current and previous totals based on filters
  //     const currentTotal =
  //       selectedMonth || selectedYear
  //         ? currentMonthJobs.reduce(
  //             (sum, job) => sum + parseFloat(job.fee || 0),
  //             0
  //           )
  //         : currentYearJobs.reduce(
  //             (sum, job) => sum + parseFloat(job.fee || 0),
  //             0
  //           );

  //     const previousTotal =
  //       selectedMonth || selectedYear
  //         ? lastMonthJobs.reduce(
  //             (sum, job) => sum + parseFloat(job.fee || 0),
  //             0
  //           )
  //         : lastYearJobs.reduce(
  //             (sum, job) => sum + parseFloat(job.fee || 0),
  //             0
  //           );

  //     const percentageChange = calculatePercentageChange(
  //       currentTotal,
  //       previousTotal
  //     );

  //     // Lead-wise totals and job counts
  //     const leadWiseTotals = departmentJobs.reduce((acc, job) => {
  //       const lead = job.job.lead;
  //       if (!acc[lead]) {
  //         acc[lead] = { totalHours: 0, totalFee: 0, departmentCount: 0 };
  //       }
  //       acc[lead].totalHours += parseFloat(job.totalHours || 0);
  //       acc[lead].totalFee += parseFloat(job.fee || 0);
  //       acc[lead].departmentCount += 1;
  //       return acc;
  //     }, {});

  //     return {
  //       department,
  //       totalHours,
  //       totalFee,
  //       totalDepartmentCount,
  //       leadWiseTotals,
  //       percentageChange,
  //     };
  //   });

  //   setClients(departmentTotals);
  //   // eslint-disable-next-line
  // }, [workFlowData, selectedDepartment, selectedMonth, selectedYear, search]);

  //------------------------ Filter Data By Depertment || Month || Year || Source || Client Type------>
  // const filterData = uniqueClients.filter((job) => {
  //   const jobDate = new Date(job.currentDate);
  //   const jobMonth = jobDate.getMonth() + 1;
  //   const jobYear = jobDate.getFullYear();

  //   const today = new Date();
  //   const pastDate = new Date();
  //   if (search && search >= 1) {
  //     pastDate.setDate(today.getDate() - search);
  //   }

  //   const matchesSearch = !search || (jobDate >= pastDate && jobDate <= today);

  //   return (
  //     (!selectedMonth || jobMonth === parseInt(selectedMonth)) &&
  //     (!selectedYear || jobYear === parseInt(selectedYear)) &&
  //     (!selectedSource || job.source === selectedSource) &&
  //     (!selectedClient || job.clientType === selectedClient) &&
  //     (!selectedPartner || job.partner === selectedPartner) &&
  //     (!selectedDepartment || job.jobName === selectedDepartment) &&
  //     matchesSearch
  //   );
  // });
  // console.log("UNIQUE CLIENTS>>>", uniqueClients)
const now = new Date();
const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

const jobFilterFn = buildJobFilter({ search, selectedMonth, selectedYear, startDate, now, selectedSource, selectedClient, selectedPartner, selectedDepartment, });
const filteredJobs = uniqueClients.filter(jobFilterFn);

// Aggregate jobs
const monthData = aggregateJobs(filteredJobs);
let months = Object.keys(monthData).sort(sortMonths);

// Filter leads
const leadFilterFn = buildDateFilter({ search, selectedMonth, selectedYear, startDate, now });
const filteredLeads = salesData?.totalLeads?.filter(lead => leadFilterFn(new Date(lead.createdAt))) || [];

// Aggregate leads
const leadsMonthData = aggregateLeads(filteredLeads);

const filledLeadsMonthData = fillMissingMonths(leadsMonthData)

let monthsForLeadsArr = Object.keys(filledLeadsMonthData).sort(sortMonths);





// Build chart series
const jobCountSeries = buildSeries(monthData, months, "Total Jobs");
const feeSeries = buildSeries(monthData, months, "Total Fee");
const totalLeadCountSeries = buildSeries(leadsMonthData, monthsForLeadsArr, "Total Leads");

console.log("jobCountSeries", jobCountSeries);
console.log("feeSeries", feeSeries);
console.log("totalLeadCountSeries", totalLeadCountSeries);
 


 




useEffect(() => {
  const jobCountSeriesForPastOneYear = [];
  if (!selectedYear) {
    months = getLastTwelveMonthsWithLabels();
    const rotatedArr = shiftArrFromThisMonth([...jobCountSeries[0].data]);
    jobCountSeriesForPastOneYear.push({ name: "Total Jobs", data: rotatedArr });
  }

  return renderChart({
    selector: "#apex-jobCount-chart",
    series: jobCountSeries,
    seriesForPastYear: jobCountSeriesForPastOneYear,
    months,
    chartType: selectChart,
    yAxisTitle: "Total Jobs",
    selectedYear,
    selectedMonth,
    
  });
}, [selectChart, months, jobCountSeries]);







useEffect(() => {
  const totalLeadCountSeriesForPastOneYear = [];
  if (!selectedYear) {
    monthsForLeadsArr = getLastTwelveMonthsWithLabels();
    const rotatedArr = shiftArrFromThisMonth([...totalLeadCountSeries[0].data]);
    totalLeadCountSeriesForPastOneYear.push({
      name: "Total Leads",
      data: rotatedArr,
    });
  }

  return renderChart({
    selector: "#apex-total-leads-chart",
    series: totalLeadCountSeries,
    seriesForPastYear: totalLeadCountSeriesForPastOneYear,
    months: monthsForLeadsArr,
    chartType: selectChart,
    yAxisTitle: "Total Leads",
    selectedYear,
    selectedMonth,
    colors: ["#A86523", ], // optional
  });
}, [selectChart, months, totalLeadCountSeries]);
























useEffect(() => {
  const FeeSeriesForPastOneYear = [];
  if (!selectedYear) {
    months = getLastTwelveMonthsWithLabels();
    const rotatedArr = shiftArrFromThisMonth([...feeSeries[0].data]);
    FeeSeriesForPastOneYear.push({ name: "Total Fee", data: rotatedArr });
  }

  return renderChart({
    selector: "#apex-fee-chart",
    series: feeSeries,
    seriesForPastYear: FeeSeriesForPastOneYear,
    months,
    chartType: selectChart,
    yAxisTitle: "Total Fee",
    selectedYear,
    selectedMonth,
    colors: ["#FF5733", "#33FF57", "#3357FF"], // optional
  });
}, [selectChart, months, feeSeries]);


 





























  useLayoutEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startDate = new Date(currentYear, currentMonth - 11, 1);

    let filteredLeads = salesData?.totalLeads?.filter((lead) => {
      const leadDate = new Date(lead.createdAt);
      const leadMonth = leadDate.getMonth() + 1;
      const leadYear = leadDate.getFullYear();
      const leadDateN = new Date(leadYear, leadMonth - 1, 1);

      if (!selectedYear) {
        return (
          (!selectedMonth || leadMonth === parseInt(selectedMonth)) &&
          leadDateN >= startDate &&
          leadDateN <= now
        );
      }

      return (
        (!selectedMonth || leadMonth === parseInt(selectedMonth)) &&
        (!selectedYear || leadYear === parseInt(selectedYear))
      );
    });

    if (search) {
      filteredLeads = filteredLeads.filter((lead) => {
        const createdAtDate = new Date(lead.createdAt);

        const today = new Date();
        const pastDate = new Date();
        if (search && !isNaN(search) && search >= 1) {
          pastDate.setDate(today.getDate() - parseInt(search));
        }

        return createdAtDate >= pastDate && createdAtDate <= today;
      });
    }

    const leadSourceCounts2 = lead_source_labels.map((label) => ({
      label,
      count:
        filteredLeads?.filter((lead) => lead.lead_Source === label).length || 0,
    }));

    set_filtered_leads(leadSourceCounts2);

    // 👇 Render chart
    // const optionsCount = {
    //   series: [{
    //     name: "Leads",
    //     data: leadSourceCounts2.map(item => item.count),
    //   }],
    //   chart: { type: selectChart || "bar", height: 300 },
    //   plotOptions: {
    //     bar: { columnWidth: "50%", borderRadius: 5 },
    //   },
    //   xaxis: {
    //     categories: leadSourceCounts2.map(item => item.label),
    //     title: { text: "Source" },
    //   },
    //   yaxis: { title: { text: "Leads" } },
    //   colors: ["#6C757D"],
    // };

    // const chartElementCount = document.querySelector("#lead-source-chart");
    // if (chartElementCount) {
    //   const chartCount = new ApexCharts(chartElementCount, optionsCount);
    //   chartCount.render();
    //   return () => chartCount.destroy();
    // }
  }, [
    selectedYear,
    selectedMonth,
    selectChart,
    salesData,
    lead_source_labels,
    clients,
  ]);





  const getGradient = (department) => {
  return (
    {
      Bookkeeping: "from-orange-100 to-orange-300",
      Payroll: "from-pink-100 to-pink-300",
      "Vat Return": "from-purple-100 to-purple-300",
      "Personal Tax": "from-yellow-100 to-yellow-300",
      Accounts: "from-sky-100 to-sky-300",
      "Company Sec": "from-green-100 to-green-300",
    }[department] || "from-fuchsia-100 to-fuchsia-300"
  );
};




  return (
    <div className="w-full h-full relative">
      {isClients && (
        <div className=" absolute top-[-2rem] right-[6rem] sm:right-[18rem] z-30 flex flex-col flex-wrap gap-3 p-3 bg-white shadow-md rounded-lg w-[9rem]">
          {visibility.map((isVisible, index) => (
            <label
              key={index}
              className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg shadow-sm transition-all hover:bg-gray-200 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={isVisible}
                onChange={() => toggleVisibility(index)}
                className="cursor-pointer accent-orange-600 h-5 w-5 transition-all duration-300"
              />
              <span className="text-gray-700 font-medium text-sm">
                Show {index + 1}
              </span>
            </label>
          ))}
        </div>
      )}
      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-4 w-full  ">

























<div className="w-full overflow-x-auto">


  <div className=" w-full
      grid
      grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      lg:grid-cols-4
      xl:grid-cols-6
      2xl:grid-cols-8
      3xl:grid-cols-[repeat(13,_minmax(0,_1fr))]
      gap-4
      p-4
      scroll-smooth">
            <div className="w-full flex flex-col  items-start justify-start p-2 bg-gradient-to-br from-[#f0fdfa] via-[#d9f3ef] to-[#c2e9e2] border border-[#b0ded7] rounded-xl shadow hover:shadow-md transition-transform duration-300 transform hover:scale-[1.02]">
  <h2 className="text-base font-semibold text-[#065f46] uppercase tracking-wide mb-6 flex items-center gap-2">
    <FiLayers className="text-[#047857]" size={18} />
    Departments
  </h2>

  <div className="flex flex-col w-full gap-4 text-sm text-gray-700">
    <div className="flex items-center gap-2">
      <FiUsers className="text-gray-600" size={16} />
      <span className="font-semibold text-gray-800">Total Clients</span>
    </div>

    <div className="flex items-center gap-2">
      <FiDollarSign className="text-gray-600" size={16} />
      <span className="font-semibold text-gray-800">Total Fee</span>
    </div>
  </div>
</div>

            {clients?.map((job, index) => {
              
              return (
                <StatCard job={job} clientsForPastMonthOrYear={clientsForPastMonthOrYear}  />
              );
            })}
 
                <SummaryCard
                  title="Total"
                  value={filterWorkFlow ? filterWorkFlow.length : workFlowData?.length}
                  subValue={fee}
bg="bg-gradient-to-br from-[#e0f7f4] via-[#c0ece6] to-[#a0e1d9]"
border="border border-[#b5e6dd]"
text="text-[#05676e]"
                  prevValue={filterWorkFlowForComparison ? filterWorkFlowForComparison.length : workFlowData?.length}
                  prevSubValue={feeForComparison}
                />

                

                <SummaryCard
                  title="AU Total"
                  value={activeClients.totalClients}
                  subValue={activeClients.totalFee}
bg="bg-gradient-to-br from-[#e0f7f4] via-[#c0ece6] to-[#a0e1d9]"
border="border border-[#b5e6dd]"
text="text-[#05676e]"
                  prevValue={activeClientsForComparison.totalClients}
                  prevSubValue={activeClientsForComparison.totalFee}
                />

                <SummaryCard
                  title="Unique Clients"
                  value={filterUniqueClient?.length}
bg="bg-gradient-to-br from-[#e0f7f4] via-[#c0ece6] to-[#a0e1d9]"
border="border border-[#b5e6dd]"
text="text-[#05676e]"
                  prevValue={filterUniqueClientForComparison?.length}
                />

                

                <SummaryCard
                  title="RPC"
                  value={( (parseFloat(activeClients.totalFee) || 1) / activeClients.totalClients ).toFixed(0)}
                   bg="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200"
  border="border border-blue-200"
  text="text-blue-900"
                  prevValue={( (parseFloat(activeClientsForComparison.totalFee) || 1) / activeClientsForComparison.totalClients ).toFixed(0)}
                />

                <SummaryCard
                  title="RPU"
                  value={(
                    (parseFloat(activeClients.totalFee) || 1) / userData?.length
                  ).toFixed(0)}
                   bg="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200"
  border="border border-blue-200"
  text="text-blue-900"
                  prevValue={( (parseFloat(activeClientsForComparison.totalFee) || 1) / userData?.length ).toFixed(0)}
                />
 
          </div>

          </div>


































          {/* -----------------------Bar/Line/Area Charts--------------- */}
          <div className={`w-full ${getGridClasses()} gap-4 p-4`}>






                    
                  <div className="flex flex-col justify-start items-start gap-4 "> 


                      {visibility[0] && (
              <div className="w-full shadow-md rounded-md cursor-pointer border p-2 bg-white">
                <div className="flex items-center justify-between  w-full gap-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-center">
                      Client Department Analytics
                    </h3>
                    <select
                      onChange={(e) => setSelectChart(e.target.value)}
                      value={selectChart}
                      className={`${style.input} shadow-md drop-shadow-md`}
                      style={{ height: "2.2rem" }}
                    >
                      <option value={"bar"}>Bar Chart</option>
                      <option value={"line"}>Line Chart</option>
                      <option value={"area"}>Area Chart</option>
                    </select>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">
                    ({filterUniqueClient?.length})
                  </h3>
                </div>
                {/* (Month Wise) Department Total */}

                {/* {
                  featureFilter ? <JobCountChart featureFilter={featureFilter} selectChart={selectChart} selectedDepartment={selectedDepartment} selectedSource={selectedSource} selectedClient={selectedClient} selectedPartner={selectedPartner} uniqueClients={uniqueClients} setFilteredUniqueClient={setFilteredUniqueClient} /> : <div id="#apex-total-leads-chart" />
                } */}

                <div id="apex-jobCount-chart" />
              </div>
            )}














               {visibility[4] && (
              <div className="w-full shadow-md rounded-md cursor-pointer border p-2 bg-white   ">
                <div className="flex items-center justify-between  w-full gap-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-center">
                      Total Leads
                    </h3>
                    <select
                      onChange={(e) => setSelectChart(e.target.value)}
                      value={selectChart}
                      className={`${style.input} shadow-md drop-shadow-md`}
                      style={{ height: "2.2rem" }}
                    >
                      <option value={"bar"}>Bar Chart</option>
                      <option value={"line"}>Line Chart</option>
                      <option value={"area"}>Area Chart</option>
                    </select>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">
                    ({filteredLeads?.length})
                  </h3>
                </div>
                {/* (Month Wise) Department Total */}

                {/* {
                  featureFilter ? <JobCountChart featureFilter={featureFilter} selectChart={selectChart} selectedDepartment={selectedDepartment} selectedSource={selectedSource} selectedClient={selectedClient} selectedPartner={selectedPartner} uniqueClients={uniqueClients} setFilteredUniqueClient={setFilteredUniqueClient} /> : <div id="#apex-total-leads-chart" />
                } */}

                <div id="apex-total-leads-chart" />
              </div>
            )}





{/* ------------------Source Analysis----------------- */}
            {visibility[6] || visibility[7] ? (
              <div className="w-full flex justify-start items-start gap-2  rounded-md cursor-pointer   columns-1 " style={{"gridColumn": 1}}>
                {visibility[6] && (
                  <div className="w-[50%] shadow-md rounded-md cursor-pointer border p-2 bg-white">
                    <JobSourcePieChart
                      workFlowData={workFlowData}
                      selectedMonth={selectedMonth}
                      selectedYear={selectedYear}
                      lastDays={search}
                    />
                  </div>
                )}
                {visibility[7] && (
                  <div className="w-[50%] shadow-md rounded-md cursor-pointer border p-2 bg-white">
                    <JobSourceClientPartnerDonutCharts
                      workFlowData={workFlowData}
                      selectedMonth={selectedMonth}
                      selectedYear={selectedYear}
                      lastDays={search}
                    />
                  </div>
                )}
              </div>
            ) : null}

                    
 {/*  -------------Jobs Analysis----------- */}
            {visibility[2] && (
              <div className="w-full shadow-md rounded-md cursor-pointer border p-2 bg-white">
                <h3 className="text-lg font-semibold text-center">
                  Department-wise Total Count
                </h3>
                <div id="department-count-chart" />
              </div>
            )}



            
                     </div>












                  <div  className="flex flex-col justify-start items-start gap-4 ">
                    
                    
                               {/* ------------Month Wise Fee------------ */}
            {visibility[1] && (
              <div className="w-full shadow-md rounded-md cursor-pointer border p-2 bg-white">
                <div className="flex items-center gap-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-center">
                    Client Fee Analytics
                  </h3>
                </div>
                {/* (Month Wise) Fee Total */}

                <div id="apex-fee-chart" />

                {/* {
                  
                  featureFilter ? <ClientFeeChart featureFilter={featureFilter} selectChart={selectChart} selectedDepartment={selectedDepartment} selectedSource={selectedSource} selectedClient={selectedClient} selectedPartner={selectedPartner} uniqueClients={uniqueClients} setFilteredUniqueClient={setFilteredUniqueClient} /> : <div id="apex-fee-chart" />

                } */}
              </div>
            )}
            
            
            
            
            
           
            
            
            
            {visibility[5] && (
              <div   className=" w-full flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-teal-100 via-teal-200 to-teal-300 shadow-lg hover:shadow-2xl  ">
                <div className="flex flex-col gap-4 w-full">
                  <div className=" w-full flex items-center gap-2 p-2 rounded-md border shadow-md bg-white">
                    <h3 className="font-semibold text-xl w-[24%]">Source</h3>
                    <h3 className="font-semibold text-xl text-start w-full">
                      Leads
                    </h3>
                  </div>

                  <div className=" w-full flex flex-col gap-2">
                    {[...filtered_leads]
                      .sort((a, b) => b.count - a.count)
                      .map((lead, i) => (
                        <div
                          key={`${lead.label}--${i}`}
                          className="w-full flex items-center gap-2 px-2 py-1 rounded-md border shadow-md bg-white/60 transition-all duration-300 ease-in-out transform hover:scale-[1.04]"
                        >
                          <h3 className="font-medium text-lg w-[24%]">
                            {lead.label}
                          </h3>
                          <div className="bg-white border overflow-hidden rounded-[2rem] shadow-md drop-shadow-md w-full h-full">
                            <div
                              style={{
                                width: `${lead?.count}%`,
                                background:
                                  lead?.count >= 100
                                    ? "linear-gradient(90deg, #00E396, #00C853)"
                                    : "linear-gradient(90deg, #FF4560, #FF8A65)",
                                transition: "width 0.4s ease-in-out",
                              }}
                              className={`h-[1.6rem] flex items-center justify-start ${
                                lead?.count < 15 ? "text-black" : "text-white"
                              } font-semibold rounded-[2rem] shadow-md`}
                            >
                              <span
                                className={`px-2 text-xs ${
                                  lead?.count < 3 ? "ml-3" : "ml-0"
                                }`}
                              >
                                {lead?.count}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

               {/* ------------------Fee Analysis----------------- */}
            {visibility[3] && (
              <div className="w-full shadow-md rounded-md cursor-pointer border p-2 bg-white">
                <h3 className="text-lg font-semibold text-center">
                  Department-wise Fee Count
                </h3>
                <div id="department-fee-chart" />
              </div>
            )}
            
            
             </div>





            {/* ------------Month Wise Department Total------------ */}
            
 

           

          

            {/* ------------------Lead / Lead Source Graph----------------- */}
            {/* { visibility[2] && (
              <div className="w-full shadow-md rounded-md cursor-pointer border p-2 bg-white">
                <h3 className="text-lg font-semibold text-center">
                  Lead Source Chart
                </h3>
                <div id="lead-source-chart" />
              </div>
            )} */}








            










            {/* 7----------Conversion Lead in Client in Proposal--------- */}
            






































           
































            










          </div>




















        </div>
      )}
    </div>
  );
}
