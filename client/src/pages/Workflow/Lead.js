import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { MaterialReactTable } from "material-react-table";
import Loader from "../../utlis/Loader";

export default function Leads({ selectedLead, selectedDepartment }) {
  const [loading, setLoading] = useState(false);
  const [workFlowData, setWorkflowData] = useState([]);
  const [clients, setClients] = useState([]);

  const departments = [
    "Bookkeeping",
    "Payroll",
    "Vat Return",
    "Personal Tax",
    "Accounts",
    "Company Sec",
    "Address",
  ];

  // Fetching Client Job Data
  const allClientJobData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/workflow/clients`
      );
      if (data) {
        setWorkflowData(data?.clients);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allClientJobData();
  }, []);

  // Get Client Lead Wise Total
  useEffect(() => {
    const departmentTotals = departments
      .map((department) => {
        // Filter jobs by department
        const departmentJobs = workFlowData.filter(
          (job) => job.job.jobName === department
        );

        console.log("departmentJobs:", departmentJobs);

        // If selectedLead  is provided
        const filteredJobs = selectedLead
          ? departmentJobs.filter((job) => job.job.lead === selectedLead)
          : departmentJobs;

        // If there are no jobs with a valid lead
        if (filteredJobs.length === 0) {
          return null;
        }

        // Calculate lead-wise totals and job counts
        const leadWiseTotals = filteredJobs.reduce((acc, job) => {
          const lead = job.job.lead;
          if (!acc[lead]) {
            acc[lead] = {
              totalHours: 0,
              totalFee: 0,
              departmentCount: 0,
              assignedDepartmentCount: 0,
            };
          }
          acc[lead].totalHours += parseFloat(job.totalHours || 0);
          acc[lead].totalFee += parseFloat(job.fee || 0);
          acc[lead].departmentCount += 1;

          return acc;
        }, {});

        return {
          department,
          leadWiseTotals,
        };
      })
      .filter((departmentData) => departmentData !== null);

    setClients(departmentTotals);

    // eslint-disable-next-line
  }, [workFlowData, selectedLead, selectedDepartment]);

  // Columns for Lead Wise Breakdown
  const leadColumns = [
    { accessorKey: "lead", header: "Owner", size: 100 },
    { accessorKey: "totalHours", header: "Hours", size: 100 },
    { accessorKey: "totalFee", header: "Fee", size: 100 },
    {
      accessorKey: "departmentCount",
      header: "Department Count",
      size: 130,
    },
  ];

  return (
    <div className="relative w-full h-full overflow-y-auto hidden1 px-4 py-2 scroll-smooth bg-white pb-5">
      {loading ? (
        <Loader />
      ) : (
        // 3xl:grid-cols-3
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2  gap-4 ">
          {clients.length > 0 ? (
            clients
              .filter(
                (departmentData) =>
                  !selectedDepartment ||
                  departmentData.department === selectedDepartment
              )
              .map((departmentData, index) => (
                <div
                  key={index}
                  className={` p-2 rounded-md shadow-sm hover:shadow-lg bg-white/70  ${
                    departmentData.department === "Bookkeeping"
                      ? "hover:bg-[#0A6847]/5"
                      : departmentData.department === "Payroll"
                      ? "hover:bg-[#640D6B]/5"
                      : departmentData.department === "Vat Return"
                      ? "hover:bg-[#3D5300]/5"
                      : departmentData.department === "Personal Tax"
                      ? "hover:bg-[#12372A]/5"
                      : departmentData.department === "Accounts"
                      ? "hover:bg-[#3B1E54]/5"
                      : departmentData.department === "Company Sec"
                      ? "hover:bg-[#49243E]/5"
                      : "hover:bg-orange-600/5"
                  }  ${
                    clients.length > 1 && !selectedDepartment ? "" : "h-fit"
                  } transition-all duration-300 cursor-pointer border`}
                >
                  <h2
                    className={`text-lg font-medium py-1 px-4 rounded-[2rem] ${
                      departmentData.department === "Bookkeeping"
                        ? "bg-[#0A6847]"
                        : departmentData.department === "Payroll"
                        ? "bg-[#640D6B]"
                        : departmentData.department === "Vat Return"
                        ? "bg-[#3D5300]"
                        : departmentData.department === "Personal Tax"
                        ? "bg-[#12372A]"
                        : departmentData.department === "Accounts"
                        ? "bg-[#3B1E54]"
                        : departmentData.department === "Company Sec"
                        ? "bg-[#49243E]"
                        : "bg-orange-600"
                    } text-white shadow-md drop-shadow-md w-fit`}
                  >
                    {departmentData.department}
                  </h2>
                  {Object.entries(departmentData.leadWiseTotals).map(
                    ([lead, totals], idx) => (
                      <div key={idx} className="m-4">
                        <MaterialReactTable
                          columns={leadColumns}
                          data={[
                            {
                              lead,
                              totalHours: totals.totalHours.toFixed(0),
                              totalFee: totals.totalFee.toFixed(0),
                              departmentCount: totals.departmentCount,
                              assignedDepartmentCount:
                                totals.assignedDepartmentCount,
                            },
                          ]}
                          enablePagination={false}
                          enableSorting={false}
                          enableColumnFilters={false}
                          enableTopToolbar={false}
                          enableBottomToolbar={false}
                          muiTableContainerProps={{
                            sx: {
                              maxHeight: "300px",
                              border: "1px solid #ddd",
                            },
                          }}
                          muiTableBodyCellProps={{
                            sx: {
                              padding: "4px",
                              fontSize: "12px",
                              border: "1px solid rgba(0, 0, 0, 0.1)",
                              lineHeight: "16px",
                              wordBreak: "break-word",
                            },
                          }}
                          muiTableHeadCellProps={{
                            style: {
                              fontWeight: "600",
                              fontSize: "14px",
                              backgroundColor: "rgb(193, 183, 173, 0.8)",
                              color: "#000",
                              padding: ".7rem 0.3rem",
                            },
                          }}
                        />
                      </div>
                    )
                  )}
                </div>
              ))
          ) : (
            <div className="w-[100vw] h-[60vh] flex items-center justify-center flex-col">
              <img
                src="rb_616.png"
                className="h-[17rem] w-[18vh] sm:h-[23rem] sm:w-[25rem]  drop-shadow-md shadow-gray-500"
                alt="Data"
              />
              <p className="text-lg font-medium text-center">
                No data available for the selected Owner.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
