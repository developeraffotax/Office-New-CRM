import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
import {
  FaPercentage,
  FaUserSlash,
  FaChartPie,
  FaChartLine,
} from "react-icons/fa";

export default function Sales({
  salesData,
  selectedMonth,
  selectedYear,
  uniqueClients,
  isSales,
  lastDays,
}) {
  // console.log("salesData", salesData);
  const [filteredTotalLeads, setFilteredTotalLeads] = useState(0);
  const [filteredTotalProposals, setFilteredTotalProposals] = useState(0);
  const [filteredTotalLeadProposal, setFilteredTotalLeadProposal] = useState(0);
  const [filteredTotalPPCLead, setFilteredTotalPPCLead] = useState(0);

  const initialState = [true, true, true, true, true, true, true];
  const [visibility, setVisibility] = useState(() => {
    const savedState = localStorage.getItem("sales");
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
    if (visibleCount === 2) return "grid grid-cols-1 sm:grid-cols-2";
    if (visibleCount >= 3 && visibleCount <= 4)
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4";
  };

  // --------PPC---PPL----InActive Client---->
  const [proposalLead, setProposalLead] = useState([]);
  const [proposalClient, setProposalClient] = useState([]);

  const proposalLeads = proposalLead?.length;
  const proposalClients = proposalClient?.length;

  // Filter Proposal Lead
  useEffect(() => {
    const filteredData = salesData?.proposalLead?.filter((item) => {
      const createdAtDate = new Date(item.createdAt);
      const itemMonth = createdAtDate.getMonth() + 1;
      const itemYear = createdAtDate.getFullYear();

      // Get the date for the last 'lastDays' days
      const currentDate = new Date();
      const lastDaysDate = new Date();
      lastDaysDate.setDate(currentDate.getDate() - lastDays);

      // Check if the item falls within the last 'lastDays' days
      const isInLastDays = lastDays
        ? createdAtDate >= lastDaysDate && createdAtDate <= currentDate
        : true;

      if (selectedMonth && selectedYear) {
        return (
          itemMonth === parseInt(selectedMonth) &&
          itemYear === parseInt(selectedYear)
        );
      } else if (selectedMonth) {
        return itemMonth === parseInt(selectedMonth);
      } else if (selectedYear) {
        return itemYear === parseInt(selectedYear);
      } else if (lastDays) {
        return isInLastDays;
      } else {
        return true;
      }
    });
    setProposalLead(filteredData);
  }, [selectedMonth, selectedYear, salesData, lastDays]);

  // Filter Proposal Clients
  useEffect(() => {
    const filteredData = salesData?.proposalClient?.filter((item) => {
      const createdAtDate = new Date(item.createdAt);
      const itemMonth = createdAtDate.getMonth() + 1;
      const itemYear = createdAtDate.getFullYear();

      // Get the date for the last 'lastDays' days
      const currentDate = new Date();
      const lastDaysDate = new Date();
      lastDaysDate.setDate(currentDate.getDate() - lastDays);

      // Check if the item falls within the last 'lastDays' days
      const isInLastDays = lastDays
        ? createdAtDate >= lastDaysDate && createdAtDate <= currentDate
        : true;

      if (selectedMonth && selectedYear) {
        return (
          itemMonth === parseInt(selectedMonth) &&
          itemYear === parseInt(selectedYear)
        );
      } else if (selectedMonth) {
        return itemMonth === parseInt(selectedMonth);
      } else if (selectedYear) {
        return itemYear === parseInt(selectedYear);
      } else if (lastDays) {
        return isInLastDays;
      } else {
        return true;
      }
    });
    setProposalClient(filteredData);

    console.log("Filtered Proposal Client:", filteredData);
  }, [selectedMonth, selectedYear, salesData, lastDays]);

  //---------------Filter PPC------->
  const [progressLead, setProgressLead] = useState([]);
  const [wonLead, setWonLead] = useState([]);

  const filterPPC = (data = [], selectedMonth, selectedYear, lastDays) => {
    return data.filter((item) => {
      const createdAtDate = new Date(item.createdAt);
      const itemMonth = createdAtDate.getMonth() + 1;
      const itemYear = createdAtDate.getFullYear();

      // Get the date for the last 'lastDays' days
      const currentDate = new Date();
      const lastDaysDate = new Date();
      lastDaysDate.setDate(currentDate.getDate() - lastDays);

      // Check if the item falls within the last 'lastDays' days
      const isInLastDays = lastDays
        ? createdAtDate >= lastDaysDate && createdAtDate <= currentDate
        : true;

      if (selectedMonth && selectedYear) {
        return (
          itemMonth === Number(selectedMonth) &&
          itemYear === Number(selectedYear)
        );
      } else if (selectedMonth) {
        return itemMonth === Number(selectedMonth);
      } else if (selectedYear) {
        return itemYear === Number(selectedYear);
      } else if (lastDays) {
        return isInLastDays;
      }
      return true;
    });
  };

  useEffect(() => {
    setProgressLead(
      filterPPC(salesData.totalLeads, selectedMonth, selectedYear, lastDays)
    );
    setWonLead(
      filterPPC(salesData.wonleads, selectedMonth, selectedYear, lastDays)
    );
  }, [selectedMonth, selectedYear, salesData, lastDays]);

  const progressleadTotal = progressLead?.length;
  const wonleadTotal = wonLead?.length;

  console.log("PPC Conversion:", progressLead, wonLead);

  // --------------CLient Filter------------->
  const [inactiveClient, setInactiveClient] = useState([]);

  const filterJobClients = (
    data = [],
    selectedMonth,
    selectedYear,
    lastDays
  ) => {
    return data.filter((item) => {
      const createdAtDate = new Date(item.updatedAt);
      const itemMonth = createdAtDate.getMonth() + 1;
      const itemYear = createdAtDate.getFullYear();

      // Get the date for the last 'lastDays' days
      const currentDate = new Date();
      const lastDaysDate = new Date();
      lastDaysDate.setDate(currentDate.getDate() - lastDays);

      const isInLastDays = lastDays
        ? createdAtDate >= lastDaysDate && createdAtDate <= currentDate
        : true;

      if (selectedMonth && selectedYear) {
        return (
          itemMonth === Number(selectedMonth) &&
          itemYear === Number(selectedYear)
        );
      } else if (selectedMonth) {
        return itemMonth === Number(selectedMonth);
      } else if (selectedYear) {
        return itemYear === Number(selectedYear);
      } else if (lastDays) {
        return isInLastDays;
      }
      return true;
    });
  };

  useEffect(() => {
    setInactiveClient(
      filterJobClients(
        salesData?.inactiveClients,
        selectedMonth,
        selectedYear,
        lastDays
      )
    );
  }, [selectedMonth, selectedYear, salesData, lastDays]);

  // Total Leads
  const totalLeads = salesData.activeleadsTotal;
  const [leadSourceCount, setLeadSourceCount] = useState([]);
  const leadSource = [
    "Upwork",
    "Fiverr",
    "PPH",
    "Referral",
    "Partner",
    "Google",
    "Facebook",
    "LinkedIn",
  ];

  // Filter Lead Source Count
  useEffect(() => {
    const filterLeadsByMonthYear = (leads, month, year, lastDays) => {
      return leads.filter((lead) => {
        const createdAtDate = new Date(lead.createdAt);
        const itemMonth = createdAtDate.getMonth() + 1;
        const itemYear = createdAtDate.getFullYear();

        // Get the date for the last 'lastDays' days
        const currentDate = new Date();
        const lastDaysDate = new Date();
        lastDaysDate.setDate(currentDate.getDate() - lastDays);

        const isInLastDays = lastDays
          ? createdAtDate >= lastDaysDate && createdAtDate <= currentDate
          : true;

        if (month && year) {
          return itemMonth === Number(month) && itemYear === Number(year);
        } else if (month) {
          return itemMonth === Number(month);
        } else if (year) {
          return itemYear === Number(year);
        } else if (lastDays) {
          return isInLastDays;
        }
        return true;
      });
    };

    const filteredLeads = filterLeadsByMonthYear(
      totalLeads,
      selectedMonth,
      selectedYear,
      lastDays
    );

    const sourceCount = leadSource.reduce((acc, source) => {
      const count = filteredLeads.filter(
        (lead) => lead.lead_Source === source
      )?.length;
      acc[source] = count;
      return acc;
    }, {});

    const formattedSourceCount = Object.entries(sourceCount).map(
      ([source, count]) => ({
        source,
        count,
      })
    );

    setLeadSourceCount(formattedSourceCount);

    // eslint-disable-next-line
  }, [totalLeads, selectedMonth, selectedYear, lastDays]);

  // PPL Lead Percentage
  const PPLPercentage = (proposalClients / proposalLeads) * 100;
  // PPC Lead Percentage
  const PPCPercentage = (wonleadTotal / progressleadTotal) * 100;
  // Inactive Client Percentage
  const InactiveClientPercentage =
    (inactiveClient?.length / uniqueClients) * 100;

  // --------------Total Leads------------
  const [leadsChartData, setLeadsChartData] = useState({
    options: {
      chart: { id: "leads-area-chart" },
      xaxis: {
        categories: [
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
        ],
      },
      yaxis: { title: { text: "Total Leads" } },
      tooltip: { x: { format: "MMM" } },
      colors: ["#ff4560"],
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.3,
          gradientToColors: ["#ff7f7f"],
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 100],
        },
      },
    },
    series: [{ name: "Leads", data: Array(12).fill(0) }],
  });

  // ------------Total Proposal------------>
  const [proposalChartData, setProposalChartData] = useState({
    options: {
      chart: {
        id: "proposal-area-chart",
        type: "area",
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
      },
      xaxis: {
        categories: [
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
        ],
        labels: {
          style: {
            colors: "#333",
            fontSize: "13px",
            fontWeight: 500,
          },
        },
      },
      yaxis: {
        title: {
          text: "Total Proposals Sent",
          style: {
            color: "#333",
            fontSize: "13px",
            fontWeight: 600,
            textAlign: "start",
          },
        },
        labels: {
          style: {
            colors: "#555",
            fontSize: "12px",
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "vertical",
          shadeIntensity: 0.5,
          gradientToColors: ["#73c2fb", "#73c2fb", "#73c2fb"],
          opacityFrom: 0.85,
          opacityTo: 0.25,
          stops: [0, 100],
        },
      },
      stroke: {
        curve: "smooth",
        width: 3,
        colors: ["#01D7A4"],
        lineCap: "round",
        borderRadius: "4px",
      },
      markers: {
        size: 5,
        colors: ["#007bff"],
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: {
          size: 7,
        },
      },
      tooltip: {
        theme: "dark",
        x: { format: "MMM" },
        style: { fontSize: "14px" },
      },
      colors: ["#01D7A4"],
      dataLabels: {
        enabled: true,
        style: {
          colors: ["#333"],
          fontSize: "12px",
          fontWeight: 700,
        },
      },
      grid: {
        show: true,
        borderColor: "#f1f1f1",
        strokeDashArray: 4,
      },
      title: {
        // text: "Monthly Sent Proposals",
        align: "center",
        style: {
          fontSize: "18px",
          fontWeight: 700,
          color: "#333",
        },
      },
    },
    series: [{ name: "Proposals", data: Array(12).fill(0) }],
  });

  //--------------- Lead in Proposal --------->
  const [leadsProposalChartData, setLeadsProposalChartData] = useState({
    options: {
      chart: { id: "leadsProposal-area-chart" },
      xaxis: {
        categories: [
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
        ],
      },
      yaxis: { title: { text: "Total Leads" } },
      tooltip: { x: { format: "MMM" } },
      colors: ["#7d3c98"],
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.3,
          gradientToColors: ["#7d3c98"],
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 100],
        },
      },
    },
    series: [{ name: "Leads", data: Array(12).fill(0) }],
  });

  //--------------- PPC Lead in Chart --------->
  const [PPCleadsChartData, setPPCleadsChartData] = useState({
    options: {
      chart: {
        id: "PPCleads-pie-chart",
        type: "pie",
      },
      labels: [
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
      ],
      tooltip: {
        y: {
          formatter: (val) => `${val} Leads`,
        },
      },
      colors: [
        "#C71585",
        "#FF6347",
        "#FF5733",
        "#33FF57",
        "#3357FF",
        "#FF33A1",
        "#FF8C00",
        "#8A2BE2",
        "#7FFF00",
        "#00FFFF",
        "#FF6347",
        "#D2691E",
        "#FF1493",
        "#C71585",
      ],
      title: {
        // text: "PPC Leads per Month",
        align: "center",
        style: {
          fontSize: "18px",
          fontWeight: 700,
          color: "#333",
        },
      },
    },
    series: Array(12).fill(0),
  });

  useEffect(() => {
    const leadsByMonth = Array(12).fill(0);
    const proposalsByMonth = Array(12).fill(0);
    const leadProposalByMonth = Array(12).fill(0);
    const PPCleadByMonth = Array(12).fill(0);

    // Filter leads based on selected month and year, last days
    const filteredLeads = [
      ...(salesData.totalLeads || []),
      ...(salesData.proposalLead || []),
    ].filter((lead) => {
      const leadDate = dayjs(lead.createdAt).startOf("day");

      const today = dayjs().startOf("day");

      const lastDaysDate =
        lastDays && Number(lastDays) > 0
          ? today.subtract(Number(lastDays), "day")
          : null;

      const isInLastDays = lastDaysDate
        ? leadDate.isAfter(lastDaysDate) || leadDate.isSame(lastDaysDate)
        : true;

      return (
        (!selectedYear || leadDate.year() === parseInt(selectedYear, 10)) &&
        (!selectedMonth ||
          leadDate.month() + 1 === parseInt(selectedMonth, 10)) &&
        isInLastDays
      );
    });

    setFilteredTotalLeads(filteredLeads.length);

    // Populate leads by month for chart data
    filteredLeads.forEach((lead) => {
      const month = dayjs(lead.createdAt).month();
      leadsByMonth[month] += 1;
    });

    // Filter proposals based on selected month and year
    const filteredProposals = salesData.totalProposals.filter((proposal) => {
      const proposalDate = dayjs(proposal.createdAt);
      const today = dayjs().startOf("day");

      const lastDaysDate =
        lastDays && Number(lastDays) > 0
          ? today.subtract(Number(lastDays), "day")
          : null;

      const isInLastDays = lastDaysDate
        ? proposalDate.isAfter(lastDaysDate) ||
          proposalDate.isSame(lastDaysDate)
        : true;
      return (
        (!selectedYear || proposalDate.year() === parseInt(selectedYear)) &&
        (!selectedMonth ||
          proposalDate.month() + 1 === parseInt(selectedMonth)) &&
        isInLastDays
      );
    });
    setFilteredTotalProposals(filteredProposals?.length);

    // Populate proposals by month for chart data
    filteredProposals.forEach((proposal) => {
      const month = dayjs(proposal.createdAt).month();
      proposalsByMonth[month] += 1;
    });

    // --------------Lead Proposal--------->
    // Filter proposals based on selected month and year
    const filteredLeadProposals = salesData.proposalLead.filter((proposal) => {
      const proposalDate = dayjs(proposal.createdAt);

      const today = dayjs().startOf("day");

      const lastDaysDate =
        lastDays && Number(lastDays) > 0
          ? today.subtract(Number(lastDays), "day")
          : null;

      const isInLastDays = lastDaysDate
        ? proposalDate.isAfter(lastDaysDate) ||
          proposalDate.isSame(lastDaysDate)
        : true;

      return (
        (!selectedYear || proposalDate.year() === parseInt(selectedYear)) &&
        (!selectedMonth ||
          proposalDate.month() + 1 === parseInt(selectedMonth)) &&
        isInLastDays
      );
    });
    setFilteredTotalLeadProposal(filteredLeadProposals?.length);

    // Populate proposals by month for chart data
    filteredLeadProposals.forEach((proposal) => {
      const month = dayjs(proposal.createdAt).month();
      leadProposalByMonth[month] += 1;
    });

    // --------------PPC Lead--------->
    // Filter proposals based on selected month and year
    const filteredPPCLead = salesData.totalLeads.filter((proposal) => {
      const ppcLeadDate = dayjs(proposal.createdAt);
      const today = dayjs().startOf("day");

      const lastDaysDate =
        lastDays && Number(lastDays) > 0
          ? today.subtract(Number(lastDays), "day")
          : null;

      const isInLastDays = lastDaysDate
        ? ppcLeadDate.isAfter(lastDaysDate) || ppcLeadDate.isSame(lastDaysDate)
        : true;

      return (
        (!selectedYear || ppcLeadDate.year() === parseInt(selectedYear)) &&
        (!selectedMonth ||
          ppcLeadDate.month() + 1 === parseInt(selectedMonth)) &&
        isInLastDays
      );
    });
    setFilteredTotalPPCLead(filteredPPCLead?.length);

    // Populate proposals by month for chart data
    filteredPPCLead.forEach((proposal) => {
      const month = dayjs(proposal.createdAt).month();
      PPCleadByMonth[month] += 1;
    });
    // -----------

    setLeadsChartData((prevData) => ({
      ...prevData,
      series: [{ name: "Leads", data: leadsByMonth }],
    }));

    setProposalChartData((prevData) => ({
      ...prevData,
      series: [{ name: "Proposals", data: proposalsByMonth }],
    }));

    setLeadsProposalChartData((prevData) => ({
      ...prevData,
      series: [{ name: "leadProposals", data: leadProposalByMonth }],
    }));
    setPPCleadsChartData((prevData) => ({
      ...prevData,
      series: [{ name: "PPCleads", data: PPCleadByMonth }],
    }));
  }, [salesData, selectedMonth, selectedYear, lastDays]);

  return (
    <div className="w-full h-full p-2">
      {isSales && (
        <div className=" absolute top-[8rem] right-[6rem] sm:right-[18rem] z-30 flex flex-col flex-wrap gap-3 p-3 bg-white shadow-md rounded-lg w-[9rem]">
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

      <div className={`${getGridClasses()} gap-4`}>
        {/* 1 Total Leads (Lead - Proposal Lead) */}
        {visibility[0] && (
          <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-sky-100 via-sky-200 to-sky-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <div className="flex flex-col gap-4 w-full p-4 rounded-xl bg-white/40 bg-opacity-90 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out">
              <h3 className="text-2xl font-semibold text-gray-800 text-center">
                Total Leads
              </h3>
              <h1 className="text-5xl font-extrabold text-black text-center tracking-wide">
                {filteredTotalLeads}
              </h1>
            </div>

            <div className="w-full mt-6 rounded-xl bg-white/30 p-4 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out">
              <h3 className="text-xl font-medium mb-4 text-gray-700">
                Leads Overview
              </h3>
              <Chart
                options={leadsChartData.options}
                series={leadsChartData.series}
                type="area"
                height={300}
              />
            </div>
          </div>
        )}
        {/* 2  ------Total PPC Lead Analytics */}
        {visibility[1] && (
          <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-green-100 via-green-200 to-green-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <div className="flex flex-col gap-4 w-full p-4 rounded-xl bg-white/40 bg-opacity-90 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out">
              <h3 className="text-2xl font-semibold text-gray-800 text-center">
                Total Leads in PPC
              </h3>
              <h1 className="text-5xl font-extrabold text-black text-center tracking-wide">
                {filteredTotalPPCLead}
              </h1>
            </div>

            <div className="w-full mt-6 rounded-xl bg-white/30 p-4 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out">
              <h3 className="text-lg font-medium mb-4">PPC Lead Overview</h3>
              <Chart
                options={PPCleadsChartData.options}
                series={PPCleadsChartData.series}
                type="area"
                height={300}
              />
            </div>
          </div>
        )}
        {/* 3 Total Send Proposal */}
        {visibility[2] && (
          <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <div className="flex flex-col gap-4 w-full p-4 rounded-xl bg-white/40 bg-opacity-90 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out">
              <h3 className="text-2xl font-semibold text-gray-800 text-center">
                Total Send Proposal
              </h3>
              <h1 className="text-5xl font-extrabold text-black text-center tracking-wide">
                {filteredTotalProposals}
              </h1>
            </div>

            <div className="w-full mt-6 rounded-xl bg-white/30 p-4 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out">
              <h3 className="text-lg font-medium mb-4">Proposal Overview</h3>
              <Chart
                options={proposalChartData.options}
                series={proposalChartData.series}
                type="bar"
                height={300}
              />
            </div>
          </div>
        )}

        {/* 4 Total Proposal in Lead  */}
        {visibility[3] && (
          <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <div className="flex flex-col gap-4 w-full p-4 rounded-xl bg-white/40 bg-opacity-90 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out">
              <h3 className="text-2xl font-semibold text-gray-800 text-center">
                Total Leads in Proposal
              </h3>
              <h1 className="text-5xl font-extrabold text-black text-center tracking-wide">
                {filteredTotalLeadProposal}
              </h1>
            </div>

            <div className="w-full mt-6 rounded-xl bg-white/30 p-4 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out">
              <h3 className="text-lg font-medium mb-4">
                Proposal Lead Overview
              </h3>
              <Chart
                options={leadsProposalChartData.options}
                series={leadsProposalChartData.series}
                type="area"
                height={300}
              />
            </div>
          </div>
        )}
        {/* 5  */}
        {visibility[4] && (
          <div className=" w-full  h-fit flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out  ">
            <div className="flex flex-col gap-4 w-full">
              {/* Total Leads (Lead - Proposal Lead) */}
              <div className="flex flex-col   gap-4 w-full p-4 rounded-xl items-center justify-center   bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 text-pink-700 shadow-lg">
                  <FaPercentage size={40} />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 text-center">
                  Conversion % PPL
                </h3>
                <h1 className="text-4xl font-extrabold text-black text-center tracking-wide">
                  {PPLPercentage ? PPLPercentage.toFixed(2) : 0}%
                </h1>
              </div>
              {/* Inactive Client Total*/}
              <div className="flex items-center justify-center flex-col gap-4 w-full p-4 rounded-xl   bg-gradient-to-br from-red-100 via-red-200 to-red-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-700 shadow-lg">
                  <FaUserSlash size={40} />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 text-center">
                  Inactive Client
                </h3>
                <h1 className="text-4xl font-extrabold text-black text-center tracking-wide">
                  {inactiveClient ? inactiveClient?.length : 0}
                </h1>
              </div>
            </div>
          </div>
        )}

        {/* 6 Inactive Clients */}
        {visibility[5] && (
          <div className="w-full flex flex-col h-fit items-center p-4 rounded-xl bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out  gap-4">
            {/*----------Conversion PPC Lead Won --------- */}
            <div className="flex flex-col gap-4 w-full p-4 rounded-xl  items-center justify-center  bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-700 shadow-lg">
                <FaChartPie size={40} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 text-center">
                Conversion % PPC
              </h3>
              <h1 className="text-4xl font-extrabold text-black text-center tracking-wide">
                {PPCPercentage ? PPCPercentage.toFixed(2) : 0}%
              </h1>
            </div>

            {/* Inactive Client Percentage */}
            <div className="flex flex-col gap-4 w-full p-4 rounded-xl items-center justify-center  bg-gradient-to-br from-lime-100 via-lime-200 to-lime-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-lime-100 text-lime-700 shadow-lg">
                <FaChartLine size={40} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 text-center">
                Inactive Client %
              </h3>
              <h1 className="text-4xl font-extrabold text-black text-center tracking-wide">
                {InactiveClientPercentage.toFixed(2)}%
              </h1>
            </div>
          </div>
        )}

        {/* 7----------Conversion Lead in Client in Proposal--------- */}
        {visibility[6] && (
          <div className=" w-full col-span-1 3xl:col-span-2 flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-teal-100 via-teal-200 to-teal-300 shadow-lg hover:shadow-2xl  ">
            <div className="flex flex-col gap-4 w-full">
              <div className=" w-full flex items-center gap-2 p-2 rounded-md border shadow-md bg-white">
                <h3 className="font-semibold text-xl w-[24%]">Lead Source</h3>
                <h3 className="font-semibold text-xl text-start w-full">
                  Analytics Count
                </h3>
              </div>

              <div className=" w-full flex flex-col gap-2">
                {leadSourceCount?.map((lead) => (
                  <div
                    key={lead.source}
                    className="w-full flex items-center gap-2 px-2 py-1 rounded-md border shadow-md bg-white/60 transition-all duration-300 ease-in-out transform hover:scale-[1.04]"
                  >
                    <h3 className="font-medium text-lg w-[24%]">
                      {lead.source}
                    </h3>
                    <div className="bg-white  border overflow-hidden rounded-[2rem]  shadow-md drop-shadow-md w-full h-full">
                      <div
                        style={{
                          width: `${lead?.count}%`,
                          background:
                            lead?.count >= 100
                              ? "linear-gradient(90deg, #00E396, #00C853)"
                              : "linear-gradient(90deg, #FF4560, #FF8A65)",
                          transition: "width 0.4s ease-in-out",
                        }}
                        className={`h-[1.6rem] flex items-center justify-center  ${
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
      </div>
    </div>
  );
}
