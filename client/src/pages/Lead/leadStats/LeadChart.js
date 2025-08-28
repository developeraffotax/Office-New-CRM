import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
 

const LeadsChart = ({ start, end,  lead_Source ,
             setLeadSource ,
             department ,
             setDepartment  }) => {

    const [chartType, setChartType] = useState("line"); // <-- chart type state

  const [series, setSeries] = useState([{ name: "Leads", data: [] }]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);


    const [status, setStatus] = useState("all");


  // const formattedLabels =  labels.map((d) => dayjs(d).format("DD MMM"));
  const fetchData = async () => {
    if (!start || !end) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/stats`,
        { params: { start, end, lead_Source, department, status,  } }
      );
      setLabels(data.labels);
      setSeries(data.series);
    } catch (err) {
      toast.error( "Error Updating Leads Charts")
      console.error("Error fetching lead stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
  }, [start, end, lead_Source, department, status, chartType, ]);

  const options = {
    chart: { id: "leads-chart",  toolbar: { show: false } },
    xaxis: { categories: labels },
    yaxis: { title: { text: "Lead Count" } },
    stroke: { curve: "smooth" },
    dataLabels: { enabled: true },
    tooltip: { x: { format: "yyyy-MM-dd" } },
  };

  return (
    <div className="p-4 bg-white shadow rounded-xl border min-h-[400px]">
       <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Lead Statistics</h2>

        <div className="flex gap-2">
          <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="all">All</option>
          <option value="progress">Progress</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>


        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="line">Line</option>
          <option value="bar">Bar</option>
          <option value="area">Area</option>
        </select>
        </div>
      </div>
      {loading ? (
              <div className="flex items-center justify-center h-[350px]">
                <FaSpinner className="animate-spin text-gray-500 text-3xl" />
              </div>
            ) : (
              <Chart options={options} series={series} type={chartType} height={350} />
            )}


      
    </div>
  );
};

export default LeadsChart;
