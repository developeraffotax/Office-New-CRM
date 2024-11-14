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
}) {
  console.log("salesData", salesData);
  const [filteredTotalLeads, setFilteredTotalLeads] = useState(0);
  const [filteredTotalProposals, setFilteredTotalProposals] = useState(0);
  const [filteredTotalLeadProposal, setFilteredTotalLeadProposal] = useState(0);
  const [filteredTotalPPCLead, setFilteredTotalPPCLead] = useState(0);
  // PPL
  const proposalLeads = salesData.proposalLead.length;
  const proposalClients = salesData.proposalClient.length;
  // PPC
  const progressleadTotal = salesData.progressleads.length;
  const wonleadTotal = salesData.wonleads.length;
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

  useEffect(() => {
    const sourceCount = leadSource.reduce((acc, source) => {
      const count = totalLeads.filter(
        (lead) => lead.lead_Source === source
      ).length;
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
  }, [totalLeads]);

  // PPL Lead Percentage
  const PPLPercentage =
    proposalClients > 0 ? (proposalClients / proposalLeads) * 100 : 0;
  // PPC Lead Percentage
  const PPCPercentage =
    proposalClients > 0 ? (wonleadTotal / progressleadTotal) * 100 : 0;
  // Inactive Client Percentage
  const InactiveClientPercentage =
    proposalClients > 0
      ? (salesData?.inactiveClients.length / uniqueClients) * 100
      : 0;

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
            fontSize: "14px",
            fontWeight: 600,
          },
        },
      },
      yaxis: {
        title: {
          text: "Total Proposals Sent",
          style: {
            color: "#333",
            fontSize: "16px",
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

    // Filter leads based on selected month and year
    const filteredLeads = salesData.totalLeads
      .concat(salesData.proposalLead)
      .filter((lead) => {
        const leadDate = dayjs(lead.createdAt);
        return (
          (!selectedYear || leadDate.year() === parseInt(selectedYear)) &&
          (!selectedMonth || leadDate.month() + 1 === parseInt(selectedMonth))
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
      return (
        (!selectedYear || proposalDate.year() === parseInt(selectedYear)) &&
        (!selectedMonth || proposalDate.month() + 1 === parseInt(selectedMonth))
      );
    });
    setFilteredTotalProposals(filteredProposals.length);

    // Populate proposals by month for chart data
    filteredProposals.forEach((proposal) => {
      const month = dayjs(proposal.createdAt).month();
      proposalsByMonth[month] += 1;
    });

    // --------------Lead Proposal--------->
    // Filter proposals based on selected month and year
    const filteredLeadProposals = salesData.proposalLead.filter((proposal) => {
      const proposalDate = dayjs(proposal.createdAt);
      return (
        (!selectedYear || proposalDate.year() === parseInt(selectedYear)) &&
        (!selectedMonth || proposalDate.month() + 1 === parseInt(selectedMonth))
      );
    });
    setFilteredTotalLeadProposal(filteredLeadProposals.length);

    // Populate proposals by month for chart data
    filteredLeadProposals.forEach((proposal) => {
      const month = dayjs(proposal.createdAt).month();
      leadProposalByMonth[month] += 1;
    });

    // --------------PPC Lead--------->
    // Filter proposals based on selected month and year
    const filteredPPCLead = salesData.activeleadsTotal.filter((proposal) => {
      const ppcLeadDate = dayjs(proposal.createdAt);
      return (
        (!selectedYear || ppcLeadDate.year() === parseInt(selectedYear)) &&
        (!selectedMonth || ppcLeadDate.month() + 1 === parseInt(selectedMonth))
      );
    });
    setFilteredTotalPPCLead(filteredPPCLead.length);

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
  }, [salesData, selectedMonth, selectedYear]);

  return (
    <div className="w-full h-full p-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4">
        {/* Total Leads (Lead - Proposal Lead) */}
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
        {/*  */}

        {/* Total Send Proposal */}
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

        {/* Total Proposal in Lead  */}
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
            <h3 className="text-lg font-medium mb-4">Proposal Lead Overview</h3>
            <Chart
              options={leadsProposalChartData.options}
              series={leadsProposalChartData.series}
              type="area"
              height={300}
            />
          </div>
        </div>

        {/*  ------Total PPC Lead Analytics */}
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

        {/*----------Conversion Lead in Client in Proposal--------- */}

        <div className=" w-full  h-fit flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 ">
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
                {PPLPercentage.toFixed(2)}%
              </h1>
            </div>
            {/*----------Conversion PPC Lead Won --------- */}
            <div className="flex flex-col gap-4 w-full p-4 rounded-xl  items-center justify-center  bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-700 shadow-lg">
                <FaChartPie size={40} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 text-center">
                Conversion % PPC
              </h3>
              <h1 className="text-4xl font-extrabold text-black text-center tracking-wide">
                {PPCPercentage.toFixed(2)}%
              </h1>
            </div>
          </div>
        </div>
        {/* --------Source Wise Total---------> */}
        <div className=" w-full col-span-1 3xl:col-span-2 flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-teal-100 via-teal-200 to-teal-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 ">
          <div className="flex flex-col gap-4 w-full">
            <div className=" w-full flex items-center gap-2 p-2 rounded-md border shadow-md bg-white">
              <h3 className="font-semibold text-xl w-[24%]">Lead Source</h3>
              <h3 className="font-semibold text-xl text-start w-full">
                Analytics Count
              </h3>
            </div>

            {leadSourceCount?.map((lead) => (
              <div
                key={lead.source}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md border shadow-md bg-white/60"
              >
                <h3 className="font-medium text-lg w-[24%]">{lead.source}</h3>
                <div className="bg-white  border px-1 overflow-hidden rounded-[2rem] p-[1px] shadow-md drop-shadow-md w-full h-full">
                  <div
                    style={{
                      width: `${lead?.count}%`,
                      background:
                        lead?.count >= 100
                          ? "linear-gradient(90deg, #00E396, #00C853)"
                          : "linear-gradient(90deg, #FF4560, #FF8A65)",
                      transition: "width 0.4s ease-in-out",
                    }}
                    className={`h-[2rem] flex items-center justify-center  ${
                      lead?.count < 15 ? "text-black" : "text-white"
                    } font-semibold rounded-[2rem] shadow-md`}
                  >
                    <span className="px-2 text-xs ">{lead?.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inactive Users */}
        <div className="w-full flex flex-col h-fit items-center p-4 rounded-xl bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 gap-4">
          {/* Inactive Client Total*/}
          <div className="flex items-center justify-center flex-col gap-4 w-full p-4 rounded-xl   bg-gradient-to-br from-red-100 via-red-200 to-red-300 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-700 shadow-lg">
              <FaUserSlash size={40} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 text-center">
              Inactive Client
            </h3>
            <h1 className="text-4xl font-extrabold text-black text-center tracking-wide">
              {salesData?.inactiveClients.length}
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
      </div>
    </div>
  );
}
