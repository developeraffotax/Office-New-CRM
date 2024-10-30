import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import { useAuth } from "../../context/authContext";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { AiOutlineEdit, AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import SubscriptionModel from "../SubscriptionModel";

const Subscriptions = forwardRef(
  ({ subscriptionData, setSubscriptionData }, ref) => {
    const { auth } = useAuth();
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [userName, setUserName] = useState([]);
    const [subscriptionId, setSubscriptionId] = useState("");
    const [filterData, setFilterData] = useState([]);
    const [totalFee, setTotalFee] = useState(0);
    //
    const subscriptions = ["Weekly", "Monthly", "Quarterly", "Yearly"];
    const states = ["Data", "Progress", "Queries", "Approval", "Submission"];

    console.log("subscriptionData:", subscriptionData);

    const fetchSubscriptions = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/subscriptions/fetch/all`
        );
        if (data) {
          setSubscriptionData(data.subscriptions);
        }
      } catch (error) {
        console.log(error);
      }
    };

    //---------- Get All Users-----------
    const getAllUsers = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
        );
        setUsers(
          data?.users?.filter((user) =>
            user.role?.access.some((item) =>
              item.permission.includes("Subscription")
            )
          ) || []
        );

        setUserName(
          data?.users
            ?.filter((user) =>
              user.role?.access.some((item) =>
                item.permission.includes("Subscription")
              )
            )
            .map((user) => user.name)
        );
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      getAllUsers();
      // eslint-disable-next-line
    }, []);

    // --------------Update JobHolder------------>
    const handleUpdateSubscription = async (id, value, type) => {
      try {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/subscriptions/update/single/${id}`,
          {
            jobHolder: type === "jobholder" && value,
            billingStart: type === "billingStart" && value,
            billingEnd: type === "billingEnd" && value,
            deadline: type === "deadline" && value,
            lead: type === "lead" && value,
            fee: type === "fee" && value,
            note: type === "note" && value,
            status: type === "status" && value,
            subscription: type === "subscription" && value,
          }
        );
        if (data) {
          fetchSubscriptions();
          toast.success("Subscription updated.");
        }
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message);
      }
    };

    // -----------Handle Custom date filter------
    const getCurrentMonthYear = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      return `${year}-${month}`;
    };

    // <-----------Job Status------------->

    const getStatus = (jobDeadline, yearEnd) => {
      const deadline = new Date(jobDeadline);
      const yearEndDate = new Date(yearEnd);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (deadline.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
        return "Overdue";
      } else if (
        yearEndDate.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0) &&
        !(deadline.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0))
      ) {
        return "Due";
      } else if (deadline.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
        return "Due";
      } else {
        return "";
      }
    };

    // Get Total Fee

    useEffect(() => {
      const calculateTotalHours = (data) => {
        return data.reduce((sum, client) => sum + Number(client.job.fee), 0);
      };

      if (filterData) {
        setTotalFee(calculateTotalHours(filterData).toFixed(0));
      } else {
        setTotalFee(calculateTotalHours(subscriptionData).toFixed(0));
      }
    }, [subscriptionData, filterData]);

    // ------------------Delete Timer------------->

    const handleDeleteConfirmation = (taskId) => {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this subscription!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          handleDeleteSubscription(taskId);
          Swal.fire(
            "Deleted!",
            "Your subscription has been deleted.",
            "success"
          );
        }
      });
    };

    const handleDeleteSubscription = async (id) => {
      try {
        const { data } = await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/v1/subscriptions/delete/${id}`
        );
        if (data) {
          fetchSubscriptions();
          toast.success("Subscription deleted successfully!");
        }
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message);
      }
    };

    //  --------------Table Columns Data--------->
    const columns = useMemo(
      () => [
        {
          accessorKey: "companyName",
          minSize: 190,
          maxSize: 300,
          size: 230,
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
                  Company Name
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
            const companyName = cell.getValue();

            return (
              <div className="cursor-pointer text-[#0078c8] hover:text-[#0053c8] w-full h-full">
                {companyName}
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

          filterFn: (row, columnId, filterValue) => {
            const cellValue =
              row.original[columnId]?.toString().toLowerCase() || "";

            return cellValue.includes(filterValue.toLowerCase());
          },
          size: 120,
          minSize: 80,
          maxSize: 150,
          grow: false,
        },

        {
          accessorKey: "job.jobHolder",
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
                  Job Holder
                </span>
                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {userName?.map((jobhold, i) => (
                    <option key={i} value={jobhold}>
                      {jobhold}
                    </option>
                  ))}
                </select>
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const employee = row?.original?.job?.jobHolder;

            return (
              <div className="w-full flex items-center justify-center">
                <select
                  value={employee || ""}
                  onChange={(e) => {
                    handleUpdateSubscription(
                      row.original._id,
                      e.target.value,
                      "jobholder"
                    );
                  }}
                  className="w-full h-[2rem] rounded-md border-none outline-none"
                >
                  <option value="empty"></option>
                  {userName.map((jobHold, i) => (
                    <option value={jobHold} key={i}>
                      {jobHold}
                    </option>
                  ))}
                </select>
              </div>
            );
          },
          filterFn: "equals",
          filterSelectOptions: userName?.map((jobhold) => jobhold),
          filterVariant: "select",
          size: 110,
          minSize: 80,
          maxSize: 150,
          grow: false,
        },
        {
          accessorKey: "job.jobName",
          header: "Departments",
          filterFn: "equals",
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
                  Departments
                </span>
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
          size: 110,
          minSize: 100,
          maxSize: 140,
          grow: false,
        },

        // Billing Start date
        {
          accessorKey: "job.billingStart",
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
            };

            const handleCustomDateChange = (e) => {
              setCustomDate(e.target.value);
              column.setFilterValue(e.target.value);
            };
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    setFilterValue("");
                    column.setFilterValue("");
                  }}
                >
                  Billing Start
                </span>
                {filterValue === "Custom date" ? (
                  <input
                    type="month"
                    value={customDate}
                    onChange={handleCustomDateChange}
                    className="h-[1.8rem] font-normal w-full cursor-pointer rounded-md border border-gray-200 outline-none"
                  />
                ) : (
                  <select
                    value={filterValue}
                    onChange={handleFilterChange}
                    className="h-[1.8rem] font-normal w-full cursor-pointer rounded-md border border-gray-200 outline-none"
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
            const billingStart = row.original.job.billingStart;
            const [date, setDate] = useState(() => {
              const cellDate = new Date(cell.getValue());
              return cellDate.toISOString().split("T")[0];
            });

            const [showYearend, setShowYearend] = useState(false);

            const handleDateChange = (newDate) => {
              const date = new Date(newDate);
              // Check if the date is valid
              if (isNaN(date.getTime())) {
                toast.error("Please enter a valid date.");
                return;
              }
              setDate(newDate);
              handleUpdateSubscription(
                row?.original?._id,
                newDate,
                "billingStart"
              );
              setShowYearend(false);
            };

            return (
              <div className="w-full ">
                {!showYearend ? (
                  <p onDoubleClick={() => setShowYearend(true)}>
                    {billingStart &&
                      format(new Date(billingStart), "dd-MMM-yyyy")}
                  </p>
                ) : (
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onBlur={(e) => handleDateChange(e.target.value)}
                    className={`h-[2rem]  cursor-pointer w-full text-center rounded-md border border-gray-200 outline-none `}
                  />
                )}
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
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

            // Other filter cases
            const today = new Date();
            const startOfToday = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );

            switch (filterValue) {
              case "Expired":
                return cellDate < startOfToday;
              case "Today":
                return cellDate.toDateString() === today.toDateString();
              case "Tomorrow":
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                return cellDate.toDateString() === tomorrow.toDateString();
              case "In 7 days":
                const in7Days = new Date(today);
                in7Days.setDate(today.getDate() + 7);
                return cellDate <= in7Days && cellDate > today;
              case "In 15 days":
                const in15Days = new Date(today);
                in15Days.setDate(today.getDate() + 15);
                return cellDate <= in15Days && cellDate > today;
              case "30 Days":
                const in30Days = new Date(today);
                in30Days.setDate(today.getDate() + 30);
                return cellDate <= in30Days && cellDate > today;
              case "60 Days":
                const in60Days = new Date(today);
                in60Days.setDate(today.getDate() + 60);
                return cellDate <= in60Days && cellDate > today;
              case "Last 12 months":
                const lastYear = new Date(today);
                lastYear.setFullYear(today.getFullYear() - 1);
                return cellDate >= lastYear && cellDate <= today;
              default:
                return false;
            }
          },
          filterSelectOptions: [
            "Select",
            "Expired",
            "Today",
            "Tomorrow",
            "In 7 days",
            "In 15 days",
            "30 Days",
            "60 Days",
            // "Last 12 months",
            "Custom date",
          ],
          filterVariant: "custom",
          size: 115,
          minSize: 80,
          maxSize: 140,
          grow: false,
        },

        // Billing End date
        {
          accessorKey: "job.billingEnd",
          header: "Billing End",
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
            };

            const handleCustomDateChange = (e) => {
              setCustomDate(e.target.value);
              column.setFilterValue(e.target.value);
            };
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    setFilterValue("");
                    column.setFilterValue("");
                  }}
                >
                  Billing End
                </span>
                {filterValue === "Custom date" ? (
                  <input
                    type="month"
                    value={customDate}
                    onChange={handleCustomDateChange}
                    className="h-[1.8rem] font-normal w-full   cursor-pointer rounded-md border border-gray-200 outline-none"
                  />
                ) : (
                  <select
                    value={filterValue}
                    onChange={handleFilterChange}
                    className="h-[1.8rem] font-normal w-full  cursor-pointer rounded-md border border-gray-200 outline-none"
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
            const billingEnd = row.original.job.billingEnd;
            const [date, setDate] = useState(() => {
              const cellDate = new Date(cell.getValue());
              return cellDate.toISOString().split("T")[0];
            });

            const [showDeadline, setShowDeadline] = useState(false);

            const handleDateChange = (newDate) => {
              const date = new Date(newDate);
              // Check if the date is valid
              if (isNaN(date.getTime())) {
                toast.error("Please enter a valid date.");
                return;
              }
              setDate(newDate);
              handleUpdateSubscription(row.original._id, newDate, "billingEnd");
              setShowDeadline(false);
            };

            const cellDate = new Date(date);
            const today = new Date();
            const isExpired = cellDate < today;

            return (
              <div className="w-full ">
                {!showDeadline ? (
                  <p onDoubleClick={() => setShowDeadline(true)}>
                    {billingEnd && format(new Date(billingEnd), "dd-MMM-yyyy")}
                  </p>
                ) : (
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onBlur={(e) => handleDateChange(e.target.value)}
                    className={`h-[2rem] cursor-pointer w-full text-center rounded-md border border-gray-200 outline-none ${
                      isExpired ? "text-red-500" : ""
                    }`}
                  />
                )}
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
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

            // Other filter cases
            const today = new Date();
            const startOfToday = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );

            switch (filterValue) {
              case "Expired":
                return cellDate < startOfToday;
              case "Today":
                return cellDate.toDateString() === today.toDateString();
              case "Tomorrow":
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                return cellDate.toDateString() === tomorrow.toDateString();
              case "In 7 days":
                const in7Days = new Date(today);
                in7Days.setDate(today.getDate() + 7);
                return cellDate <= in7Days && cellDate > today;
              case "In 15 days":
                const in15Days = new Date(today);
                in15Days.setDate(today.getDate() + 15);
                return cellDate <= in15Days && cellDate > today;
              case "30 Days":
                const in30Days = new Date(today);
                in30Days.setDate(today.getDate() + 30);
                return cellDate <= in30Days && cellDate > today;
              case "60 Days":
                const in60Days = new Date(today);
                in60Days.setDate(today.getDate() + 60);
                return cellDate <= in60Days && cellDate > today;
              case "Last 12 months":
                const lastYear = new Date(today);
                lastYear.setFullYear(today.getFullYear() - 1);
                return cellDate >= lastYear && cellDate <= today;
              default:
                return false;
            }
          },
          filterSelectOptions: [
            "Expired",
            "Today",
            "Tomorrow",
            "In 7 days",
            "In 15 days",
            "30 Days",
            "60 Days",
            // "Last 12 months",
            "Custom date",
          ],
          filterVariant: "custom",
          size: 115,
          minSize: 80,
          maxSize: 140,
          grow: false,
        },

        //  Deadline
        {
          accessorKey: "job.deadline",
          header: "Deadline",
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
            };

            const handleCustomDateChange = (e) => {
              setCustomDate(e.target.value);
              column.setFilterValue(e.target.value);
            };
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    setFilterValue("");
                    column.setFilterValue("");
                  }}
                >
                  Deadline
                </span>
                {filterValue === "Custom date" ? (
                  <input
                    type="month"
                    value={customDate}
                    onChange={handleCustomDateChange}
                    className="h-[1.8rem] font-normal w-full   cursor-pointer rounded-md border border-gray-200 outline-none"
                  />
                ) : (
                  <select
                    value={filterValue}
                    onChange={handleFilterChange}
                    className="h-[1.8rem] font-normal w-full  cursor-pointer rounded-md border border-gray-200 outline-none"
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
            const deadline = row.original.job.deadline;
            const [date, setDate] = useState(() => {
              const cellDate = new Date(cell.getValue());
              return cellDate.toISOString().split("T")[0];
            });

            const [showDeadline, setShowDeadline] = useState(false);

            const handleDateChange = (newDate) => {
              const date = new Date(newDate);
              // Check if the date is valid
              if (isNaN(date.getTime())) {
                toast.error("Please enter a valid date.");
                return;
              }
              setDate(newDate);
              handleUpdateSubscription(row.original._id, newDate, "deadline");
              setShowDeadline(false);
            };

            const cellDate = new Date(date);
            const today = new Date();
            const isExpired = cellDate < today;

            return (
              <div className="w-full ">
                {!showDeadline ? (
                  <p onDoubleClick={() => setShowDeadline(true)}>
                    {deadline && format(new Date(deadline), "dd-MMM-yyyy")}
                  </p>
                ) : (
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onBlur={(e) => handleDateChange(e.target.value)}
                    className={`h-[2rem] cursor-pointer w-full text-center rounded-md border border-gray-200 outline-none ${
                      isExpired ? "text-red-500" : ""
                    }`}
                  />
                )}
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
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

            // Other filter cases
            const today = new Date();
            const startOfToday = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );

            switch (filterValue) {
              case "Expired":
                return cellDate < startOfToday;
              case "Today":
                return cellDate.toDateString() === today.toDateString();
              case "Tomorrow":
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                return cellDate.toDateString() === tomorrow.toDateString();
              case "In 7 days":
                const in7Days = new Date(today);
                in7Days.setDate(today.getDate() + 7);
                return cellDate <= in7Days && cellDate > today;
              case "In 15 days":
                const in15Days = new Date(today);
                in15Days.setDate(today.getDate() + 15);
                return cellDate <= in15Days && cellDate > today;
              case "30 Days":
                const in30Days = new Date(today);
                in30Days.setDate(today.getDate() + 30);
                return cellDate <= in30Days && cellDate > today;
              case "60 Days":
                const in60Days = new Date(today);
                in60Days.setDate(today.getDate() + 60);
                return cellDate <= in60Days && cellDate > today;
              case "Last 12 months":
                const lastYear = new Date(today);
                lastYear.setFullYear(today.getFullYear() - 1);
                return cellDate >= lastYear && cellDate <= today;
              default:
                return false;
            }
          },
          filterSelectOptions: [
            "Expired",
            "Today",
            "Tomorrow",
            "In 7 days",
            "In 15 days",
            "30 Days",
            "60 Days",
            // "Last 12 months",
            "Custom date",
          ],
          filterVariant: "custom",
          size: 115,
          minSize: 80,
          maxSize: 140,
          grow: false,
        },
        //  -----Due & Over Due Status----->
        {
          accessorKey: "state",
          Header: ({ column }) => {
            const dateStatus = ["Overdue", "Due"];
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="ml-1 cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Status
                </span>
                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal ml-1 h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {dateStatus?.map((status, i) => (
                    <option key={i} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            );
          },
          Cell: ({ row }) => {
            const status = getStatus(
              row.original.job.deadline,
              row.original.job.billingEnd
            );

            return (
              <div className="w-full ">
                <span
                  className={`text-white   rounded-[2rem] ${
                    status === "Due"
                      ? "bg-green-500  py-[6px] px-4 "
                      : status === "Overdue"
                      ? "bg-red-500  py-[6px] px-3 "
                      : "bg-transparent"
                  }`}
                >
                  {status}
                </span>
              </div>
            );
          },
          filterFn: (row, id, filterValue) => {
            const status = getStatus(
              row.original.job.deadline,
              row.original.job.billingEnd
            );
            if (status === undefined || status === null) return false;
            return (
              status.toString().toLowerCase() === filterValue.toLowerCase()
            );
          },
          filterSelectOptions: ["Overdue", "Due"],
          filterVariant: "select",
          size: 100,
          minSize: 70,
          maxSize: 120,
          grow: false,
        },
        // Fee
        {
          accessorKey: "job.fee",
          Header: ({ column }) => {
            return (
              <div className=" flex flex-col gap-[2px] w-[5.5rem] items-center justify-center pr-2 ">
                <span
                  className="ml-1 w-full text-center cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Fee
                </span>
                <span className="font-medium w-full text-center  px-1 py-1 rounded-md bg-gray-50 text-black">
                  {totalFee}
                </span>
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const fee = row.original.job.fee;
            const [showFee, setShowFee] = useState(false);
            const [newFee, setNewFee] = useState(fee);

            const handleDateChange = () => {
              handleUpdateSubscription(row.original._id, newFee, "fee");
              setShowFee(false);
            };

            return (
              <div className="w-full flex items-center justify-center">
                {showFee ? (
                  <form onSubmit={handleDateChange}>
                    <input
                      type="text"
                      value={newFee}
                      onChange={(e) => setNewFee(e.target.value)}
                      className="h-[2rem] w-full rounded-md border border-orange-200 px-1 outline-none"
                    />
                  </form>
                ) : (
                  <span
                    className="text-[15px] font-medium"
                    onDoubleClick={() => setShowFee(true)}
                  >
                    {fee}
                  </span>
                )}
              </div>
            );
          },
          filterFn: "equals",
          size: 90,
        },
        //  --- Note--->
        {
          accessorKey: "note",
          minSize: 200,
          maxSize: 500,
          size: 350,
          grow: false,
          Header: ({ column }) => {
            useEffect(() => {
              column.setFilterValue("");

              // eslint-disable-next-line
            }, [subscriptionData]);
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
                  onChange={(e) => {
                    column.setFilterValue(e.target.value);
                  }}
                  className="font-normal h-[1.8rem] w-[340px] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                />
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const note = row.original.note;
            const [show, setShow] = useState(false);
            const [localNote, setLocalNote] = useState(note);

            const handleNote = () => {
              handleUpdateSubscription(row.original._id, localNote, "note");
              setShow(false);
            };

            return (
              <div className="w-full px-1">
                {show ? (
                  <form onSubmit={handleNote}>
                    <input
                      type="text"
                      value={localNote}
                      autoFocus
                      onChange={(e) => setLocalNote(e.target.value)}
                      className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
                    />
                  </form>
                ) : (
                  <div
                    onDoubleClick={() => setShow(true)}
                    className="cursor-pointer w-full"
                  >
                    {note ? (
                      note
                    ) : (
                      <div className="text-white w-full h-full">.</div>
                    )}
                  </div>
                )}
              </div>
            );
          },
          filterFn: (row, columnId, filterValue) => {
            const cellValue =
              row.original[columnId]?.toString().toLowerCase() || "";
            return cellValue.includes(filterValue.toLowerCase());
          },
          filterVariant: "select",
        },
        {
          accessorKey: "status",
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
                  Job Status
                </span>
                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] ml-1 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {states?.map((status, i) => (
                    <option key={i} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const statusValue = cell.getValue();

            return (
              <select
                value={statusValue}
                onChange={(e) =>
                  handleUpdateSubscription(
                    row.original._id,
                    e.target.value,
                    "status"
                  )
                }
                className="w-[6rem] h-[2rem] rounded-md border border-sky-300 outline-none"
              >
                <option value="empty"></option>
                {states?.map((stat) => (
                  <option value={stat}>{stat}</option>
                ))}
              </select>
            );
          },
          // filterFn: "equals",
          filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue(columnId);
            return (cellValue || "").toString() === filterValue.toString();
          },
          filterSelectOptions: [
            "Data",
            "Progress",
            "Queries",
            "Approval",
            "Submission",
          ],
          filterVariant: "select",
          size: 110,
          grow: false,
        },
        {
          accessorKey: "job.lead",
          Header: ({ column }) => {
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="  cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Manager
                </span>
                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] w-full cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {userName?.map((lead, i) => (
                    <option key={i} value={lead}>
                      {lead}
                    </option>
                  ))}
                </select>
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const leadValue = cell.getValue();

            return (
              <div className="w-full">
                <select
                  value={leadValue || ""}
                  onChange={(e) =>
                    handleUpdateSubscription(
                      row.original._id,
                      e.target.value,
                      "lead"
                    )
                  }
                  className="w-full h-[2rem] rounded-md border-none bg-transparent outline-none"
                >
                  <option value="empty"></option>
                  {userName.map((lead, i) => (
                    <option value={lead} key={i}>
                      {lead}
                    </option>
                  ))}
                </select>
              </div>
            );
          },
          filterFn: "equals",
          filterSelectOptions: userName.map((lead) => lead),
          filterVariant: "select",
          size: 110,
          minSize: 70,
          maxSize: 140,
          grow: false,
        },
        {
          accessorKey: "subscription",
          Header: ({ column }) => {
            return (
              <div className=" flex flex-col gap-[2px]">
                <span
                  className="  cursor-pointer"
                  title="Clear Filter"
                  onClick={() => {
                    column.setFilterValue("");
                  }}
                >
                  Subscription
                </span>
                <select
                  value={column.getFilterValue() || ""}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="font-normal h-[1.8rem] w-full cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
                >
                  <option value="">Select</option>
                  {subscriptions?.map((sub, i) => (
                    <option key={i} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            );
          },
          Cell: ({ cell, row }) => {
            const subscription = cell.getValue();

            return (
              <div className="w-full">
                <select
                  value={subscription || ""}
                  onChange={(e) =>
                    handleUpdateSubscription(
                      row.original._id,
                      e.target.value,
                      "subscription"
                    )
                  }
                  className="w-full h-[2rem] rounded-md border-none bg-transparent outline-none"
                >
                  <option value="empty"></option>
                  {subscriptions.map((sub, i) => (
                    <option value={sub} key={i}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            );
          },
          filterFn: "equals",
          filterSelectOptions: subscriptions.map((sub) => sub),
          filterVariant: "select",
          size: 110,
          minSize: 70,
          maxSize: 140,
          grow: false,
        },
        ...(auth?.user?.role?.name === "Admin"
          ? [
              {
                accessorKey: "actions",
                header: "Actions",
                Cell: ({ cell, row }) => {
                  const subId = row.original._id;
                  return (
                    <div className="flex items-center justify-center gap-3 w-full h-full">
                      <span
                        className="text-[1rem] cursor-pointer"
                        title="Edit this column"
                        onClick={() => {
                          setSubscriptionId(subId);
                          setShow(true);
                        }}
                      >
                        <AiOutlineEdit className="h-5 w-5 text-cyan-600 " />
                      </span>

                      <span
                        className="text-[1rem] cursor-pointer"
                        title="Delete Task!"
                        onClick={() => handleDeleteConfirmation(subId)}
                      >
                        <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600 " />
                      </span>
                    </div>
                  );
                },
                size: 60,
              },
            ]
          : []),
      ],
      // eslint-disable-next-line
      [users, auth, subscriptionData, filterData, totalFee]
    );

    // Clear table Filter
    // Clear table Filter
    const handleClearFilters = () => {
      table.setColumnFilters([]);

      table.setGlobalFilter("");
    };

    useImperativeHandle(ref, () => ({
      handleClearFilters,
    }));

    const table = useMaterialReactTable({
      columns,
      data: subscriptionData,
      getRowId: (originalRow) => originalRow.id,
      // enableRowSelection: true,
      enableStickyHeader: true,
      enableStickyFooter: true,
      columnFilterDisplayMode: "popover",
      muiTableContainerProps: { sx: { maxHeight: "850px" } },
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
        pagination: { pageSize: 25 },
        pageSize: 20,
        density: "compact",
      },

      muiTableHeadCellProps: {
        style: {
          fontWeight: "600",
          fontSize: "14px",
          background: "#FB923C",
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
    });

    useEffect(() => {
      const filteredRows = table
        .getFilteredRowModel()
        .rows.map((row) => row.original);

      console.log("Filtered Data:", filteredRows);
      setFilterData(filteredRows);
      // eslint-disable-next-line
    }, [table.getFilteredRowModel().rows]);

    return (
      <>
        <div className=" relative w-full h-[100%] overflow-y-auto  pb-[2rem]">
          <>
            {loading ? (
              <div className="flex items-center justify-center w-full h-screen px-4 py-4">
                <Loader />
              </div>
            ) : (
              <div className="w-full min-h-[20vh] relative border-t border-gray-300">
                <div className="h-full hidden1 overflow-y-scroll relative">
                  <MaterialReactTable table={table} />
                </div>
              </div>
            )}
          </>

          {/*----------Add/Edit Subscription--------- */}
          {show && (
            <div className="fixed top-0 left-0 w-full h-[100%] z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
              <SubscriptionModel
                setIsOpen={setShow}
                fetchSubscriptions={fetchSubscriptions}
                subscriptionId={subscriptionId}
                setSubscriptionId={setSubscriptionId}
              />
            </div>
          )}
        </div>
      </>
    );
  }
);

export default Subscriptions;
