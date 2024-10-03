import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import Loader from "../../utlis/Loader";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import axios from "axios";
import { AiTwotoneDelete } from "react-icons/ai";
import { useAuth } from "../../context/authContext";
import { format } from "date-fns";
import { GrCopy } from "react-icons/gr";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import AddProposal from "./AddProposal";
import { CiEdit } from "react-icons/ci";

export default function Proposal() {
  const { auth } = useAuth();
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [proposalData, setProposalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [load, setLoad] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    jobHolder: "",
    subject: "",
    jobDate: "",
    deadline: "",
    source: "",
    note: "",
    status: "",
  });
  const [selectFilter, setSelectFilter] = useState("");
  const [proposalId, setProposalId] = useState("");
  const sources = ["Email", "UPW", "PPH", "Other"];
  const status = ["Proposal", "Lead", "Client"];
  const [showMail, setShowMail] = useState(false);
  const [mail, setMail] = useState("");
  const mailDetailref = useRef(null);

  console.log("filteredData:", filteredData);

  // -------Get All Leads-------
  const getAllProposal = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/proposal/fetch/proposal`
      );
      if (data) {
        setProposalData(data.proposals);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllProposal();
  }, []);

  const getProposal = async () => {
    setLoad(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/proposal/fetch/proposal`
      );
      if (data) {
        setProposalData(data.proposals);
        setIsLoading(false);
      }
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(data?.users);

      setUserName(data?.users.map((user) => user.name));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  //   Create Copy Proposal
  const handleCopyProposal = async (id) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/proposal/copy/proposal/${id}`
      );
      if (data) {
        setProposalData((prevData) =>
          prevData ? [...prevData, data.proposal] : [data.proposal]
        );
        getProposal();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //  ---------- Update Lead Status------>
  const handleLeadStatus = (leadId, status) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this job!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleUpdateStatus(leadId, status);
        Swal.fire(
          "Updated!",
          `Your lead ${status || "Update"} successfully!.`,
          "success"
        );
      }
    });
  };
  const handleUpdateStatus = async (leadId, status) => {
    if (!leadId) {
      toast.error("Lead id is required!");
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/update/lead/${leadId}`,
        { status: status }
      );
      if (data?.success) {
        const updateProposal = data?.proposal;

        setProposalData((prevData) =>
          prevData.filter((item) => item._id !== updateProposal._id)
        );
        if (filteredData) {
          setFilteredData((prevData) =>
            prevData.filter((item) => item._id !== updateProposal._id)
          );
        }
        getProposal();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  //  ------------Delete Lead------------>
  const handleDeleteLeadConfirmation = (propId) => {
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
        handleDeleteProposal(propId);
        Swal.fire("Deleted!", "Your proposal has been deleted.", "success");
      }
    });
  };

  const handleDeleteProposal = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/proposal/delete/proposal/${id}`
      );
      if (data) {
        const filteredData = proposalData?.filter((item) => item._id !== id);
        setProposalData(filteredData);

        if (filteredData) {
          const filterData1 = filteredData?.filter((item) => item._id !== id);
          setFilteredData(filterData1);
        }
        getProposal();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //   Update Form Data
  const handleUpdateData = async (propId, updateData) => {
    if (!propId) {
      toast.error("Proposal id is required!");
      return;
    }

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/proposal/update/proposal/${propId}`,
        { ...updateData }
      );
      if (data?.success) {
        const updateProposal = data?.proposal;

        setProposalData((prevData) =>
          prevData.filter((item) => item._id !== updateProposal._id)
        );
        if (filteredData) {
          setFilteredData((prevData) =>
            prevData.filter((item) => item._id !== updateProposal._id)
          );
        }
        setFormData({
          clientName: "",
          jobHolder: "",
          jobDate: "",
          deadline: "",
          source: "",
          note: "",
          status: "",
        });
        toast.success("Proposal data updated!");
        getProposal();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  //   ------------------------Table Data----------->
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  const columns = useMemo(
    () => [
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
                  setSelectFilter("");
                }}
              >
                Job Holder
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                  setSelectFilter(e.target.value);
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
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const jobholder = row.original.jobHolder;
          const [localJobholder, setLocalJobholder] = useState(jobholder || "");
          const [show, setShow] = useState(false);

          const handleChange = (e) => {
            const selectedValue = e.target.value;
            setLocalJobholder(selectedValue);

            setFormData((prevData) => ({
              ...prevData,
              jobHolder: localJobholder,
            }));

            handleUpdateData(row.original._id, {
              ...formData,
              jobHolder: selectedValue,
            });
            setShow(false);
          };

          return (
            <div className="w-full">
              {show ? (
                <select
                  value={localJobholder || ""}
                  className="w-full h-[2rem] rounded-md border-none  outline-none"
                  onChange={handleChange}
                >
                  <option value="empty"></option>
                  {users?.map((jobHold, i) => (
                    <option value={jobHold?.name} key={i}>
                      {jobHold.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  className="w-full cursor-pointer"
                  onDoubleClick={() => setShow(true)}
                >
                  {jobholder ? (
                    <span>{jobholder}</span>
                  ) : (
                    <span className="text-white">.</span>
                  )}
                </div>
              )}
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: users.map((jobhold) => jobhold.name),
        filterVariant: "select",
        size: 110,
        minSize: 80,
        maxSize: 130,
        grow: false,
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
                  setSelectFilter("");
                }}
              >
                Client Name
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                  setSelectFilter(e.target.value);
                }}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const clientName = row.original.clientName;
          const [show, setShow] = useState(false);
          const [localClientName, setLocalClientName] = useState(clientName);

          const handleSubmit = (e) => {
            e.preventDefault();
            setFormData((prevData) => ({
              ...prevData,
              clientName: localClientName,
            }));

            handleUpdateData(row.original._id, {
              ...formData,
              clientName: localClientName,
            });

            setShow(false);
          };

          return (
            <div className="w-full px-1">
              {show ? (
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    value={localClientName}
                    autoFocus
                    onChange={(e) => setLocalClientName(e.target.value)}
                    className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
                  />
                </form>
              ) : (
                <div
                  onDoubleClick={() => setShow(true)}
                  className="cursor-pointer w-full"
                >
                  {clientName ? (
                    clientName
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
        accessorKey: "subject",
        header: "Subject",
        Header: ({ column }) => {
          return (
            <div className=" w-[290px] flex flex-col gap-[2px]">
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
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const subject = row.original.subject;
          const [showEdit, setShowEdit] = useState(false);
          const [localSubject, setSubject] = useState(subject);

          const handleSubmit = (e) => {
            setFormData((prevData) => ({
              ...prevData,
              subject: localSubject,
            }));

            handleUpdateData(row.original._id, {
              ...formData,
              subject: localSubject,
            });

            setShowEdit(false);
          };
          return (
            <div className="w-full h-full ">
              {showEdit ? (
                <input
                  type="text"
                  placeholder="Enter Task..."
                  value={localSubject}
                  onChange={(e) => setSubject(e.target.value)}
                  onBlur={(e) => handleSubmit(e.target.value)}
                  className="w-full h-[2.3rem] focus:border border-gray-300 px-1 outline-none rounded"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-start "
                  onDoubleClick={() => setShowEdit(true)}
                  title={subject}
                >
                  <p
                    className="text-blue-600 hover:text-blue-700 cursor-pointer text-start  "
                    onDoubleClick={() => setShowEdit(true)}
                    onClick={() => {
                      setMail(row.original.mail);
                      setShowMail(true);
                    }}
                  >
                    {subject}
                  </p>
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
        size: 400,
        minSize: 350,
        maxSize: 560,
        grow: false,
      },
      //   Created At
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
                Created Date
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
              tomorrow.setDate(today.getDate() - 1);
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
      //   Job date
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
            handleUpdateData(row.original._id, {
              ...formData,
              jobDate: newDate,
            });
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
      //   Job Date
      {
        accessorKey: "deadline",
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
                Deadline
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
          const deadline = row.original.deadline;
          const [date, setDate] = useState(() => {
            const cellDate = new Date(
              cell.getValue() || "2024-09-20T12:43:36.002+00:00"
            );
            return cellDate.toISOString().split("T")[0];
          });

          const [showStartDate, setShowStartDate] = useState(false);

          const handleDateChange = (newDate) => {
            setDate(newDate);
            handleUpdateData(row.original._id, {
              ...formData,
              deadline: newDate,
            });
            setShowStartDate(false);
          };

          return (
            <div className="w-full flex  ">
              {!showStartDate ? (
                <p
                  onDoubleClick={() => setShowStartDate(true)}
                  className="w-full"
                >
                  {deadline ? (
                    format(new Date(deadline), "dd-MMM-yyyy")
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
      //  --- Note--->
      {
        accessorKey: "note",
        minSize: 200,
        maxSize: 500,
        size: 350,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                  setSelectFilter("");
                }}
              >
                Note
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                  setSelectFilter(e.target.value);
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

          const handleSubmit = (e) => {
            e.preventDefault();
            setFormData((prevData) => ({
              ...prevData,
              note: localNote,
            }));
            handleUpdateData(row.original._id, {
              ...formData,
              note: localNote,
            });
            setShow(false);
          };

          return (
            <div className="w-full px-1">
              {show ? (
                <form onSubmit={handleSubmit}>
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
        accessorKey: "source",
        minSize: 90,
        maxSize: 200,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                  setSelectFilter("");
                }}
              >
                Source
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                  setSelectFilter(e.target.value);
                }}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {sources.map((source) => (
                  <option value={source}>{source}</option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const source = row.original.source;
          const [show, setShow] = useState(false);
          const [localSource, setLocalSource] = useState(source || "");

          const handleChange = (e) => {
            const selectedValue = e.target.value;
            setLocalSource(selectedValue);

            setFormData((prevData) => ({
              ...prevData,
              source: localSource,
            }));

            handleUpdateData(row.original._id, {
              ...formData,
              source: selectedValue,
            });

            setShow(false);
          };
          return (
            <div className="w-full ">
              {!show ? (
                <div
                  className="w-full cursor-pointer"
                  onDoubleClick={() => setShow(true)}
                >
                  {source ? (
                    <span>{source}</span>
                  ) : (
                    <span className="text-white">.</span>
                  )}
                </div>
              ) : (
                <select
                  value={localSource || ""}
                  className="w-full h-[2rem] rounded-md border-none  outline-none"
                  onChange={handleChange}
                >
                  <option value="empty"></option>
                  {sources?.map((sour, i) => (
                    <option value={sour} key={i}>
                      {sour}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: sources?.map((source) => source),
        filterVariant: "select",
      },
      //   Status
      {
        accessorKey: "status",
        minSize: 80,
        maxSize: 150,
        size: 90,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                  setSelectFilter("");
                }}
              >
                Status
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => {
                  column.setFilterValue(e.target.value);
                  setSelectFilter(e.target.value);
                }}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {status.map((stat) => (
                  <option value={stat}>{stat}</option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const state = row.original.status;
          const [show, setShow] = useState(false);
          const [localStage, setLocalStage] = useState(state || "");

          const handleChange = (e) => {
            const selectedValue = e.target.value;
            setLocalStage(selectedValue);

            setFormData((prevData) => ({
              ...prevData,
              status: localStage,
            }));

            handleUpdateData(row.original._id, {
              ...formData,
              status: selectedValue,
            });

            setShow(false);
          };
          return (
            <div className="w-full ">
              {!show ? (
                <div
                  className="w-full cursor-pointer"
                  onDoubleClick={() => setShow(true)}
                >
                  {state ? (
                    <span>{state}</span>
                  ) : (
                    <span className="text-white">.</span>
                  )}
                </div>
              ) : (
                <select
                  value={localStage || ""}
                  className="w-full h-[2rem] rounded-md border-none  outline-none"
                  onChange={handleChange}
                >
                  <option value="empty"></option>
                  {status?.map((stat, i) => (
                    <option value={stat} key={i}>
                      {stat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: status?.map((stat) => stat),
        filterVariant: "select",
      },

      // <-----Action------>
      {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ cell, row }) => {
          return (
            <div className="flex items-center justify-center gap-4 w-full h-full">
              <span
                className="text-[1rem] cursor-pointer"
                onClick={() => handleCopyProposal(row.original._id)}
                title="Copy Proposal"
              >
                <GrCopy className="h-5 w-5 text-cyan-500 hover:text-cyan-600 " />
              </span>
              <span
                className=""
                title="Edit Proposal"
                onClick={() => {
                  setProposalId(row.original._id);
                  setShow(true);
                }}
              >
                <CiEdit className="h-7 w-7 cursor-pointer text-green-500 hover:text-green-600" />
              </span>

              <span
                className="text-[1rem] cursor-pointer"
                onClick={() => handleDeleteLeadConfirmation(row.original._id)}
                title="Delete Lead!"
              >
                <AiTwotoneDelete className="h-6 w-6 text-pink-500 hover:text-pink-600 " />
              </span>
            </div>
          );
        },
        size: 120,
      },
    ],
    // eslint-disable-next-line
    [users, auth, proposalData, filteredData, load]
  );

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");
    setSelectFilter("");
  };

  const table = useMaterialReactTable({
    columns,
    data: proposalData || [],
    enableStickyHeader: true,
    enableStickyFooter: true,
    muiTableContainerProps: { sx: { maxHeight: "720px" } },
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
        backgroundColor: "#f0f0f0",
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
    setFilteredData(filteredRows);
  }, [table.getFilteredRowModel().rows]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mailDetailref.current &&
        !mailDetailref.current.contains(event.target)
      ) {
        setShowMail(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const convertQuillHtmlToPlainText = (html) => {
    html = html.replace(/<strong>|<b>/g, "**");
    html = html.replace(/<\/strong>|<\/b>/g, "**");

    html = html.replace(/<em>|<i>/g, "_");
    html = html.replace(/<\/em>|<\/i>/g, "_");

    html = html.replace(/<u>/g, "__");
    html = html.replace(/<\/u>/g, "__");

    html = html.replace(/<a.*?href="(.*?)".*?>(.*?)<\/a>/g, "[$2]($1)");

    html = html.replace(/<br\s*\/?>/g, "");

    html = html.replace(/<\/p>/g, "\n");

    html = html.replace(/<[^>]*>/g, "");

    return html;
  };

  const copyTemplate = (template) => {
    const cleanText = convertQuillHtmlToPlainText(template);

    navigator.clipboard.writeText(cleanText).then(
      () => {
        toast.success("Copied!");
      },
      (err) => {
        console.log("Failed to copy the template!:", err);
        toast.error("Failed to copy the template!");
      }
    );
  };

  return (
    <Layout>
      <div className=" relative w-full h-[100%] overflow-y-auto py-4 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className=" text-xl sm:text-2xl font-semibold ">Proposal</h1>

            <span
              className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
              onClick={() => {
                handleClearFilters();
              }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6  cursor-pointer" />
            </span>
          </div>

          {/* ---------Template Buttons */}
          <div className="flex items-center gap-4">
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShow(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              New Proposal
            </button>
          </div>
        </div>
        <hr className="w-full h-[1px] bg-gray-300 my-4" />
        {/*  */}

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

        {/* --------Add Proposal-------- */}
        {show && (
          <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
            <AddProposal
              setShow={setShow}
              user={userName}
              setProposalId={setProposalId}
              proposalId={proposalId}
              getProposal={getProposal}
            />
          </div>
        )}

        {/* ------Mail Detail----- */}
        {showMail && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full py-4 px-4 bg-gray-300/70 flex items-center justify-center">
            <div
              ref={mailDetailref}
              className="flex flex-col gap-2 bg-white rounded-md shadow-md w-[35rem] max-h-[95vh] "
            >
              <div className="flex items-center justify-between px-4 pt-2">
                <h1 className="text-[20px] font-semibold text-black">
                  Mail View
                </h1>
                <span
                  className=" cursor-pointer"
                  onClick={() => {
                    setMail("");
                    setShowMail(false);
                  }}
                >
                  <IoClose className="h-6 w-6 " />
                </span>
              </div>
              <hr className="h-[1px] w-full bg-gray-400 " />
              <div
                onClick={() => copyTemplate(mail)}
                className="py-4 px-4 w-full max-h-[80vh] text-[14px] overflow-y-auto cursor-pointer"
                dangerouslySetInnerHTML={{ __html: mail }}
              ></div>
              <hr className="h-[1px] w-full bg-gray-400 " />
              <div className="flex items-center justify-end px-4 py-2 pb-4">
                <button
                  className={`${style.button1} text-[15px] `}
                  type="button"
                  style={{ padding: ".4rem 1rem" }}
                >
                  <span
                    className="text-[1rem] cursor-pointer"
                    onClick={() => copyTemplate(mail)}
                    title="Copy Template"
                  >
                    <GrCopy className="h-5 w-5 text-white " />
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
