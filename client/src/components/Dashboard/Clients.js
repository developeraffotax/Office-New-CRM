import React, { useEffect, useState } from "react";
import ApexCharts from "apexcharts";
import Loader from "../../utlis/Loader";
import { style } from "../../utlis/CommonStyle";
import JobSourcePieChart from "./ClientSourceChart";
import JobSourceClientPartnerDonutCharts from "./ClientpartnerChart";
import { FaLongArrowAltUp } from "react-icons/fa";
import { FaLongArrowAltDown } from "react-icons/fa";
import { getLastTwelveMonths, getLastTwelveMonthsWithLabels, shiftArrFromThisMonth } from "./utils";

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
  salesData
}) {
  const [clients, setClients] = useState([]);
  const [fee, setFee] = useState("");
  const [selectChart, setSelectChart] = useState("area");
  const [filterWorkFlow, setFilterWorkFlow] = useState([]);
  const [filterUniqueClient, setFilteredUniqueClient] = useState([]);
  const [activeClientJobs, setActiveClientJobs] = useState([]);
  const [activeClients, setActiveClients] = useState({
    totalFee: "0",
    totalClients: "0",
  });

  console.log("SALES DATA", salesData)

  // Visibility Div
  const initialState = [true, true, true, true, true, true, true];
  const [visibility, setVisibility] = useState(() => {
    const savedState = localStorage.getItem("clients");
    return savedState ? JSON.parse(savedState) : initialState;
  });
  useEffect(() => {
    localStorage.setItem("sales", JSON.stringify(visibility));
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
    return "grid grid-cols-1 sm:grid-cols-2";
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

    
    //console.log("Filtered Unique Clients💛🧡❤:", filteredData);

    setFilteredUniqueClient(filteredData);
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

    //console.log("departmentTotals:", departmentTotals);

    setClients(departmentTotals);

    // eslint-disable-next-line
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

  // ------------Total Fee-------->
  useEffect(() => {
    const calculateTotalFee = (data) => {
      return data.reduce((sum, client) => sum + Number(client.totalFee), 0);
    };

    setFee(calculateTotalFee(clients).toFixed(0));
  }, [clients]);











  const [lead_source_labels, set_lead_source_labels] = useState(['Upwork', "Fiverr", "PPH", "Referral", "Partner", "Google", "Facebook", "LinkedIn", "CRM", "Existing", "Other"])

  const [filtered_leads, set_filtered_leads] = useState([])


  // --Render Lead Source Chart(#888)------->
  useEffect(() => {

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 = Jan, 11 = Dec

    const startDate = new Date(currentYear, currentMonth - 11, 1);

    


    const filteredLeads = salesData?.totalLeads?.filter((lead) => {
       // Lead Date
      const leadDate = new Date(lead.createdAt);
      const leadMonth = leadDate.getMonth() + 1;
      const leadYear = leadDate.getFullYear();






       if(!selectedYear) {
      const leadDateN = new Date(leadYear, leadMonth - 1, 1); // month -1 because JS months are 0-indexed
      return (
        (!selectedMonth || leadMonth === parseInt(selectedMonth)) &&
        (leadDateN >= startDate && leadDateN <= now)  
        
      )

    }




      return  (!selectedMonth || leadMonth === parseInt(selectedMonth)) && (!selectedYear || leadYear === parseInt(selectedYear))
      
    })

    // Count how many leads are in each source
    const leadSourceCounts = lead_source_labels.map(label => {
      // if (label === "Other") {
      //   return filteredLeads.filter(lead => !lead_source_labels.includes(lead.lead_Source)).length;
      // }
      return filteredLeads?.filter(lead => lead.lead_Source === label).length || 0;
    });

 
    console.log("leadSourceCounts💚💚💚", leadSourceCounts)
 

    const optionsCount = {
      series: [{ name: "Leads", data: leadSourceCounts }],
      chart: { type: selectChart, height: 300 },
      plotOptions: {
        bar: { columnWidth: "50%", borderRadius: 5 },
      },
      xaxis: { categories: lead_source_labels, title: { text: "Source" } },
      yaxis: { title: { text: "Leads" } },
      colors: [ "#6C757D" ]
    };

    const chartElementCount = document.querySelector("#lead-source-chart");
    if (chartElementCount) {
      const chartCount = new ApexCharts(chartElementCount, optionsCount);
      chartCount.render();
      return () => chartCount.destroy();
    }
  }, [selectedYear, selectedMonth, selectChart, salesData, lead_source_labels]);






































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
  }, [clients, selectChart]);

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
  }, [clients, selectChart]);

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




      if(!selectedYear && !selectedMonth) {

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0 = Jan, 11 = Dec
    
        const startDate = new Date(currentYear, currentMonth - 11, 1); // First day of the month 11 months ago


        
         filteredData = filteredData.filter((job) => {
          const jobDate = new Date(job.currentDate);

          return (
            jobDate >= startDate && jobDate <= now
          );
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

    // console.log("filterData", filterData());

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

  const filterData = uniqueClients.filter((job) => {
    const jobDate = new Date(job.currentDate);
    const jobMonth = jobDate.getMonth() + 1;
    const jobYear = jobDate.getFullYear();

    const today = new Date();
    const pastDate = new Date();

    if (search && !isNaN(search) && search >= 1) {
      pastDate.setDate(today.getDate() - parseInt(search));
    }

    const matchesSearch = !search || (jobDate >= pastDate && jobDate <= today);

    // console.log("SELECTED YEAR >>>>>>", selectedYear)


    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 = Jan, 11 = Dec

    const startDate = new Date(currentYear, currentMonth - 11, 1); // First day of the month 11 months ago

    
    if(!selectedYear) {
      const jobDateN = new Date(jobYear, jobMonth - 1, 1); // month -1 because JS months are 0-indexed
      return (
        (!selectedMonth || jobMonth === parseInt(selectedMonth)) &&
        (jobDateN >= startDate && jobDateN <= now) &&
        (!selectedSource || job.source === selectedSource) &&
        (!selectedClient || job.clientType === selectedClient) &&
        (!selectedPartner || job.partner === selectedPartner) &&
        (!selectedDepartment || job.jobName === selectedDepartment) &&
        matchesSearch
      )

    }
    

    return (
      (!selectedMonth || jobMonth === parseInt(selectedMonth)) &&
      (!selectedYear || jobYear === parseInt(selectedYear)) &&
      (!selectedSource || job.source === selectedSource) &&
      (!selectedClient || job.clientType === selectedClient) &&
      (!selectedPartner || job.partner === selectedPartner) &&
      (!selectedDepartment || job.jobName === selectedDepartment) &&
      matchesSearch
    );
  });

  //console.log("FilterData2:", filterData);

  // Map data for month-wise total job count and fee totals
  const monthData = filterData.reduce((acc, job) => {
    const jobDate = new Date(job.currentDate);
    const month = jobDate.toLocaleString("default", { month: "short" });

    if (!acc[month]) acc[month] = { jobCount: 0, totalFee: 0 };

    acc[month].jobCount += 1;
    acc[month].totalFee += parseFloat(job.fee || 0);

    return acc;
  }, {});

  // ------------------------>Format Months<--------------------->

  //console.log("MONTH DATA>>>", monthData)

  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Assuming `monthData`
  const months = Object.keys(monthData).sort((a, b) => {
    const [monthA, yearA] = a.split(" ");
    const [monthB, yearB] = b.split(" ");

    return (
      parseInt(yearA) - parseInt(yearB) ||
      monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB)
    );
  });

  let formattedMonths = months.map(
    (month) => `${month} (${monthData[month]?.jobCount || 0})`
  );

  // Prepare data series for month-wise job count
  let jobCountSeries = [
    {
      name: "Total Jobs",
      data: months.map((month) => monthData[month]?.jobCount || 0),
    },
  ];

  // Prepare data series for month-wise fee totals
  const feeSeries = [
    {
      name: "Total Fee",
      data: months.map((month) => monthData[month]?.totalFee || 0),
    },
  ];



  // Render charts
  useEffect(() => {
    // Job Count Chart
   
 

    const jobCountSeriesForPastOneYear = []

    if(!selectedYear) {
      

      formattedMonths = getLastTwelveMonthsWithLabels();

      const rotatedArr = shiftArrFromThisMonth([...jobCountSeries[0].data])

      jobCountSeriesForPastOneYear.push({
        name: "Total Jobs",
        data: rotatedArr
      },)

    }

    

    const jobCountChartOptions = {
      series: selectedYear ? jobCountSeries : jobCountSeriesForPastOneYear,
      chart: { type: selectChart, height: 300 },
      xaxis: { categories: formattedMonths, title: { text: "Month" } },
      yaxis: { title: { text: "Total Jobs" } },
      plotOptions:
        selectChart === "bar"
          ? {
              bar: {
                columnWidth: `${selectedMonth ? "10%" : "40%"}`,
                borderRadius: 5,
              },
            }
          : {},
    };

    const jobCountChartElement = document.querySelector("#apex-jobcount-chart");
    if (jobCountChartElement) {
      const jobCountChart = new ApexCharts(
        jobCountChartElement,
        jobCountChartOptions
      );
      jobCountChart.render();
      return () => jobCountChart.destroy();
    }

    // eslint-disable-next-line
  }, [selectChart, months, jobCountSeries]);





  
  // Department wise Fee
  useEffect(() => {

    const FeeSeriesForPastOneYear = [ ]

    if(!selectedYear) {
      

      formattedMonths = getLastTwelveMonthsWithLabels();

      const rotatedArr = shiftArrFromThisMonth([...feeSeries[0].data])

      FeeSeriesForPastOneYear.push({
        name: "Total Fee",
        data: rotatedArr
      },)

    }



    // Fee Total Chart
    const feeChartOptions = {
      series: selectedYear ? feeSeries : FeeSeriesForPastOneYear,
      chart: { type: selectChart, height: 300 },
      xaxis: { categories: formattedMonths, title: { text: "Month" } },
      yaxis: { title: { text: "Total Fee" } },
      plotOptions:
        selectChart === "bar"
          ? { bar: { columnWidth: "50%", borderRadius: 5 } }
          : {},
      colors: ["#FF5733", "#33FF57", "#3357FF"],
    };

    const feeChartElement = document.querySelector("#apex-fee-chart");
    if (feeChartElement) {
      const feeChart = new ApexCharts(feeChartElement, feeChartOptions);
      feeChart.render();
      return () => feeChart.destroy();
    }
  }, [selectChart, months, feeSeries]);

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
          <div className="flex justify-start gap-4 overflow-x-auto py-4 mx-auto max-w-[100%] hidden1 scroll-smooth">
            <div className="flex flex-col   items-start justify-start  min-w-[10rem] p-2 cursor-pointer bg-gradient-to-br from-teal-100 via-teal-200 to-teal-300 rounded-lg shadow-lg hover:shadow-xl transform transition-transform duration-300 hover:scale-105">
              <h2 className="text-xl font-bold text-gray-800 text-center mb-3">
                Departments
              </h2>
              <div className="flex items-start flex-col  w-full gap-4">
                <p className="text-xl  font-bold text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Total Clients:
                  </span>{" "}
                </p>
                <p className="text-xl  font-bold text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Total Fee:
                  </span>
                </p>
              </div>
            </div>
            {clients?.map((job, index) => (
              <div
                key={index}
                className={` relative flex flex-col  items-center min-w-[10rem]  p-2 cursor-pointer transition-transform duration-300 transform hover:scale-105 rounded-lg shadow-lg hover:shadow-xl ${
                  job?.department === "Bookkeeping"
                    ? "bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300"
                    : job?.department === "Payroll"
                    ? "bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300"
                    : job?.department === "Vat Return"
                    ? "bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300"
                    : job?.department === "Personal Tax"
                    ? "bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300"
                    : job?.department === "Accounts"
                    ? "bg-gradient-to-br from-sky-100 via-sky-200 to-sky-300"
                    : job?.department === "Company Sec"
                    ? "bg-gradient-to-br from-green-100 via-green-200 to-green-300"
                    : "bg-gradient-to-br from-fuchsia-100 via-fuchsia-200 to-fuchsia-300"
                }  ${
                  (job?.department === "Training" ||
                    job?.department === "CRM.Affotax") &&
                  "hidden"
                }`}
              >
                <h2 className="text-lg font-medium text-gray-800 text-center mb-3">
                  {job?.department}
                </h2>
                <div className="flex flex-col items-center w-full space-y-2">
                  {/*  */}
                  <p className=" relative text-3xl font-bold text-gray-700 text-center flex items-center gap-1">
                    {job?.totalDepartmentCount}
                  </p>

                  <p className="text-2xl font-bold text-gray-700 text-center">
                    ${" "}
                    {parseFloat(job?.totalFee).toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                {/* <div className="flex items-center ">
                  {job?.percentageChange >= 0 ? (
                    <FaLongArrowAltUp className="text-green-500 text-[17px]" />
                  ) : (
                    <FaLongArrowAltDown className="text-red-500 text-[17px]" />
                  )}
                  <p
                    className={`text-sm font-bold ${
                      job?.percentageChange >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {job?.percentageChange}
                  </p>
                </div> */}
              </div>
            ))}
            <div className="flex flex-col items-center min-w-[10rem]  p-3 cursor-pointer bg-gradient-to-br from-rose-100 via-rose-200 to-rose-300 rounded-lg shadow-lg hover:shadow-xl transform transition-transform duration-300 hover:scale-105">
              <h2 className="text-lg font-medium text-gray-800 text-center mb-3">
                Total
              </h2>
              <p className="text-3xl font-bold text-gray-700 text-center">
                {filterWorkFlow ? filterWorkFlow.length : workFlowData?.length}
              </p>
              <p className="text-2xl font-bold text-gray-700 text-center">
                ${" "}
                {parseFloat(fee).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            {/* Unique Client */}
            <div className="flex flex-col items-center min-w-[10rem]  p-3 cursor-pointer bg-gradient-to-br from-lime-100 via-lime-200 to-lime-300 rounded-lg shadow-lg hover:shadow-xl transform transition-transform duration-300 hover:scale-105">
              <h2 className="text-lg font-medium text-lime-900 text-center mb-3">
                Unique Clients
              </h2>
              <p className="text-4xl font-bold text-gray-700 text-center">
                {filterUniqueClient?.length}
              </p>
            </div>
            {/* Active Client */}
            <div className="flex flex-col items-center min-w-[10rem]  p-3 cursor-pointer bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 rounded-lg shadow-lg hover:shadow-xl transform transition-transform duration-300 hover:scale-105">
              <h2 className="text-lg font-medium text-gray-800 text-center mb-3">
                AU Total
              </h2>
              <p className="text-3xl font-bold text-gray-700 text-center">
                {activeClients.totalClients}
              </p>
              <p className="text-2xl font-bold text-gray-700 text-center">
                ${" "}
                {parseFloat(activeClients.totalFee).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            {/* RPC */}
            <div className="flex flex-col items-center min-w-[10rem]  p-3 cursor-pointer bg-gradient-to-br from-indigo-100 via-indigo-200 to-indigo-300 rounded-lg shadow-lg hover:shadow-xl transform transition-transform duration-300 hover:scale-105">
              <h2 className="text-lg font-medium text-gray-800 text-center mb-3">
                RPC
              </h2>
              <p className="text-3xl font-bold text-gray-700 text-center">
                {(
                  (parseFloat(activeClients.totalFee) || 1) /
                  activeClients.totalClients
                )
                  .toFixed(0)
                  .toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 2,
                  })}
              </p>
            </div>
            {/* RPU */}
            <div className="flex flex-col items-center min-w-[10rem]  p-3 cursor-pointer bg-gradient-to-br from-teal-100 via-teal-200 to-teal-300 rounded-lg shadow-lg hover:shadow-xl transform transition-transform duration-300 hover:scale-105">
              <h2 className="text-lg font-medium text-gray-800 text-center mb-3">
                RPU
              </h2>
              <p className="text-3xl font-bold text-gray-700 text-center">
                {((parseFloat(activeClients.totalFee) || 1) / userData?.length)
                  .toFixed(0)
                  .toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 2,
                  })}
              </p>
            </div>
          </div>

          {/* -----------------------Bar/Line/Area Charts--------------- */}
          <div className={`w-full ${getGridClasses()} gap-4`}>
            {/* ------------Month Wise Department Total------------ */}
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
                <div className="mt-3" id="apex-jobcount-chart" />
              </div>
            )}
            {/* ------------Month Wise Fee------------ */}
            {visibility[1] && (
              <div className="w-full shadow-md rounded-md cursor-pointer border p-2 bg-white">
                <div className="flex items-center gap-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-center">
                    Client Fee Analytics
                  </h3>
                </div>
                {/* (Month Wise) Fee Total */}
                <div className="mt-3" id="apex-fee-chart" />
              </div>
            )}

            




            {/* ------------------Lead / Lead Source Graph----------------- */}
             { visibility[2] && (
              <div className="w-full shadow-md rounded-md cursor-pointer border p-2 bg-white">
                <h3 className="text-lg font-semibold text-center">
                  Lead Source Chart
                </h3>
                <div id="lead-source-chart" />
              </div>
            )}







          

             




            {/* ------------------Source Analysis----------------- */}
            {
              visibility[3] || visibility[4] ? (
                <div className="w-full flex justify-start items-center gap-2  shadow-md rounded-md cursor-pointer border ">
                  {visibility[3] && (
              <div className="w-[50%] shadow-md rounded-md cursor-pointer border p-2 bg-white">
                <JobSourcePieChart
                  workFlowData={workFlowData}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  lastDays={search}
                />
              </div>
            )}
            {visibility[4] && (
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
              ) : null
            }







              {/* ------------------Fee Analysis----------------- */}
            {visibility[5] && (
              <div className="w-full shadow-md rounded-md cursor-pointer border p-2 bg-white">
                <h3 className="text-lg font-semibold text-center">
                  Department-wise Fee Count
                </h3>
                <div id="department-fee-chart" />
              </div>
            )}

            {/*  -------------Jobs Analysis----------- */}
            {visibility[6] && (
              <div className="w-full shadow-md rounded-md cursor-pointer border p-2 bg-white">
                <h3 className="text-lg font-semibold text-center">
                  Department-wise Total Count
                </h3>
                <div id="department-count-chart" />
              </div>
            )}




          </div>
        </div>
      )}
    </div>
  );
}
