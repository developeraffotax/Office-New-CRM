import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import { style } from "../../utlis/CommonStyle";
import { IoClose } from "react-icons/io5";
import { IoMdDownload } from "react-icons/io";
import { Box, Button } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { differenceInSeconds, format } from "date-fns";
import { AiTwotoneDelete } from "react-icons/ai";
import { AiOutlineEdit } from "react-icons/ai";
import Loader from "../../utlis/Loader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { FaAngleLeft } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";
import { LuImport } from "react-icons/lu";
import ApexCharts from "react-apexcharts";
import { BsPieChartFill } from "react-icons/bs";
import AddTimerModal from "../../pages/TimerSheet/AddTimerModal";
import RunningTimers from "../../pages/TimerSheet/RunningTimers";

// CSV Configuration
const csvConfig = mkConfig({
  filename: "full_table_data",
  fieldSeparator: ",",
  quoteStrings: '"',
  decimalSeparator: ".",
  showLabels: true,
  showTitle: true,
  title: "Exported Timer Table Data",
  useTextFile: false,
  useBom: true,
  useKeysAsHeaders: true,
});

const TimeSheet = forwardRef(
  ({ timerData, setTimerData, childRef, setIsload }, ref) => {
    const { auth } = useAuth();
    const [tableFilterData, setTableFilterDate] = useState([]);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [userData, setUserData] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [timerId, setTimerId] = useState("");
    const [times, setTimes] = useState({
      monTotal: 0,
      tueTotal: 0,
      wedTotal: 0,
      thuTotal: 0,
      friTotal: 0,
      satTotal: 0,
      sunTotal: 0,
      weekTotal: 0,
    });
    const [week, setWeek] = useState(new Date());
    const [firstDayOfWeek, setFirstDayOfWeek] = useState(null);
    const [lastDayOfWeek, setLastDayOfWeek] = useState(null);
    const [firstDayOfPrevWeek, setFirstDayOfPrevWeek] = useState(null);
    const [lastDayOfPrevWeek, setLastDayOfPrevWeek] = useState(null);
    const [firstDayOfNextWeek, setFirstDayOfNextWeek] = useState(null);
    const [lastDayOfNextWeek, setLastDayOfNextWeek] = useState(null);
    const [strfdow, setStrfdow] = useState("");
    const [strldow, setStrldow] = useState("");
    const [strfdopw, setStrfdopw] = useState("");
    const [strldopw, setStrldopw] = useState("");
    const [strfdonw, setStrfdonw] = useState("");
    const [strldonw, setStrldonw] = useState("");
    const [userName, setUsername] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const [filterData, setFilterData] = useState([]);
    const [call, setCall] = useState(false);
    const [projects, setProjects] = useState([]);
    const options = ["Chargeable", "Non-Chargeable"];
    const [active, setActive] = useState("Weekly");
    const selectDate = ["Weekly", "Monthly", "Yearly"];
    // Month Filter
    const [month, setMonth] = useState(new Date());
    const [firstDayOfMonth, setFirstDayOfMonth] = useState(null);
    const [lastDayOfMonth, setLastDayOfMonth] = useState(null);
    const [strfdom, setStrfdom] = useState("");
    const [strldom, setStrldom] = useState("");
    // Yearly Filter
    const [year, setYear] = useState(new Date());
    const [firstDayOfYear, setFirstDayOfYear] = useState(null);
    const [lastDayOfYear, setLastDayOfYear] = useState(null);
    const [strfdoy, setStrfdoy] = useState("");
    const [strldoy, setStrldoy] = useState("");
    // Chart
    const [chargeable, setChargeable] = useState(0);
    const [nonChargeable, setNonChargeable] = useState(0);
    const [chartOptions, setChartOptions] = useState({});
    const [chartSeries, setChartSeries] = useState([0, 0]);
    const [showGraph, setShowGraph] = useState(false);
    const [totalCPercengate, setTotalCPercentage] = useState(0);
    const [totalNPercengate, setTotalNPercentage] = useState(0);
    const [access, setAccess] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    console.log("TableFilterData:", tableFilterData);

    // console.log("auth:", auth.user);
    useEffect(() => {
      if (auth.user) {
        const filterAccess = auth.user.role.access
          .filter((role) => role.permission === "Timesheet")
          .flatMap((jobRole) => jobRole.subRoles);

        setAccess(filterAccess);
      }
    }, [auth]);

    //   Get All Timer Data
    const getAllTimeSheetData = async () => {
      setIsload(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/timer/get/all/timers`
        );

        setTimerData(data.timers);
      } catch (error) {
        console.log(error);
      } finally {
        setIsload(false);
      }
    };

    // useEffect(() => {
    //   getAllTimeSheetData();

    //   // eslint-disable-next-line
    // }, []);

    useImperativeHandle(childRef, () => ({
      refreshData: getAllTimeSheetData,
    }));

    // -------------Filter Chargeable & Non-Chargeable-------->
    useEffect(() => {
      if (tableFilterData) {
        const filteredData = tableFilterData.filter(
          (entry) => !userName || entry.jobHolderName === userName
        );
        const chargeableCount = filteredData.reduce((count, entry) => {
          return entry.activity === "Chargeable" ? count + 1 : count;
        }, 0);

        const nonChargeableCount = filteredData.reduce((count, entry) => {
          return entry.activity === "Non-Chargeable" ? count + 1 : count;
        }, 0);

        setChargeable(chargeableCount);
        setNonChargeable(nonChargeableCount);

        // Update chart data and options
        const total = chargeableCount + nonChargeableCount;
        const chargeablePercentage = total
          ? (chargeableCount / total) * 100
          : 0;
        const nonChargeablePercentage = total
          ? (nonChargeableCount / total) * 100
          : 0;

        setChartSeries([chargeablePercentage, nonChargeablePercentage]);

        setChartOptions({
          chart: {
            type: "pie",
          },
          labels: ["Chargeable", "Non-Chargeable"],
          colors: ["#008000", "#FF0000"],
          dataLabels: {
            formatter: (val) => `${val.toFixed(2)}%`,
          },
          legend: {
            position: "bottom",
          },
        });
      } else {
        const filteredData = timerData.filter(
          (entry) => !userName || entry.jobHolderName === userName
        );
        const chargeableCount = filteredData.reduce((count, entry) => {
          return entry.activity === "Chargeable" ? count + 1 : count;
        }, 0);

        const nonChargeableCount = filteredData.reduce((count, entry) => {
          return entry.activity === "Non-Chargeable" ? count + 1 : count;
        }, 0);

        setChargeable(chargeableCount);
        setNonChargeable(nonChargeableCount);

        // Update chart data and options
        const total = chargeableCount + nonChargeableCount;
        const chargeablePercentage = total
          ? (chargeableCount / total) * 100
          : 0;
        const nonChargeablePercentage = total
          ? (nonChargeableCount / total) * 100
          : 0;

        setChartSeries([chargeablePercentage, nonChargeablePercentage]);

        setChartOptions({
          chart: {
            type: "pie",
          },
          labels: ["Chargeable", "Non-Chargeable"],
          colors: ["#008000", "#FF0000"],
          dataLabels: {
            formatter: (val) => `${val.toFixed(2)}%`,
          },
          legend: {
            position: "bottom",
          },
        });
      }
    }, [userName, tableFilterData, timerData, active]);

    // Percentage
    useEffect(() => {
      const totalEnteries = chargeable + nonChargeable;
      setTotalCPercentage(((chargeable / totalEnteries) * 100).toFixed(1));
      setTotalNPercentage(((nonChargeable / totalEnteries) * 100).toFixed(1));
    }, [chargeable, nonChargeable]);

    //---------- Get All Users-----------
    const getAllUsers = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
        );

        auth?.user?.role?.name === "Admin"
          ? setUsers(
              data?.users.map((user) => ({ name: user?.name, id: user?._id }))
            )
          : setUsers(
              data?.users
                .filter((user) => user?.role?.name !== "Admin")
                .map((user) => ({ name: user?.name, id: user?._id }))
            );
        // setUsers(
        //   data?.users.map((user) => ({ name: user?.name, id: user?._id }))
        // );
        setUserData(data?.users);
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      getAllUsers();
      // eslint-disable-next-line
    }, []);

    // ---------------Get All Projects---------->

    const getAllProjects = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/projects/get_all/project`
        );

        setProjects((prevProjects) => {
          const projectNamesFromData = (data?.projects || []).map(
            (project) => project.projectName
          );

          const predefinedProjects = [
            "Bookkeeping",
            "Payroll",
            "Vat Return",
            "Personal Tax",
            "Accounts",
            "Company Sec",
            "Address",
          ];

          // Combine and deduplicate the projects
          const allProjects = [
            ...new Set([...predefinedProjects, ...projectNamesFromData]),
          ];

          return allProjects;
        });
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      getAllProjects();
      // eslint-disable-next-line
    }, []);

    // ------------------------Getting Week wise Count------->
    const formatTime = (milliseconds) => {
      const totalMinutes = Math.floor(milliseconds / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      // Format with leading zeros
      const formattedHours = String(hours).padStart(2, "0");
      const formattedMinutes = String(minutes).padStart(2, "0");

      return `${formattedHours}:${formattedMinutes}`;
    };

    useEffect(() => {
      let monTotal = 0;
      let tueTotal = 0;
      let wedTotal = 0;
      let thuTotal = 0;
      let friTotal = 0;
      let satTotal = 0;
      let sunTotal = 0;

      (filterData ? filterData : timerData)?.forEach((entry) => {
        const startTime = new Date(entry.startTime);
        const endTime = new Date(entry.endTime);

        if (!isNaN(startTime) && !isNaN(endTime)) {
          const diffMs = Math.abs(endTime - startTime);
          const day = startTime.getDay();

          switch (day) {
            case 1: // Monday
              monTotal += diffMs;
              break;
            case 2: // Tuesday
              tueTotal += diffMs;
              break;
            case 3: // Wednesday
              wedTotal += diffMs;
              break;
            case 4: // Thursday
              thuTotal += diffMs;
              break;
            case 5: // Friday
              friTotal += diffMs;
              break;
            case 6: // Saturday
              satTotal += diffMs;
              break;
            case 0: // Sunday
              sunTotal += diffMs;
              break;
            default:
              break;
          }
        }
      });

      const weekTotal =
        monTotal +
        tueTotal +
        wedTotal +
        thuTotal +
        friTotal +
        satTotal +
        sunTotal;

      setTimes({
        monTotal: formatTime(monTotal), // converting ms to hours
        tueTotal: formatTime(tueTotal),
        wedTotal: formatTime(wedTotal),
        thuTotal: formatTime(thuTotal),
        friTotal: formatTime(friTotal),
        satTotal: formatTime(satTotal),
        sunTotal: formatTime(sunTotal),
        weekTotal: formatTime(weekTotal),
      });
    }, [timerData, filterData]);

    // -------------------Filter By Week---------->
    useEffect(() => {
      if (week) {
        // Calculate the first and last day of the current week
        const today = week;
        const fdow = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - today.getDay() + 1
        );
        const ldow = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - today.getDay() + 7
        );

        setFirstDayOfWeek(fdow);
        setLastDayOfWeek(ldow);

        const formattedFdow = formatDate(fdow);
        const formattedLdow = formatDate(ldow);

        setStrfdow(formattedFdow);
        setStrldow(formattedLdow);

        // Previous week
        const fdopw = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - today.getDay() - 6
        );
        const ldopw = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - today.getDay()
        );

        setFirstDayOfPrevWeek(fdopw);
        setLastDayOfPrevWeek(ldopw);

        setStrfdopw(formatDate(fdopw));
        setStrldopw(formatDate(ldopw));

        // Next week
        const fdonw = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - today.getDay() + 8
        );
        const ldonw = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - today.getDay() + 14
        );

        setFirstDayOfNextWeek(fdonw);
        setLastDayOfNextWeek(ldonw);

        setStrfdonw(formatDate(fdonw));
        setStrldonw(formatDate(ldonw));

        // Filter `timerData` for the current week
        const filteredData = timerData.filter((entry) => {
          const entryDate = new Date(entry.date);

          // Convert first and last day to only date (ignore time)
          const fdowWithoutTime = new Date(fdow).setHours(0, 0, 0, 0);
          const ldowWithoutTime = new Date(ldow).setHours(23, 59, 59, 999);
          const entryDateWithoutTime = entryDate.setHours(0, 0, 0, 0);

          // Check if entryDate is within the current week's range
          return (
            entryDateWithoutTime >= fdowWithoutTime &&
            entryDateWithoutTime <= ldowWithoutTime &&
            (!userName || entry.jobHolderName === userName)
          );
        });

        setTableFilterDate(filteredData);
      }
    }, [week, timerData, userName, active]);

    // ------------------Filter By Month---------->
    useEffect(() => {
      if (active === "Monthly" && month) {
        const today = month;

        // First and last day of current month
        const fdom = new Date(today.getFullYear(), today.getMonth(), 1);
        const ldom = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        setFirstDayOfMonth(fdom);
        setLastDayOfMonth(ldom);
        setStrfdom(formatDate(fdom));
        setStrldom(formatDate(ldom));

        const filteredByMonth = timerData.filter((entry) => {
          const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);
          const fdomWithoutTime = new Date(fdom).setHours(0, 0, 0, 0);
          const ldomWithoutTime = new Date(ldom).setHours(23, 59, 59, 999);

          return (
            entryDate >= fdomWithoutTime &&
            entryDate <= ldomWithoutTime &&
            (!userName || entry.jobHolderName === userName)
          );
        });

        setTableFilterDate(filteredByMonth);
      }
    }, [month, timerData, userName, active]);

    // Handle previous and next navigation for months
    const goToPrevMonth = () => {
      setMonth(new Date(month.setMonth(month.getMonth() - 1)));
    };

    const goToNextMonth = () => {
      setMonth(new Date(month.setMonth(month.getMonth() + 1)));
    };

    // ---------------Year-wise filter------------------>
    useEffect(() => {
      if (active === "Yearly" && year) {
        const today = year;

        // First and last day of current year
        const fdoy = new Date(today.getFullYear(), 0, 1);
        const ldoy = new Date(today.getFullYear(), 11, 31);

        setFirstDayOfYear(fdoy);
        setLastDayOfYear(ldoy);
        setStrfdoy(formatDate(fdoy));
        setStrldoy(formatDate(ldoy));

        const filteredByYear = timerData.filter((entry) => {
          const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);
          const fdoyWithoutTime = new Date(fdoy).setHours(0, 0, 0, 0);
          const ldoyWithoutTime = new Date(ldoy).setHours(23, 59, 59, 999);

          return (
            entryDate >= fdoyWithoutTime &&
            entryDate <= ldoyWithoutTime &&
            (!userName || entry.jobHolderName === userName)
          );
        });

        setTableFilterDate(filteredByYear);
      }
    }, [year, timerData, userName, active]);

    // Handle previous and next navigation for years
    const goToPrevYear = () => {
      setYear(new Date(year.setFullYear(year.getFullYear() - 1)));
    };

    const goToNextYear = () => {
      setYear(new Date(year.setFullYear(year.getFullYear() + 1)));
    };

    // ---------Format Date----------->
    const formatDate = (date) => {
      const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(
        date
      );
      const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
      const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
      return `${da}-${mo}-${ye}`;
    };

    // ----------------Filter By Timer Data by User, Dep, Date------------>

    const filterByDep = (dateFilter, user, dep) => {
      const today = new Date();

      // Helper function to normalize the date (remove time information)
      const normalizeDate = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      };

      let startDate, endDate;

      // Convert the date filter into a date range
      switch (dateFilter) {
        case "Today":
          startDate = normalizeDate(new Date());
          endDate = normalizeDate(new Date());
          break;
        case "Yesterday":
          startDate = endDate = normalizeDate(
            new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
          );
          break;
        case "Last 7 days":
          startDate = normalizeDate(
            new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
          );
          endDate = normalizeDate(new Date());
          break;
        case "Last 15 days":
          startDate = normalizeDate(
            new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() - 15
            )
          );
          endDate = normalizeDate(new Date());
          break;
        case "Last 30 days":
          startDate = normalizeDate(
            new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() - 30
            )
          );
          endDate = normalizeDate(new Date());
          break;
        case "Last 60 days":
          startDate = normalizeDate(
            new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() - 60
            )
          );
          endDate = normalizeDate(new Date());
          break;
        case "Custom date":
          startDate = normalizeDate(new Date(dateFilter.startDate));
          endDate = normalizeDate(new Date(dateFilter.endDate));
          break;
        default:
          // No filter
          startDate = null;
          endDate = null;
      }

      const filteredData = tableFilterData.filter((item) => {
        const itemDate = item.date ? normalizeDate(new Date(item.date)) : null;

        console.log("Filter Date:", itemDate);

        // Check if the item date falls within the startDate and endDate range
        const matchDate =
          itemDate && startDate && endDate
            ? itemDate >= startDate && itemDate <= endDate
            : true;

        const matchUser = user ? item.jobHolderName === user : true;
        const matchDep = dep ? item.department === dep : true;

        return matchDate && matchUser && matchDep;
      });

      setFilterData(filteredData);
    };

    useEffect(() => {
      filterByDep();
      setCall(false);

      // eslint-disable-next-line
    }, [tableFilterData, call]);

    // -----------Download in CSV------>
    const flattenData = (data) => {
      return data.map((row) => ({
        date: row.date || "",
        JobHolderName: row.JobHolderName || "",
        companyName: row.companyName || "",
        clientName: row.clientName || "",
        projectName: row.projectName || "",
        department: row.department || "",
        startTime: row.startTime || "",
        endTime: row.endTime || "",
        type: row.type || "",
        note: row.note || "",
        task: row.task || "",
      }));
    };

    const handleExportData = () => {
      const csvData = flattenData(timerData);
      const csv = generateCsv(csvConfig)(csvData);
      download(csvConfig)(csv);
    };

    const getCurrentMonthYear = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      return `${year}-${month}`;
    };

    // ------------------Delete Timer------------->

    const handleDeleteTaskConfirmation = (taskId) => {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          handleDeleteTimer(taskId);
          Swal.fire("Deleted!", "Your timer has been deleted.", "success");
        }
      });
    };

    const handleDeleteTimer = async (id) => {
      const filteredData = timerData?.filter((item) => item._id !== id);
      setTimerData(filteredData);

      try {
        const { data } = await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/v1/timer/delete/timer/${id}`
        );
        if (data) {
          toast.success("Timer deleted successfully!");
          getAllTimeSheetData();
        }
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message);
      }
    };

    // -----------Update Alocate Task-------->
    const updateAlocateTask = async (taskId, note) => {
      if (!taskId) {
        toast.error("Project/Task id is required!");
        return;
      }
      try {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/timer/update/timer/${taskId}`,
          { note }
        );
        if (data?.success) {
          const updateTimer = data?.timer;
          toast.success("Task updated successfully!");
          setTimerData((prevData) =>
            prevData?.map((item) =>
              item._id === updateTimer._id ? updateTimer : item
            )
          );
        }
        getAllTimeSheetData();
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };

    // --------------Table Data--------->
    const columns = useMemo(
      () => [
        {
          accessorKey: "date",
          Header: ({ column }) => {
            const [filterValue, setFilterValue] = useState("");
            const [customDate, setCustomDate] = useState(getCurrentMonthYear());

            useEffect(() => {
              if (filterValue === "Custom date") {
                column.setFilterValue(customDate);
              }
              //eslint-disable-next-line
            }, [customDate, filterValue]);

            const handleFilterChange = (e) => {
              setFilterValue(e.target.value);
              column.setFilterValue(e.target.value);
              filterByDep(e.target.value, "", "");
              setMonthFilter(e.target.value);
            };

            const handleCustomDateChange = (e) => {
              setCustomDate(e.target.value);
              column.setFilterValue(e.target.value);
            };

            return (
              <div className="w-full flex flex-col gap-[2px]">
                <span
                  className="cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    setFilterValue("");
                    column.setFilterValue("");
                    setCall(true);
                  }}
                >
                  Date
                </span>

                {filterValue === "Custom date" ? (
                  <input
                    type="month"
                    value={customDate}
                    onChange={handleCustomDateChange}
                    className="h-[1.8rem] font-normal cursor-pointer rounded-md border border-gray-200 outline-none"
                  />
                ) : (
                  <select
                    value={filterValue}
                    onChange={handleFilterChange}
                    className="h-[1.8rem] font-normal cursor-pointer rounded-md border border-gray-200 outline-none"
                  >
                    <option value="">Select</option>
                    {column.columnDef.filterSelectOptions.map((option, idx) => (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const date = row.original.date;
            const [allocateDate, setAllocateDate] = useState(date);
            // console.log("date", date);

            useEffect(() => {
              setAllocateDate(row.original.date);
            }, [row.original]);

            return (
              <div className="w-full flex">
                <p>{format(new Date(allocateDate), "dd-MMM-yyyy")}</p>
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            console.log("Filter Data:=>", row, columnId, filterValue);
            const cellValue = row.getValue(columnId);
            if (!cellValue) return false;

            const cellDate = new Date(cellValue);

            if (filterValue.includes("-")) {
              const [year, month] = filterValue.split("-");
              const cellYear = cellDate.getFullYear().toString();
              const cellMonth = (cellDate.getMonth() + 1)
                .toString()
                .padStart(2, "0");

              return year === cellYear && month === cellMonth;
            }

            const today = new Date();

            switch (filterValue) {
              case "Today":
                return cellDate.toDateString() === today.toDateString();
              case "Yesterday":
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                return cellDate.toDateString() === yesterday.toDateString();
              case "Last 7 days":
                const last7Days = new Date(today);
                last7Days.setDate(today.getDate() - 7);
                return cellDate >= last7Days && cellDate <= today;
              case "Last 15 days":
                const last15Days = new Date(today);
                last15Days.setDate(today.getDate() - 15);
                return cellDate >= last15Days && cellDate <= today;
              case "Last 30 Days":
                const last30Days = new Date(today);
                last30Days.setDate(today.getDate() - 30);
                return cellDate >= last30Days && cellDate <= today;
              case "Last 60 Days":
                const last60Days = new Date(today);
                last60Days.setDate(today.getDate() - 60);
                return cellDate >= last60Days && cellDate <= today;
              case "Custom date":
                if (!filterValue.includes("-")) return false;
                const [year, month] = filterValue.split("-");
                const cellYear = cellDate.getFullYear().toString();
                const cellMonth = (cellDate.getMonth() + 1)
                  .toString()
                  .padStart(2, "0");

                return year === cellYear && month === cellMonth;
              default:
                return false;
            }
          },
          filterSelectOptions: [
            "Today",
            "Yesterday",
            "Last 15 days",
            "Last 30 Days",
            "Last 60 Days",
            "Custom date",
          ],
          filterVariant: "custom",
          size: 100,
          minSize: 90,
          maxSize: 110,
          grow: false,
        },
        {
          accessorKey: "jobHolderName",
          header: "Job Holder",
          Header: ({ column }) => {
            const user = auth?.user?.name;

            useEffect(() => {
              column.setFilterValue(user);
              setUsername(user);

              // eslint-disable-next-line
            }, []);
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Job Holder
                </span>
                {(auth?.user?.role.name === "Admin" ||
                  access.includes("Job-holder")) && (
                  <select
                    value={column.getFilterValue()}
                    onChange={(e) => {
                      column.setFilterValue(e.target.value);
                      setUsername(e.target.value);
                      filterByDep("", e.target.value, "");
                    }}
                    className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                  >
                    <option value="">Select</option>
                    {users?.map((jobhold, i) => (
                      <option key={i} value={jobhold?.name}>
                        {jobhold?.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const jobholder = cell.getValue() || "";

            return (
              <div className="w-full flex ">
                <div className="">
                  <span className="text-center">{jobholder}</span>
                </div>
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue(columnId);
            return (cellValue || "").toString() === filterValue.toString();
          },
          filterSelectOptions: users.map((jobhold) => jobhold?.name || ""),
          filterVariant: "select",
          size: 90,
          minSize: 80,
          maxSize: 130,
          grow: false,
        },
        {
          accessorKey: "activity",
          Header: ({ column }) => {
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Activity
                </span>

                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => {
                    column.setFilterValue(e.target.value);
                  }}
                  className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {options?.map((activity, i) => (
                    <option key={i} value={activity}>
                      {activity}
                    </option>
                  ))}
                </select>
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const activity = row.original.activity;

            return (
              <div className="w-full flex ">
                <div className="">
                  <span className="text-center">{activity}</span>
                </div>
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue(columnId);
            return (cellValue || "").toString() === filterValue.toString();
          },
          filterSelectOptions: options.map((activity) => activity || ""),
          filterVariant: "select",
          size: 120,
          minSize: 80,
          maxSize: 130,
          grow: false,
        },
        {
          accessorKey: "companyName",
          minSize: 120,
          maxSize: 200,
          size: 190,
          grow: false,
          Header: ({ column }) => {
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Company
                </span>
                <input
                  type="search"
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                />
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const clientName = cell.getValue();

            return (
              <div className="w-full flex cursor-pointer" title={clientName}>
                <span>{clientName}</span>
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            const cellValue =
              row.original[columnId]?.toString().toLowerCase() || "";

            return cellValue.includes(filterValue.toLowerCase());
          },
        },
        {
          accessorKey: "clientName",
          header: "Client",
          minSize: 120,
          maxSize: 200,
          size: 130,
          grow: false,
          Header: ({ column }) => {
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Client
                </span>
                <input
                  type="search"
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                />
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const clientName = cell.getValue();

            return (
              <div className="w-full flex cursor-pointer " title={clientName}>
                <span>{clientName}</span>
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            const cellValue =
              row.original[columnId]?.toString().toLowerCase() || "";

            return cellValue.includes(filterValue.toLowerCase());
          },
        },
        {
          accessorKey: "department",
          filterFn: "equals",
          Header: ({ column }) => {
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                    setCall(true);
                  }}
                >
                  Departments
                </span>
                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => {
                    column.setFilterValue(e.target.value);
                    filterByDep("", "", e.target.value);
                  }}
                  className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none "
                >
                  <option value="">Select</option>
                  {projects?.map((depart, i) => (
                    <option key={i} value={depart}>
                      {depart}
                    </option>
                  ))}
                </select>
              </div>
            );
          },
          filterSelectOptions: [
            "Bookkeeping",
            "Payroll",
            "Vat Return",
            "Personal Tax",
            "Accounts",
            "Company Sec",
            "Address",
          ],

          filterVariant: "select",
          size: 100,
          minSize: 90,
          maxSize: 140,
          grow: false,
        },
        {
          accessorKey: "time",
          header: "Time",
          Header: ({ column }) => {
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Time
                </span>
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const startTime = row.original.startTime;
            const endTime = row.original.endTime;
            return (
              <div className="w-full flex ">
                <span>
                  {format(new Date(startTime), "hh:mm:ss a")} -{" "}
                  {format(new Date(endTime), "hh:mm:ss a")}
                </span>
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            const cellValue =
              row.original[columnId]?.toString().toLowerCase() || "";
            return cellValue.startsWith(filterValue.toLowerCase());
          },

          size: 190,
          minSize: 100,
          maxSize: 220,
          grow: false,
        },
        // Days
        {
          accessorKey: "monday",
          header: "Mon",
          Cell: ({ row }) => {
            const createdDate = new Date(row.original.date);
            const startTime = row.original.startTime;
            const endTime = row.original.endTime;

            const dayOfWeek = createdDate.getDay();

            if (dayOfWeek === 1 && startTime) {
              return renderTime(startTime, endTime);
            }

            return null;
          },
          size: 50,
          minSize: 40,
          maxSize: 100,
          grow: false,
        },
        {
          accessorKey: "tuesday",
          header: "Tue",
          Cell: ({ row }) => {
            const createdDate = new Date(row.original.date);
            const startTime = row.original.startTime;
            const endTime = row.original.endTime;

            const dayOfWeek = createdDate.getDay();

            if (dayOfWeek === 2 && startTime) {
              return renderTime(startTime, endTime);
            }

            return null;
          },
          size: 50,
          minSize: 40,
          maxSize: 100,
          grow: false,
        },
        {
          accessorKey: "wednesday",
          header: "Wed",
          Cell: ({ row }) => {
            const createdDate = new Date(row.original.date);
            const startTime = row.original.startTime;
            const endTime = row.original.endTime;

            const dayOfWeek = createdDate.getDay();

            if (dayOfWeek === 3 && startTime) {
              return renderTime(startTime, endTime);
            }

            return null;
          },
          size: 50,
          minSize: 40,
          maxSize: 100,
          grow: false,
        },
        {
          accessorKey: "thursday",
          header: "Thu",
          Cell: ({ row }) => {
            const createdDate = new Date(row.original.date);
            const startTime = row.original.startTime;
            const endTime = row.original.endTime;

            const dayOfWeek = createdDate.getDay();

            if (dayOfWeek === 4 && startTime) {
              return renderTime(startTime, endTime);
            }

            return null;
          },
          size: 50,
          minSize: 40,
          maxSize: 100,
          grow: false,
        },
        {
          accessorKey: "friday",
          header: "Fri",
          Cell: ({ row }) => {
            const createdDate = new Date(row.original.date);
            const startTime = row.original.startTime;
            const endTime = row.original.endTime;

            const dayOfWeek = createdDate.getDay();

            if (dayOfWeek === 5 && startTime) {
              return renderTime(startTime, endTime);
            }

            return null;
          },
          size: 50,
          minSize: 40,
          maxSize: 100,
          grow: false,
        },
        {
          accessorKey: "saturday",
          header: "Sat",
          Cell: ({ row }) => {
            const createdDate = new Date(row.original.date);
            const startTime = row.original.startTime;
            const endTime = row.original.endTime;

            const dayOfWeek = createdDate.getDay();

            if (dayOfWeek === 6 && startTime) {
              return renderTime(startTime, endTime);
            }

            return null;
          },
          size: 50,
          minSize: 40,
          maxSize: 100,
          grow: false,
        },
        {
          accessorKey: "sunday",
          header: "Sun",
          Cell: ({ row }) => {
            const createdDate = new Date(row.original.date);
            const startTime = row.original.startTime;
            const endTime = row.original.endTime;

            const dayOfWeek = createdDate.getDay();

            if (dayOfWeek === 0 && startTime) {
              return renderTime(startTime, endTime);
            }

            return null;
          },
          size: 50,
          minSize: 40,
          maxSize: 100,
          grow: false,
        },
        // Task
        {
          accessorKey: "task",
          header: "Tasks",
          Header: ({ column }) => {
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Tasks
                </span>
                <input
                  type="search"
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                />
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const task = row.original.task;
            const [allocateTask, setAllocateTask] = useState(task);
            const [showEdit, setShowEdit] = useState(false);

            useEffect(() => {
              setAllocateTask(row.original.task);
            }, [row.original]);

            return (
              <div className="w-full h-full ">
                {showEdit ? (
                  <input
                    type="text"
                    placeholder="Enter Task..."
                    value={allocateTask}
                    onChange={(e) => setAllocateTask(e.target.value)}
                    className="w-full h-[2.3rem] focus:border border-gray-300 px-1 outline-none rounded"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-start "
                    title={allocateTask}
                  >
                    <p
                      className="text-black cursor-pointer text-start  "
                      onDoubleClick={() => setShowEdit(true)}
                    >
                      {allocateTask}
                    </p>
                  </div>
                )}
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            const cellValue =
              row.original[columnId]?.toString().toLowerCase() || "";

            return cellValue.startsWith(filterValue.toLowerCase());
          },
          size: 220,
          minSize: 200,
          maxSize: 400,
          grow: false,
        },
        // Note
        {
          accessorKey: "note",
          header: "Note",
          Header: ({ column }) => {
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Note
                </span>
                <input
                  type="search"
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                />
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const note = row.original.note;
            // const notes = cell.getValue();
            const [allocateNote, setAllocateNote] = useState(note);
            const [showEdit, setShowEdit] = useState(false);

            useEffect(() => {
              setAllocateNote(row.original.note);
            }, [row.original]);

            const updateAllocateNote = (task) => {
              updateAlocateTask(row.original._id, allocateNote);
              setShowEdit(false);
            };

            return (
              <div className="w-full h-full ">
                {showEdit ? (
                  <input
                    type="text"
                    placeholder="Enter Task..."
                    value={allocateNote}
                    onChange={(e) => setAllocateNote(e.target.value)}
                    onBlur={(e) => updateAllocateNote(e.target.value)}
                    className="w-full h-[2.3rem] focus:border border-gray-300 px-1 outline-none rounded"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-start "
                    onDoubleClick={() => setShowEdit(true)}
                    title={note}
                  >
                    <p
                      className="text-black cursor-pointer text-start  "
                      onDoubleClick={() => setShowEdit(true)}
                    >
                      {note}
                    </p>
                  </div>
                )}
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            const cellValue =
              row.original[columnId]?.toString().toLowerCase() || "";

            return cellValue.startsWith(filterValue.toLowerCase());
          },
          size: 300,
          minSize: 150,
          maxSize: 320,
          grow: false,
        },
        {
          accessorKey: "type",
          header: "Type",
          Header: ({ column }) => {
            return (
              <div className=" flex flex-col gap-[2px] w-full items-center justify-center">
                <span
                  className="ml-2 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Type
                </span>
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const type = row.original.type;
            return (
              <div className="w-full flex items-center justify-center">
                <span>
                  {type === "Timer" ? (
                    <span className="text-green-600 font-medium">{type}</span>
                  ) : (
                    <span className="text-orange-600 font-medium">{type}</span>
                  )}
                </span>
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            const cellValue =
              row.original[columnId]?.toString().toLowerCase() || "";
            return cellValue.startsWith(filterValue.toLowerCase());
          },

          size: 65,
          minSize: 60,
          maxSize: 90,
          grow: false,
        },

        // access.includes("Job-holder")
        ...(auth?.user?.role?.name === "Admin" ||
        access.includes("Edit") ||
        access.includes("Delete")
          ? [
              {
                accessorKey: "actions",
                header: "Actions",
                Cell: ({ cell, row }) => {
                  const timerId = row.original._id;
                  return (
                    <div className="flex items-center justify-center gap-3 w-full h-full">
                      {(auth?.user?.role?.name === "Admin" ||
                        access.includes("Edit")) && (
                        <span
                          className="text-[1rem] cursor-pointer"
                          title="Edit this column"
                          onClick={() => {
                            setTimerId(timerId);
                            setIsOpen(true);
                          }}
                        >
                          <AiOutlineEdit className="h-5 w-5 text-cyan-600 " />
                        </span>
                      )}
                      {(auth?.user?.role?.name === "Admin" ||
                        access.includes("Delete")) && (
                        <span
                          className="text-[1rem] cursor-pointer"
                          title="Delete Task!"
                          onClick={() => handleDeleteTaskConfirmation(timerId)}
                        >
                          <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600 " />
                        </span>
                      )}
                    </div>
                  );
                },
                size: 60,
              },
            ]
          : []),
      ],
      // eslint-disable-next-line
      [auth, users, tableFilterData, filterData, timerData, userName, active]
    );

    // Display Time in Correct Day
    const renderTime = (startTime, endTime) => {
      if (!startTime) {
        return <span>No Start Time</span>;
      }

      // Convert startTime to Date object
      const start = new Date(startTime);
      if (isNaN(start.getTime())) {
        return <span>Invalid Start Time</span>;
      }

      // If endTime is not available, use the current time
      const end = endTime ? new Date(endTime) : new Date();
      if (isNaN(end.getTime())) {
        return <span>Invalid End Time</span>;
      }

      // Calculate the difference in seconds
      const differenceInSecondsTotal = differenceInSeconds(end, start);

      let formattedTime = "";

      if (differenceInSecondsTotal < 60) {
        return null;
      } else if (differenceInSecondsTotal < 3600) {
        const minutes = Math.floor(differenceInSecondsTotal / 60);
        formattedTime = `${minutes}m`;
      } else {
        const hours = Math.floor(differenceInSecondsTotal / 3600);
        const minutes = Math.floor((differenceInSecondsTotal % 3600) / 60);
        formattedTime = `${hours}:${String(minutes).padStart(2, "0")}h`;
      }

      return (
        <div className="w-full flex items-center justify-center">
          <span>{formattedTime}</span>
        </div>
      );
    };

    // Clear table Filter
    const handleClearFilters = () => {
      table.setColumnFilters([]);

      table.setGlobalFilter("");
      // table.resetColumnFilters();
    };

    useImperativeHandle(ref, () => ({
      handleClearFilters,
    }));

    const table = useMaterialReactTable({
      columns,
      data: !tableFilterData && !userName ? timerData : tableFilterData || [],
      enableStickyHeader: true,
      enableStickyFooter: true,
      // columnFilterDisplayMode: "popover",
      muiTableContainerProps: {
        sx: {
          maxHeight: {
            xs: "490px",
            sm: "490px",
            md: "490px",
            lg: "490px",
            xl: "490px",
          },
          "@media (min-width: 1500px) and (max-width: 1800px)": {
            maxHeight: "650px",
          },

          "@media (min-width: 1800px)": {
            maxHeight: "640px",
          },
        },
      },
      enableColumnActions: false,
      enableColumnFilters: false,
      enableSorting: false,
      enableGlobalFilter: true,
      enableRowNumbers: true,
      enableColumnResizing: true,
      enableTopToolbar: true,
      enableBottomToolbar: true,

      enablePagination: true,
      initialState: {
        pagination: { pageSize: 20 },
        pageSize: 20,
        density: "compact",
      },

      muiTableHeadCellProps: {
        style: {
          fontWeight: "600",
          fontSize: "14px",
          backgroundColor: "#E5E7EB",
          color: "#000",
          padding: ".7rem 0.3rem",
        },
      },
      muiTableBodyCellProps: {
        sx: {
          border: "1px solid rgba(203, 201, 201, 0.5)",
        },
      },
      muiTableProps: {
        sx: {
          "& .MuiTableHead-root": {
            backgroundColor: "#f0f0f0",
          },
          tableLayout: "auto",
          fontSize: "13px",
          border: "1px solid rgba(81, 81, 81, .5)",
          caption: {
            captionSide: "top",
          },
        },
      },

      renderTopToolbarCustomActions: ({ table }) => {
        return (
          <Box
            sx={{
              display: "flex",
              gap: "7px",
              padding: "2px",
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={handleExportData}
              // startIcon={<FileDownloadIcon />}
              className="w-[2rem] rounded-full"
            >
              <IoMdDownload className="h-5 w-5 text-gray-700" />
            </Button>
          </Box>
        );
      },
    });

    return (
      <>
        <div className=" relative w-full min-h-[90vh] py-4 px-2 sm:px-4 flex flex-col gap-2  ">
          <div className="flex items-center justify-between">
            <div className="relative flex items-center gap-4">
              {/* Select */}
              <select
                value={active}
                onChange={(e) => setActive(e.target.value)}
                className={`w-[6rem] h-[2.1rem] border-2 border-orange-500 outline-none rounded-md cursor-pointer `}
              >
                {/* <option value="">Select Activity</option> */}
                {selectDate?.map((act, i) => (
                  <option key={i} value={act}>
                    {act}
                  </option>
                ))}
              </select>
              {/*-------- Week Wise Navigation---------- */}
              {active === "Weekly" && (
                <div className="flex items-center justify-center">
                  <div
                    className="mx-2"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Previous Week Button */}
                    <button
                      title={`${strfdopw && strfdopw} to ${
                        strldopw && strldopw
                      }`}
                      onClick={() => {
                        setWeek(new Date(firstDayOfPrevWeek));
                      }}
                      className="border-none rounded-full p-1 shadow bg-orange-500 hover:bg-orange-600 transition-all duration-200 cursor-pointer flex items-center justify-center"
                    >
                      <FaAngleLeft className="h-5 w-5 text-white" />
                    </button>

                    <div className="mx-2">
                      <p>
                        Entries From {strfdow && strfdow} to{" "}
                        {strldow && strldow}
                      </p>
                    </div>

                    {/* Next Week Button */}
                    <button
                      title={`${strfdonw && strfdonw} to ${
                        strldonw && strldonw
                      }`}
                      onClick={() => {
                        setWeek(new Date(firstDayOfNextWeek));
                      }}
                      className="border-none rounded-full p-1 shadow bg-orange-500 hover:bg-orange-600 transition-all duration-200 cursor-pointer flex items-center justify-center"
                    >
                      <FaAngleRight className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              )}
              {/* -----------------Monthly Navigation------------- */}
              {active === "Monthly" && (
                <div className="flex items-center justify-center">
                  <button
                    title={`Previous Month: ${strfdom && strfdom} to ${
                      strldom && strldom
                    }`}
                    onClick={goToPrevMonth}
                    className="border-none rounded-full p-1 shadow bg-orange-500 hover:bg-orange-600 transition-all duration-200 cursor-pointer flex items-center justify-center"
                  >
                    <FaAngleLeft className="h-5 w-5 text-white" />
                  </button>

                  <div className="mx-2">
                    <p>
                      Month: {strfdom && strfdom} to {strldom && strldom}
                    </p>
                  </div>

                  <button
                    title={`Next Month: ${strfdom && strfdom} to ${
                      strldom && strldom
                    }`}
                    onClick={goToNextMonth}
                    className="border-none rounded-full p-1 shadow bg-orange-500 hover:bg-orange-600 transition-all duration-200 cursor-pointer flex items-center justify-center"
                  >
                    <FaAngleRight className="h-5 w-5 text-white" />
                  </button>
                </div>
              )}
              {/*----------------- Yearly Navigation---------------- */}
              {active === "Yearly" && (
                <div className="flex items-center justify-center">
                  <button
                    title={`Previous Year: ${strfdoy && strfdoy} to ${
                      strldoy && strldoy
                    }`}
                    onClick={goToPrevYear}
                    className="border-none rounded-full p-1 shadow bg-orange-500 hover:bg-orange-600 transition-all duration-200 cursor-pointer flex items-center justify-center"
                  >
                    <FaAngleLeft className="h-5 w-5 text-white" />
                  </button>

                  <div className="mx-2">
                    <p>
                      Year: {strfdoy && strfdoy} to {strldoy && strldoy}
                    </p>
                  </div>

                  <button
                    title={`Next Year: ${strfdoy && strfdoy} to ${
                      strldoy && strldoy
                    }`}
                    onClick={goToNextYear}
                    className="border-none rounded-full p-1 shadow bg-orange-500 hover:bg-orange-600 transition-all duration-200 cursor-pointer flex items-center justify-center"
                  >
                    <FaAngleRight className="h-5 w-5 text-white" />
                  </button>
                </div>
              )}

              <span
                onClick={() => setShowGraph(!showGraph)}
                className=" p-1 rounded-md hover:shadow-md transition-all duration-300 cursor-pointer text-orange-500 hover:text-orange-600 bg-gray-200/60 hover:bg-gray-200/80 border"
              >
                <BsPieChartFill className="h-6 w-6" />
              </span>
              {/* ---------ApixChart------ */}

              {showGraph && (
                <div className="relative">
                  <div className=" absolute top-[0rem] left-[4rem] z-20 py-2 px-4 rounded-md shadow-md bg-white">
                    <ApexCharts
                      options={chartOptions}
                      series={chartSeries}
                      type="pie"
                      width={350}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* ----------Add Manual Buttons---------- */}
            <div className="flex items-center gap-4">
              <button
                className={`w-[3rem] h-[2.2rem] flex items-center justify-center rounded-md hover:shadow-md text-gray-800 bg-sky-100 hover:text-white hover:bg-sky-600 text-[15px] `}
                onClick={handleExportData}
                title="Import Date"
              >
                <LuImport className="h-6 w-6 " />
              </button>
              {/* auth.user.name === "Salman" ||
              auth.user.name === "M Salman" || */}
              {(auth.user.role.name === "Admin" ||
                access.includes("Tracker")) && (
                <button
                  className={`${style.button1} text-[15px] `}
                  onClick={() => setIsRunning(true)}
                  style={{ padding: ".4rem 1rem" }}
                  title="All Running Timers"
                >
                  Running Timers
                </button>
              )}
              <button
                className={`${style.button1} text-[15px] `}
                onClick={() => setIsOpen(true)}
                style={{ padding: ".4rem 1rem" }}
              >
                Add Manual
              </button>
            </div>
          </div>
          {/* ---------------Filters---------- */}

          {/* -----------Tabledata--------------- */}
          {loading ? (
            <div className="flex items-center justify-center w-full h-screen px-4 py-4">
              <Loader />
            </div>
          ) : (
            <div
              className={`w-full mt-4 ${
                timerData.length >= 14 ? "min-h-[10vh]" : "min-h-[60vh]"
              } relative `}
            >
              <div className="h-full hidden1 overflow-y-scroll  relative">
                <MaterialReactTable table={table} />
              </div>
            </div>
          )}

          {/* ---------------Total Time---------------- */}

          <div className="w-full absolute bottom-4 left-0 px-4 z-[20] grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6  lg:grid-cols-9 gap-4 2xl:gap-5">
            <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-green-600 hover:bg-green-700 transition-all duration-150 flex flex-col items-center justify-center text-white">
              <h4 className="text-[16px] font-medium">Monday</h4>
              <span className="text-[15px]">{times?.monTotal}</span>
            </div>
            <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-green-600 hover:bg-green-700 transition-all duration-150 flex flex-col items-center justify-center text-white">
              <h4 className="text-[16px] font-medium">Tuesday</h4>
              <span className="text-[15px]">{times?.tueTotal}</span>
            </div>
            <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-green-600 hover:bg-green-700 transition-all duration-150 flex flex-col items-center justify-center text-white">
              <h4 className="text-[16px] font-medium">Wednesday</h4>
              <span className="text-[15px]">{times?.wedTotal}</span>
            </div>
            <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-green-600 hover:bg-green-700 transition-all duration-150 flex flex-col items-center justify-center text-white">
              <h4 className="text-[16px] font-medium">Thursday</h4>
              <span className="text-[15px]">{times?.thuTotal}</span>
            </div>
            <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-green-600 hover:bg-green-700 transition-all duration-150 flex flex-col items-center justify-center text-white">
              <h4 className="text-[16px] font-medium">Friday</h4>
              <span className="text-[15px]">{times?.friTotal}</span>
            </div>
            <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-green-600 hover:bg-green-700 transition-all duration-150 flex flex-col items-center justify-center text-white">
              <h4 className="text-[16px] font-medium">Saturday</h4>
              <span className="text-[15px]">{times?.satTotal}</span>
            </div>
            <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-green-600 hover:bg-green-700 transition-all duration-150 flex flex-col items-center justify-center text-white">
              <h4 className="text-[16px] font-medium">Sunday</h4>
              <span className="text-[15px]">{times?.sunTotal}</span>
            </div>
            <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-orange-600 hover:bg-orange-700 transition-all duration-150 flex flex-col items-center justify-center text-white">
              <h4 className="text-[16px] font-medium">
                {active === "Weekly"
                  ? "Week-Total"
                  : active === "Monthly"
                  ? "Month-Total"
                  : "Year-Total"}
              </h4>
              <span className="text-[15px]">{times?.weekTotal}</span>
            </div>
            <div className="w-full py-4 px-4 rounded-md hover:shadow-md cursor-pointer bg-sky-600 hover:bg-sky-700 transition-all duration-150 flex flex-col items-center justify-center text-white">
              <h4 className="text-[16px] font-medium">Chargeable</h4>
              <span className="text-[15px]">
                {totalCPercengate > 0 ? totalCPercengate : 0} %
              </span>
            </div>
          </div>

          {/* -----------Add Timer Manual-------------- */}
          {isOpen && (
            <div className="fixed top-0 left-0 w-full h-[112vh] z-[999] bg-gray-300/70 flex items-center justify-center py-6  px-4">
              <AddTimerModal
                setIsOpen={setIsOpen}
                users={users}
                setTimerData={setTimerData}
                timerId={timerId}
                setTimerId={setTimerId}
                getAllTimeSheetData={getAllTimeSheetData}
              />
            </div>
          )}

          {/* -----------All Running Timers-------------- */}
          {isRunning && (
            <div className="fixed top-0 left-0 w-full h-[112vh] z-[999] bg-gray-50 flex items-center justify-center ">
              <RunningTimers users={userData} setIsRunning={setIsRunning} />
            </div>
          )}
        </div>
      </>
    );
  }
);

export default TimeSheet;
