import React, { useEffect, useMemo, useRef, useState } from "react";
import { mkConfig, generateCsv, download } from "export-to-csv";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import { format } from "date-fns";

import Layout from "../../components/Loyout/Layout";
import { style } from "../../utlis/CommonStyle";
import { IoClose } from "react-icons/io5";
import SendEmailModal from "../../components/Tickets/SendEmailModal";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import { MdCheckCircle, MdInsertComment } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import JobCommentModal from "../Jobs/JobCommentModal";

export default function Tickets() {
  const { auth } = useAuth();
  const [showSendModal, setShowSendModal] = useState(false);
  const [emailData, setEmailData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("progress");
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const companyData = ["Affotax", "Outsource"];
  const status = ["Read", "Unread", "Send"];
  const navigate = useNavigate();
  const [isComment, setIsComment] = useState(false);
  const commentStatusRef = useRef(null);
  const [commentTicketId, setCommentTicketId] = useState("");
  const [access, setAccess] = useState([]);

  console.log("Email Data", emailData);

  // Get Auth Access
  useEffect(() => {
    if (auth.user) {
      const filterAccess = auth.user.role.access
        .filter((role) => role.permission === "Tickets")
        .flatMap((jobRole) => jobRole.subRoles);

      setAccess(filterAccess);
    }
  }, [auth]);

  // -------Get All Emails-------
  const getAllEmails = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/tickets`
      );
      if (data) {
        setEmailData(data.emails);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllEmails();
  }, []);

  // With Loading
  const getEmails = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/tickets`
      );
      if (data) {
        setEmailData(data.emails);
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
          user.role?.access?.some((item) =>
            item?.permission?.includes("Tickets")
          )
        ) || []
      );

      setUserName(
        data?.users
          ?.filter((user) =>
            user.role?.access.some((item) =>
              item?.permission?.includes("Tickets")
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

  // ---------Handle Delete Task-------------

  const handleDeleteTicketConfirmation = (ticketId) => {
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
        handleDeleteTicket(ticketId);
        Swal.fire("Deleted!", "Your ticket has been deleted.", "success");
      }
    });
  };

  const handleDeleteTicket = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/delete/ticket/${id}`
      );
      if (data) {
        const filteredData = emailData?.filter((item) => item._id !== id);
        setEmailData(filteredData);

        if (filteredData) {
          const filterData1 = filteredData?.filter((item) => item._id !== id);
          setFilteredData(filterData1);
        }
        getEmails();

        toast.success("Ticket deleted successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // ------------Update Date ------------>
  const updateJobDate = async (ticketId, jobDate, jobHolder) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/update/ticket/${ticketId}`,
        { jobDate, jobHolder }
      );
      if (data) {
        const updateTicket = data?.ticket;
        toast.success("Date updated successfully!");
        if (filteredData) {
          setFilteredData((prevData) => {
            if (Array.isArray(prevData)) {
              return prevData.map((item) =>
                item._id === updateTicket._id ? updateTicket : item
              );
            } else {
              return [updateTicket];
            }
          });
        }

        setEmailData((prevData) => {
          if (Array.isArray(prevData)) {
            return prevData.map((item) =>
              item._id === updateTicket._id ? updateTicket : item
            );
          } else {
            return [updateTicket];
          }
        });

        getEmails();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  // ------------Update Status------------>
  const handleUpdateTicketStatusConfirmation = (ticketId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Complete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleStatusComplete(ticketId);
        Swal.fire(
          "Complete!",
          "Your ticket completed successfully!",
          "success"
        );
      }
    });
  };

  const handleStatusComplete = async (ticketId) => {
    if (!ticketId) {
      toast.error("Ticket id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/update/ticket/${ticketId}`,
        { state: "complete" }
      );
      if (data?.success) {
        const updateTicket = data?.ticket;
        toast.success("Status completed successfully!");

        setEmailData((prevData) =>
          prevData.filter((item) => item._id !== updateTicket._id)
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  // ------------------------Table Detail------------->

  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "companyName",
        minSize: 100,
        maxSize: 300,
        size: 280,
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
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const companyName = row.original.companyName;
          return (
            <div className="w-full px-1">
              <span>{companyName}</span>
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
        accessorKey: "clientName",
        minSize: 100,
        maxSize: 200,
        size: 160,
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
                Client Name
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const clientName = row.original.clientName;
          return (
            <div className="w-full px-1">
              <span>{clientName}</span>
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
        accessorKey: "company",
        minSize: 100,
        maxSize: 200,
        size: 120,
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
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                <option value={"Affotax"}>Affotax</option>
                <option value={"Outsource"}>Outsource</option>
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const company = row.original.company;
          return (
            <div className="w-full px-1">
              <span>{company}</span>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: companyData?.map((category) => category?.name),
        filterVariant: "select",
      },
      {
        accessorKey: "jobHolder",
        header: "Job Holder",
        Header: ({ column }) => {
          const user = auth?.user?.name;

          // useEffect(() => {
          //   column.setFilterValue(user);

          //   // eslint-disable-next-line
          // }, []);

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
                {users?.map((jobhold, i) => (
                  <option key={i} value={jobhold?.name}>
                    {jobhold?.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const jobholder = cell.getValue();
          const [show, setShow] = useState(false);
          const [employee, setEmployee] = useState(jobholder);

          return (
            <div className="w-full">
              {show ? (
                <select
                  value={employee || ""}
                  className="w-full h-[2rem] rounded-md border-none  outline-none"
                  onChange={(e) => {
                    updateJobDate(row.original._id, "", e.target.value);
                    setEmployee(e.target.value);
                    setShow(false);
                  }}
                >
                  <option value="empty"></option>
                  {users?.map((jobHold, i) => (
                    <option value={jobHold?.name} key={i}>
                      {jobHold.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  onDoubleClick={() => setShow(true)}
                  className="w-full cursor-pointer"
                >
                  {jobholder ? (
                    jobholder
                  ) : (
                    <span className="text-white">.</span>
                  )}
                </span>
              )}
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: users.map((jobhold) => jobhold.name),
        filterVariant: "select",
        size: 100,
        minSize: 80,
        maxSize: 130,
        grow: false,
      },
      {
        accessorKey: "subject",
        minSize: 200,
        maxSize: 500,
        size: 460,
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
                Subject
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] w-[380px] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const subject = row.original.subject;
          return (
            <div className="w-full px-1">
              <span
                onClick={() => navigate(`/ticket/detail/${row.original._id}`)}
                className="cursor-pointer text-blue-500 hover:text-blue-600 font-medium"
              >
                {subject}
              </span>
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
        header: "Status",
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col items-center justify-center gap-[2px]">
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
                className="font-normal h-[1.8rem] w-[80px] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {status?.map((stat, i) => (
                  <option key={i} value={stat}>
                    {stat}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const stat = cell.getValue();

          return (
            <div className="w-full flex items-center justify-center">
              <span
                className={` py-1 px-2 rounded-lg text-white ${
                  stat === "Read"
                    ? "bg-gray-500"
                    : stat === "Unread"
                    ? "bg-sky-400"
                    : "bg-green-400"
                } `}
              >
                {stat}
              </span>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: status.map((stat) => stat),
        filterVariant: "select",
        size: 90,
        minSize: 80,
        maxSize: 130,
        grow: false,
      },
      // Created Date
      {
        accessorKey: "createdAt",
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
            <div className="w-full flex flex-col gap-[2px]">
              <span
                className="cursor-pointer "
                title="Clear Filter"
                onClick={() => {
                  setFilterValue("");
                  column.setFilterValue("");
                }}
              >
                Date
              </span>

              {filterValue === "Custom date" ? (
                <input
                  type="month"
                  value={customDate}
                  onChange={handleCustomDateChange}
                  className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
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
          const createdAt = row.original.createdAt;

          console.log("createdAt", createdAt);
          return (
            <div className="w-full flex  ">
              <p>{format(new Date(createdAt), "dd-MMM-yyyy")}</p>
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
          "Custom date",
        ],
        filterVariant: "custom",
        size: 100,
        minSize: 90,
        maxSize: 110,
        grow: false,
      },
      {
        accessorKey: "jobDate",
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
            <div className="w-full flex flex-col gap-[2px]">
              <span
                className="cursor-pointer "
                title="Clear Filter"
                onClick={() => {
                  setFilterValue("");
                  column.setFilterValue("");
                }}
              >
                Job Date
              </span>

              {filterValue === "Custom date" ? (
                <input
                  type="month"
                  value={customDate}
                  onChange={handleCustomDateChange}
                  className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
                />
              ) : (
                <select
                  value={filterValue}
                  onChange={handleFilterChange}
                  className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
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
          const jobDate = row.original.jobDate;
          const [date, setDate] = useState(() => {
            const cellDate = new Date(
              cell.getValue() || "2024-09-20T12:43:36.002+00:00"
            );
            return cellDate.toISOString().split("T")[0];
          });

          const [showStartDate, setShowStartDate] = useState(false);

          const handleDateChange = (newDate) => {
            setDate(newDate);
            updateJobDate(row.original._id, newDate, "");
            setShowStartDate(false);
          };

          return (
            <div className="w-full flex  ">
              {!showStartDate ? (
                <p
                  onDoubleClick={() => setShowStartDate(true)}
                  className="w-full"
                >
                  {jobDate ? (
                    format(new Date(jobDate), "dd-MMM-yyyy")
                  ) : (
                    <span className="text-white">.</span>
                  )}
                </p>
              ) : (
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onBlur={(e) => handleDateChange(e.target.value)}
                  className={`h-[2rem] w-full cursor-pointer rounded-md border border-gray-200 outline-none `}
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
          "Custom date",
        ],
        filterVariant: "custom",
        size: 120,
        minSize: 90,
        maxSize: 120,
        grow: false,
      },
      {
        accessorKey: "comments",
        header: "Comments",
        Cell: ({ cell, row }) => {
          const comments = cell.getValue();
          const [readComments, setReadComments] = useState([]);

          useEffect(() => {
            const filterComments = comments.filter(
              (item) => item.status === "unread"
            );
            setReadComments(filterComments);
            // eslint-disable-next-line
          }, [comments]);

          return (
            <div
              className="flex items-center justify-center gap-1 relative w-full h-full"
              onClick={() => {
                setCommentTicketId(row.original._id);
                setIsComment(true);
              }}
            >
              <div className="relative">
                <span className="text-[1rem] cursor-pointer relative">
                  <MdInsertComment className="h-5 w-5 text-orange-600 " />
                </span>
                {/* {readComments?.length > 0 && (
                  <span className="absolute -top-3 -right-3 bg-green-600 rounded-full w-[20px] h-[20px] text-[12px] text-white flex items-center justify-center ">
                    {readComments?.length}
                  </span>
                )} */}
              </div>
            </div>
          );
        },
        size: 90,
      },

      // <-----Action------>
      {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ cell, row }) => {
          return (
            <div className="flex items-center justify-center gap-4 w-full h-full">
              <span
                className=""
                title="Complete Ticket"
                onClick={() => {
                  handleUpdateTicketStatusConfirmation(row.original._id);
                }}
              >
                <MdCheckCircle className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
              </span>
              <span
                className="text-[1rem] cursor-pointer"
                onClick={() => handleDeleteTicketConfirmation(row.original._id)}
                title="Delete Ticket!"
              >
                <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600 " />
              </span>
            </div>
          );
        },
        size: 100,
      },
    ],
    // eslint-disable-next-line
    [users, auth, emailData, filteredData]
  );

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);

    table.setGlobalFilter("");
    // table.resetColumnFilters();
  };

  const table = useMaterialReactTable({
    columns,
    data: emailData || [],
    enableStickyHeader: true,
    enableStickyFooter: true,
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
      pagination: { pageSize: 20 },
      pageSize: 20,
      density: "compact",
    },

    muiTableHeadCellProps: {
      style: {
        fontWeight: "600",
        fontSize: "14px",
        backgroundColor: "#FB923C",
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

  // Close Comment Box to click anywhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        commentStatusRef.current &&
        !commentStatusRef.current.contains(event.target)
      ) {
        setIsComment(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Layout>
      <div className=" relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              Tickets
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
          </div>

          {/* ---------Template Buttons */}
          <div className="flex items-center gap-4">
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShowSendModal(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              New Ticket
            </button>
          </div>
        </div>

        <>
          <div className="flex items-center  border-2 border-orange-500 rounded-sm overflow-hidden mt-5 transition-all duration-300 w-fit">
            <button
              className={`py-1 px-2 outline-none w-[6rem] transition-all duration-300   ${
                selectedTab === "progress"
                  ? "bg-orange-500 text-white border-r-2 border-orange-500"
                  : "text-black bg-gray-100"
              }`}
              onClick={() => setSelectedTab("progress")}
            >
              Progress
            </button>
            <button
              className={`py-1 px-2 outline-none transition-all duration-300 w-[6rem]  ${
                selectedTab === "complete"
                  ? "bg-orange-500 text-white"
                  : "text-black bg-gray-100 hover:bg-slate-200"
              }`}
              onClick={() => {
                setSelectedTab("complete");
                navigate("/tickets/complete");
              }}
            >
              Completed
            </button>
            {(auth?.user?.role?.name === "Admin" ||
              access.includes("Inbox")) && (
              <button
                className={`py-1 px-2 outline-none transition-all border-l-2  border-orange-500 duration-300 w-[6rem]  ${
                  selectedTab === "inbox"
                    ? "bg-orange-500 text-white"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  // setSelectedTab("inbox");
                  navigate("/tickets/inbox");
                }}
              >
                Inbox
              </button>
            )}
          </div>
          <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />
        </>

        <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />

        {/* ---------Table Detail---------- */}
        <div className="w-full h-full">
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-screen px-4 py-4">
              <Loader />
            </div>
          ) : (
            <div className="w-full min-h-[10vh] relative ">
              <div className="h-full hidden1 overflow-y-scroll relative">
                <MaterialReactTable table={table} />
              </div>
            </div>
          )}
        </div>

        {/* ---------------------Send Email Modal------------------ */}
        {showSendModal && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full py-1 bg-gray-700/70 flex items-center justify-center">
            <SendEmailModal
              setShowSendModal={setShowSendModal}
              getEmails={getEmails}
              access={access}
            />
          </div>
        )}

        {/* ------------Comment Modal---------*/}

        {isComment && (
          <div
            ref={commentStatusRef}
            className="fixed bottom-4 right-4 w-[30rem] max-h-screen z-[999]  flex items-center justify-center"
          >
            <JobCommentModal
              setIsComment={setIsComment}
              jobId={commentTicketId}
              setJobId={setCommentTicketId}
              users={userName}
              type={"ticket"}
              getTasks1={getEmails}
              page={"ticket"}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
