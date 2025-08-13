import React, { useEffect, useMemo, useRef, useState } from "react";

import { style } from "../../utlis/CommonStyle";
import { IoBriefcaseOutline, IoClose, IoTicketOutline } from "react-icons/io5";
import SubscriptionModel from "../../components/SubscriptionModel";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";

import toast from "react-hot-toast";
import { format, set } from "date-fns";
import { AiOutlineEdit, AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import DataLabel from "./DataLabel";
import { TbLoader2 } from "react-icons/tb";
import QuickAccess from "../../utlis/QuickAccess";
import { useSelector } from "react-redux";
import { Popover, Typography } from "@mui/material";
import TicketsPopUp from "../../components/shared/TicketsPopUp";
import { FiPlusSquare } from "react-icons/fi";
import NewTicketModal from "../../utlis/NewTicketModal";
import ActionsCell from "./ActionsCell";

export default function Subscription() {
  const auth = useSelector((state) => state.auth.auth);
  const [show, setShow] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [filterData, setFilterData] = useState([]);
  const [totalFee, setTotalFee] = useState(0);
  //
  const subscriptions = ["Weekly", "Monthly", "Quarterly", "Yearly"];
  const states = ["Paid", "Unpaid", "On Hold", "Not Due"];
  const [showDataLabel, setShowDataLable] = useState(false);
  const [dataLable, setDataLabel] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  // Bulk Change State
  const [isUpload, setIsUpdate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [jobHolder, setJobHolder] = useState("");
  const [lead, setLead] = useState("");
  const [billingStart, setBillingStart] = useState("");
  const [billingEnd, setBillingEnd] = useState("");
  const [deadline, setDeadline] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [dataLabelId, setDataLabelId] = useState("");
  const [source, setSource] = useState("");
  const [fee, setFee] = useState("");
  const sources = ["FIV", "UPW", "PPH", "Website", "Direct", "Partner"];

  console.log("rowSelection:", rowSelection);

  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [clientCompanyName, setClientCompanyName] = useState("");

  const [showExternalFilters, setShowExternalFilters] = useState(true);
  const [filter1, setFilter1] = useState("");
  const [filter2, setFilter2] = useState("");
  const [filter3, setFilter3] = useState("");

  // -------Get Subscription Data-------
  const getAllSubscriptions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/subscriptions/fetch/all`
      );
      if (data) {
        setSubscriptionData(data.subscriptions);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllSubscriptions();
  }, []);

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

  //   Get All Data Labels
  const getDatalable = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/label/subscription/labels`
      );
      if (data.success) {
        setDataLabel(data.labels);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDatalable();
  }, []);

  // Update data Label
  const addDatalabel = async (id, labelId) => {
    // console.log("Data:", id, labelId);
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/subscriptions/lable/${id}`,
        { labelId }
      );
      if (data) {
        fetchSubscriptions();
        toast.success("New Data label added!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error while add label");
    }
  };

  // --------------Update JobHolder------------>
  const handleUpdateSubscription = async (id, value, type) => {
    const allowedFields = [
      "jobHolder",
      "billingStart",
      "billingEnd",
      "deadline",
      "lead",
      "fee",
      "note",
      "status",
      "subscription",
    ];

    if (!allowedFields.includes(type)) {
      toast.error("Invalid field for update");
      return;
    }

    // Build the update object dynamically
    const updateObj = { [type]: value };

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/subscriptions/update/single/${id}`,
        updateObj
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

  // --------------Update JobHolder------------>
  // const handleUpdateSubscription = async (id, value, type) => {

  //   try {
  //     const { data } = await axios.put(
  //       `${process.env.REACT_APP_API_URL}/api/v1/subscriptions/update/single/${id}`,
  //       {
  //         jobHolder: type === "jobholder" && value,
  //         billingStart: type === "billingStart" && value,
  //         billingEnd: type === "billingEnd" && value,
  //         deadline: type === "deadline" && value,
  //         lead: type === "lead" && value,
  //         fee: type === "fee" && value,
  //         note: type === "note" && value,
  //         status: type === "status" && value,
  //         subscription: type === "subscription" && value,
  //       }
  //     );
  //     if (data) {
  //       fetchSubscriptions();
  //       toast.success("Subscription updated.");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error?.response?.data?.message);
  //   }
  // };

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
      return "Upcoming";
    }
  };

  // Get Total Fee

  useEffect(() => {
    // const calculateTotalHours = (data) => {
    //   return data.reduce((sum, client) => {

    //     if(!client.job || !client.job.fee) {
    //       return sum; // Skip if job or fee is not available
    //     }
    //     return sum + Number(client.job.fee)

    //   }, 0);
    // };

    const calculateTotalHours = (data) => {
      return data.reduce((sum, client) => {
        const fee = client?.job?.fee;

        // Check if fee exists and is a string containing only digits
        if (typeof fee === "string" && /^\d+$/.test(fee)) {
          return sum + Number(fee);
        }

        // Skip if fee is not a valid numeric string
        return sum;
      }, 0);
    };

    console.log("TOTAL FEEE💛🧡:", calculateTotalHours(subscriptionData));

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
        Swal.fire("Deleted!", "Your subscription has been deleted.", "success");
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
            <div className="cursor-pointer text-[#0078c8] hover:text-[#0053c8] w-full h-full flex items-center justify-start">
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
                Assign
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
      // {
      //   accessorKey: "totalHours",
      //   Header: ({ column }) => {
      //     return (
      //       <div className=" flex flex-col gap-[2px] w-[5.5rem] items-center justify-center pr-2 ">
      //         <span
      //           className="ml-1 w-full text-center cursor-pointer"
      //           title="Clear Filter"
      //           onClick={() => {
      //             column.setFilterValue("");
      //           }}
      //         >
      //           Hrs
      //         </span>
      //         <span className="font-medium w-full text-center  px-1 py-1 rounded-md bg-gray-300/30 text-black">
      //           {totalHours}
      //         </span>
      //         {/* <input
      //           type="search"
      //           value={column.getFilterValue() || ""}
      //           onChange={(e) => column.setFilterValue(e.target.value)}
      //           className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
      //         /> */}
      //       </div>
      //     );
      //   },
      //   Cell: ({ cell, row }) => {
      //     const hours = cell.getValue();
      //     return (
      //       <div className="w-full flex items-center justify-center">
      //         <span className="text-[15px] font-medium">{hours}</span>
      //       </div>
      //     );
      //   },
      //   filterFn: "equals",
      //   size: 90,
      // },
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
      {
        accessorKey: "Months",
        Header: ({ column }) => {
          return (
            <div className="w-full flex flex-col gap-[2px]">
              <span
                className="cursor-pointer"
                title="Clear Filter"
                onClick={() => column.setFilterValue("")}
              >
                Time
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="border rounded px-2 py-1 text-sm outline-none"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
              />
            </div>
          );
        },
        Cell: ({ row }) => {
          const billingStart = new Date(row.original.job.billingStart);
          const billingEnd = new Date(row.original.job.billingEnd);

          if (!billingStart || !billingEnd) return <div>N/A</div>;

          const timeDifference = billingEnd.getTime() - billingStart.getTime();
          const monthDifference = (
            timeDifference /
            (1000 * 60 * 60 * 24 * 30.44)
          ).toFixed(0);

          return (
            <div className="w-full text-center">
              {monthDifference > 0 ? (
                `${monthDifference} Month${monthDifference > 1 ? "s" : ""}`
              ) : (
                <span className="text-red-500">Expired</span>
              )}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const billingStart = new Date(row.original.job.billingStart);
          const billingEnd = new Date(row.original.job.billingEnd);

          if (!billingStart || !billingEnd) return false;

          const timeDifference = billingEnd.getTime() - billingStart.getTime();
          const monthDifference = (
            timeDifference /
            (1000 * 60 * 60 * 24 * 30.44)
          ).toFixed(0);

          return monthDifference.toString().includes(filterValue);
        },
        enableColumnFilter: true,
        size: 90,
        minSize: 60,
        maxSize: 120,
        grow: false,
      },
      //  -----Due & Over Due Status----->
      {
        accessorKey: "state",
        Header: ({ column }) => {
          const dateStatus = ["Overdue", "Due", "Upcoming"];
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
                    : "bg-gray-400  py-[6px] px-3"
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
          return status.toString().toLowerCase() === filterValue.toLowerCase();
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
              {/* <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              /> */}
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const fee = row.original.job.fee;
          const [showFee, setShowFee] = useState(false);
          const [newFee, setNewFee] = useState(fee);

          const inputRef = useRef(null);

          useEffect(() => {
            if (showFee && inputRef?.current) {
              inputRef.current.focus();
            }
          }, [showFee]);

          const handleDateChange = () => {
            handleUpdateSubscription(row.original._id, newFee, "fee");
            setShowFee(false);
          };

          return (
            <div className="w-full flex items-center justify-center">
              {showFee ? (
                <form onSubmit={handleDateChange}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    className="h-[2rem] w-full rounded-md border border-orange-200 px-1 outline-none"
                  />
                </form>
              ) : (
                <span
                  className="text-[15px] font-medium cursor-pointer"
                  onDoubleClick={() => setShowFee(true)}
                >
                  {fee ? (
                    fee
                  ) : (
                    <span className="text-gray-400 cursor-pointer">
                      <AiOutlineEdit />
                    </span>
                  )}
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
        minSize: 220,
        maxSize: 500,
        size: 220,
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
                Note
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                }}
                className="font-normal h-[1.8rem] w-[200px] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
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
                    note.length > 32 ? (
                      note.slice(0, 32) + " ..."
                    ) : (
                      note
                    )
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
                Owner
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
      // Data Label
      {
        id: "Data",
        accessorKey: "data",

        Header: ({ column }) => {
          return (
            <div className="flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                POC
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {dataLable?.map((label, i) => (
                  <option key={i} value={label?.name}>
                    {label?.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },

        Cell: ({ cell, row }) => {
          const [show, setShow] = useState(false);
          const jobLabel = row.original.data || {};
          const { name, color, _id } = jobLabel;

          const handleLabelChange = (labelName) => {
            const selectedLabel = dataLable.find(
              (label) => label._id === labelName
            );
            console.log("selectedLabel:", selectedLabel);
            if (selectedLabel) {
              addDatalabel(row.original._id, labelName);
            } else {
              addDatalabel(row.original._id, "");
            }
            setShow(false);
          };

          return (
            <div className="w-full flex items-start ">
              {show ? (
                <select
                  value={_id || ""}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full h-[2rem] rounded-md border-none outline-none"
                >
                  <option value=".">Select Label</option>
                  {dataLable?.map((label, i) => (
                    <option value={label?._id} key={i}>
                      {label?.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  className="cursor-pointer h-full min-w-full "
                  onDoubleClick={() => setShow(true)}
                >
                  {name ? (
                    <span
                      className={`label relative  rounded-md hover:shadow  cursor-pointer text-black ${
                        color === "#fff"
                          ? "text-gray-950 py-[4px] px-0"
                          : "text-white py-[4px] px-2"
                      }`}
                      style={{ background: `${color}` }}
                    >
                      {name}
                    </span>
                  ) : (
                    <span
                      className={`label relative py-[4px] px-2 rounded-md hover:shadow  cursor-pointer text-white`}
                      // style={{ background: `${color}` }}
                    >
                      .
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        },

        filterFn: (row, columnId, filterValue) => {
          const labelName = row.original?.data?.name || "";
          return labelName === filterValue;
        },

        filterVariant: "select",
        filterSelectOptions: dataLable.map((label) => label.name),
        size: 80,
        minSize: 80,
        maxSize: 180,
        grow: false,
      },
      ...(auth?.user?.role?.name === "Admin"
        ? [
            {
              accessorKey: "actions",
              header: "Actions",
              Cell: ({ row }) => (
                <ActionsCell
                  row={row}
                  setSubscriptionId={setSubscriptionId}
                  setShow={setShow}
                  handleDeleteConfirmation={handleDeleteConfirmation}
                  setClientCompanyName={setClientCompanyName}
                  setShowNewTicketModal={setShowNewTicketModal}
                />
              ),
              size: 160,
            },
          ]
        : []),
    ],
    // eslint-disable-next-line
    [users, auth, subscriptionData, filterData, totalFee]
  );

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");

    setFilter1("");
    setFilter2("");
    setFilter3("");
  };

  const table = useMaterialReactTable({
    columns,
    data: subscriptionData,
    getRowId: (row) => row._id,
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
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    // enableEditing: true,
    // state: { isLoading: loading },

    enablePagination: true,
    initialState: {
      pagination: { pageSize: 50 },
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
        // border: "1px solid rgba(81, 81, 81, .5)",
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

    setFilterData(filteredRows);
    // eslint-disable-next-line
  }, [table.getFilteredRowModel().rows]);

  // -------Update Bulk Jobs------------->

  const updateBulkJob = async (e) => {
    e.preventDefault();
    setIsUpdate(true);
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/subscriptions/multiple/updates`,
        {
          rowSelection: Object.keys(rowSelection).filter(
            (id) => rowSelection[id] === true
          ),
          jobHolder,
          lead,
          billingStart,
          billingEnd,
          deadline,
          jobStatus,
          dataLabelId,
          source,
          fee,
        }
      );

      if (data) {
        fetchSubscriptions();
        setIsUpdate(false);
        setShowEdit(false);
        setRowSelection({});
        setJobHolder("");
        setLead("");
        setBillingStart("");
        setBillingEnd("");
        setDeadline("");
        setJobStatus("");
        setDataLabelId("");
        setSource("");
        setFee("");
      }
    } catch (error) {
      setIsUpdate(false);
      console.log(error?.response?.data?.message);
      toast.error("Something went wrong!");
    } finally {
      setIsUpdate(false);
    }
  };

  const col = table.getColumn("subscription");

 

  const setColumnFromOutsideTable = (colKey, filterVal) => {
    const col = table.getColumn(colKey);

     
    return col.setFilterValue(filterVal);
  };

  return (
    <>
      <div className=" relative w-full h-[100%] overflow-y-auto py-4 px-2 sm:px-4 pb-[2rem]">
        <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 ">
          <div className="flex items-center gap-5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              Subscription's
            </h1>

            <span
              className={`p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400 mb-1 hover:rotate-180 `}
              onClick={() => {
                handleClearFilters();
              }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6 text-white" />
            </span>

            <span className="mt-2">
              <QuickAccess />
            </span>

            <span
              className={` p-1 rounded-md hover:shadow-md bg-gray-50 mb-1  cursor-pointer border ${
                showExternalFilters && "bg-orange-500 text-white "
              }  `}
              onClick={() => {
                // setActiveBtn("jobHolder");
                // setShowJobHolder(!showJobHolder);
                setShowExternalFilters(!showExternalFilters);
              }}
              title="Filter by Job Holder"
            >
              <IoBriefcaseOutline className="h-6 w-6  cursor-pointer " />
            </span>
          </div>

          {/* ---------Buttons ------*/}
          <div className="flex items-center gap-4">
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShowEdit(!showEdit)}
              style={{ padding: ".4rem 1rem" }}
            >
              Edit All
            </button>
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShowDataLable(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Add Data
            </button>
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShow(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              New Subscription
            </button>
          </div>
        </div>

        {/* --------------External Filter---------------- */}
        {showExternalFilters && (
          <div className="w-full flex flex-row items-start justify-start gap-4 mt-4">
            <div className="flex items-center gap-2">
              {/* <span className="text-sm font-semibold text-gray-700">
                  Job Holder
                </span> */}
              <ul className="flex items-center gap-2 list-none  ">
                {subscriptions.map((sub, i) => (
                  <li
                    key={i}
                    className={`${
                      filter1 === sub
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    } px-2 py-1 rounded-md cursor-pointer   m-0`}
                    onClick={() => {
                      setFilter1((prev) => {
                        const isSameUser = prev === sub;
                        const newValue = isSameUser ? "" : sub;

                        setColumnFromOutsideTable("subscription", newValue);
                        return newValue;
                      });
                    }}
                  >
                    {sub}
                  </li>
                ))}
              </ul>
            </div>

            <span>|</span>

            <div className="flex items-center gap-2">
              {/* <span className="text-sm font-semibold text-gray-700">
                  Job Holder
                </span> */}
              <ul className="flex items-center gap-2 list-none  ">
                {["Due", "Overdue"].map((el, i) => (
                  <li
                    key={i}
                    className={`${
                      filter2 === el
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    } px-2 py-1 rounded-md cursor-pointer  m-0 `}
                    onClick={() => {
                      setFilter2((prev) => {
                        const isSameUser = prev === el;
                        const newValue = isSameUser ? "" : el;

                        setColumnFromOutsideTable("state", newValue);
                        return newValue;
                      });
                    }}
                  >
                    {el}
                  </li>
                ))}
              </ul>
            </div>

            <span>|</span>

            <div className="flex items-center gap-2">
              {/* <span className="text-sm font-semibold text-gray-700">
                  Job Holder
                </span> */}
              <ul className="flex items-center gap-2 list-none  ">
                {userName?.map((user, i) => (
                  <li
                    key={i}
                    className={`${
                      filter3 === user
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    } px-2 py-1 rounded-md cursor-pointer m-0 `}
                    onClick={() => {
                      setFilter3((prev) => {
                        const isSameUser = prev === user;
                        const newValue = isSameUser ? "" : user;

                        setColumnFromOutsideTable("job.jobHolder", newValue);
                        return newValue;
                      });
                    }}
                  >
                    {user}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Update Bulk Jobs */}
        {showEdit && (
          <div className="w-full mt-4 py-2">
            <form
              onSubmit={updateBulkJob}
              className="w-full flex items-center flex-wrap gap-2 "
            >
              <div className="">
                <select
                  value={jobHolder}
                  onChange={(e) => setJobHolder(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "7rem" }}
                >
                  <option value="empty">Assign</option>
                  {users.map((jobHold, i) => (
                    <option value={jobHold.name} key={i}>
                      {jobHold.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="">
                <select
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "7rem" }}
                >
                  <option value="empty">Owner</option>
                  {users.map((jobHold, i) => (
                    <option value={jobHold.name} key={i}>
                      {jobHold.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="inputBox" style={{ width: "8.5rem" }}>
                <input
                  type="date"
                  value={billingStart}
                  onChange={(e) => setBillingStart(e.target.value)}
                  className={`${style.input} w-full `}
                />
                <span>Billing Start</span>
              </div>
              <div className="inputBox" style={{ width: "8.5rem" }}>
                <input
                  type="date"
                  value={billingEnd}
                  onChange={(e) => setBillingEnd(e.target.value)}
                  className={`${style.input} w-full `}
                />
                <span>Billing End</span>
              </div>
              <div className="inputBox" style={{ width: "8.5rem" }}>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={`${style.input} w-full `}
                />
                <span>Deadline</span>
              </div>
              {/*  */}
              <div className="">
                <select
                  value={jobStatus}
                  onChange={(e) => setJobStatus(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "6.5rem" }}
                >
                  <option value="empty">Status</option>
                  {states.map((stat, i) => (
                    <option value={stat} key={i}>
                      {stat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="">
                <select
                  value={dataLabelId}
                  onChange={(e) => setDataLabelId(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "9rem" }}
                >
                  <option value=".">Select Data</option>
                  {dataLable?.map((label, i) => (
                    <option key={i} value={label?._id}>
                      {label?.name}
                    </option>
                  ))}
                </select>
              </div>
              {auth?.user?.role?.name === "Admin" && (
                <div className="inputBox" style={{ width: "6rem" }}>
                  <input
                    type="text"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className={`${style.input} w-full `}
                  />
                  <span>Fee</span>
                </div>
              )}

              {/* {auth?.user?.role?.name === "Admin" && (
                <div className="">
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className={`${style.input} w-full`}
                    style={{ width: "8rem" }}
                  >
                    <option value="">Source</option>
                    {sources.map((sou, i) => (
                      <option value={sou} key={i}>
                        {sou}
                      </option>
                    ))}
                  </select>
                </div>
              )} */}

              <div className="flex items-center justify-end pl-4">
                <button
                  className={`${style.button1} text-[15px] `}
                  type="submit"
                  disabled={isUpload}
                  style={{ padding: ".5rem 1rem" }}
                >
                  {isUpload ? (
                    <TbLoader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <span>Save</span>
                  )}
                </button>
              </div>
            </form>
            <hr className="mb-1 bg-gray-300 w-full h-[1px] mt-4" />
          </div>
        )}
        {!showEdit && <hr className="w-full h-[1px] bg-gray-300 my-4" />}
        <>
          {loading ? (
            <div className="flex items-center justify-center w-full h-screen px-4 py-4">
              <Loader />
            </div>
          ) : (
            <div className="w-full min-h-[20vh] relative ">
              <div className="h-full hidden1 overflow-y-auto relative">
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
        {/*  */}
        {/* ---------------Add Data label------------- */}
        {showDataLabel && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
            <DataLabel
              setShowDataLable={setShowDataLable}
              getDatalable={getDatalable}
            />
          </div>
        )}

        {/* ---------------New Ticket Modal------------- */}
        {showNewTicketModal && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/70 flex items-center justify-center">
            <NewTicketModal
              setShowSendModal={setShowNewTicketModal}
              clientCompanyName={clientCompanyName}
            />
          </div>
        )}
      </div>
    </>
  );
}
