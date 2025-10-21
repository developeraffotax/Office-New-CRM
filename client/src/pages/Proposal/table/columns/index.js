import React, { useEffect, useState } from "react";
import { GrCopy } from "react-icons/gr";
import { CiEdit } from "react-icons/ci";
import { AiTwotoneDelete } from "react-icons/ai";
import { format } from "date-fns";

export const getProposalColumns = (ctx) => {
  const {
    auth,
    users,
    status,
    sources,
    setSelectFilter,
    setFormData,
    handleUpdateData,
    handleCopyProposal,
    setProposalId,
    setShow,
    handleDeleteLeadConfirmation,

    setMail,
    setShowMail,
     
  } = ctx;

  //   ------------------------Table Data----------->
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  return [
    {
      accessorKey: "jobHolder",
      header: "Job Holder",
      Header: ({ column }) => {
        const user = auth?.user?.name;
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
      Cell: ({ row }) => {
        const jobholder = row.original.jobHolder;
        const [localJobholder, setLocalJobholder] = useState(jobholder || "");
        const [show, setShow] = useState(false);
        const handleChange = (e) => {
          const selectedValue = e.target.value;
          setLocalJobholder(selectedValue);
          setFormData((prevData) => ({ ...prevData, jobHolder: localJobholder }));
          handleUpdateData(row.original._id, { jobHolder: selectedValue });
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
              <div className="w-full cursor-pointer" onDoubleClick={() => setShow(true)}>
                {jobholder ? <span>{jobholder}</span> : <span className="text-white">.</span>}
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
      Header: ({ column }) => (
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
      ),
      Cell: ({ row }) => {
        const clientName = row.original.clientName;
        const [show, setShow] = useState(false);
        const [localClientName, setLocalClientName] = useState(clientName);
        const handleSubmit = (e) => {
          e?.preventDefault?.();
          setFormData((prevData) => ({ ...prevData, clientName: localClientName }));
          handleUpdateData(row.original._id, { clientName: localClientName });
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
              <div onDoubleClick={() => setShow(true)} className="cursor-pointer w-full">
                {clientName ? clientName : <div className="text-white w-full h-full">.</div>}
              </div>
            )}
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.original[columnId]?.toString().toLowerCase() || "";
        return cellValue.includes(filterValue.toLowerCase());
      },
      filterVariant: "select",
    },

    {
      accessorKey: "subject",
      header: "Subject",
      Header: ({ column }) => (
        <div className=" w-[290px] flex flex-col gap-[2px]">
          <span
            className="ml-1 cursor-pointer"
            title="Clear Filter"
            onClick={() => column.setFilterValue("")}
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
      ),
      Cell: ({ row }) => {
        const subject = row.original.subject;
        const [showEdit, setShowEdit] = useState(false);
        const [localSubject, setSubject] = useState(subject);
        const handleSubmit = () => {
          setFormData((prevData) => ({ ...prevData, subject: localSubject }));
          handleUpdateData(row.original._id, { subject: localSubject });
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
                onBlur={() => handleSubmit()}
                className="w-full h-[2.3rem] focus:border border-gray-300 px-1 outline-none rounded"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-start "
                onDoubleClick={() => setShowEdit(true)}
                title={subject}
              >
                <p className="text-blue-600 hover:text-blue-700 cursor-pointer text-start  "
                
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
        const cellValue = row.original[columnId]?.toString().toLowerCase() || "";
        return cellValue.includes(filterValue.toLowerCase());
      },
      size: 500,
      minSize: 350,
      maxSize: 560,
      grow: false,
    },


 







































































    {
      accessorKey: "value",
      minSize: 50,
      maxSize: 100,
      size: 60,
      grow: false,
      Header: ({ column }) => (
        <div className=" flex flex-col gap-[2px]">
          <span
            className="ml-1 cursor-pointer"
            title="Clear Filter"
            onClick={() => {
              column.setFilterValue("");
              setSelectFilter("");
            }}
          >
            Value
          </span>
        </div>
      ),
      Cell: ({ row }) => {
        const value = row.original.value;
        const [show, setShow] = useState(false);
        const [localValue, setLocalValue] = useState(value || "");
        const handleSubmit = () => {
          setFormData((prevData) => ({ ...prevData, value: localValue }));
          handleUpdateData(row.original._id, { value: localValue });
          setShow(false);
        };
        return (
          <div className="w-full ">
            {!show ? (
              <div className="w-full cursor-pointer flex items-center justify-center" onDoubleClick={() => setShow(true)}>
                {value ? <span>{value}</span> : <span className="text-white">.</span>}
              </div>
            ) : (
              <input
                value={localValue || ""}
                className="w-full h-[2rem] px-1 rounded-md border-none  outline-none"
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={() => handleSubmit()}
              />
            )}
          </div>
        );
      },
      filterFn: "equals",
      filterVariant: "select",
    },

    {
      accessorKey: "createdAt",
      Header: ({ column }) => {
        const [filterValue, setFilterValue] = useState("");
        const [customDate, setCustomDate] = useState(getCurrentMonthYear());
        useEffect(() => {
          if (filterValue === "Custom date") {
            column.setFilterValue(customDate);
          }
        }, [customDate, filterValue]);
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
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  column.setFilterValue(e.target.value);
                }}
                className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
              />
            ) : (
              <select
                value={filterValue}
                onChange={(e) => {
                  setFilterValue(e.target.value);
                  column.setFilterValue(e.target.value);
                }}
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
        const [date, setDate] = useState(() => {
          const cellDate = new Date(cell.getValue() || new Date().toISOString());
          return cellDate.toISOString().split("T")[0];
        });
        const [showStartDate, setShowStartDate] = useState(false);
        const handleDateChange = (newDate) => {
          setDate(newDate);
          handleUpdateData(row.original._id, { createdAt: newDate });
          setShowStartDate(false);
        };
        return (
          <div className="w-full flex  ">
            {!showStartDate ? (
              <p onDoubleClick={() => setShowStartDate(true)} className="w-full">
                {createdAt ? format(new Date(createdAt), "dd-MMM-yyyy") : <span className="text-white">.</span>}
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
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (filterValue.includes("-")) {
          const [year, month] = filterValue.split("-");
          const cellYear = cellDate.getFullYear().toString();
          const cellMonth = (cellDate.getMonth() + 1).toString().padStart(2, "0");
          return year === cellYear && month === cellMonth;
        }
        switch (filterValue) {
          case "Expired":
            return cellDate < startOfToday;
          case "Today":
            return cellDate.toDateString() === today.toDateString();
          case "Yesterday": {
            const d = new Date(today);
            d.setDate(today.getDate() - 1);
            return cellDate.toDateString() === d.toDateString();
          }
          case "Last 7 days": {
            const d = new Date(today);
            d.setDate(today.getDate() - 7);
            return cellDate >= d && cellDate < startOfToday;
          }
          case "Last 15 days": {
            const d = new Date(today);
            d.setDate(today.getDate() - 15);
            return cellDate >= d && cellDate < startOfToday;
          }
          case "Last 30 Days": {
            const d = new Date(today);
            d.setDate(today.getDate() - 30);
            return cellDate >= d && cellDate < startOfToday;
          }
          case "Last 60 Days": {
            const d = new Date(today);
            d.setDate(today.getDate() - 60);
            return cellDate >= d && cellDate < startOfToday;
          }
          default:
            return false;
        }
      },
      filterSelectOptions: [
        "Today",
        "Yesterday",
        "Last 7 days",
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
      accessorKey: "jobDate",
      Header: ({ column }) => {
        const [filterValue, setFilterValue] = useState("");
        const [customDate, setCustomDate] = useState(getCurrentMonthYear());
        useEffect(() => {
          if (filterValue === "Custom date") {
            column.setFilterValue(customDate);
          }
        }, [customDate, filterValue]);
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
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  column.setFilterValue(e.target.value);
                }}
                className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
              />
            ) : (
              <select
                value={filterValue}
                onChange={(e) => {
                  setFilterValue(e.target.value);
                  column.setFilterValue(e.target.value);
                }}
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
          const cellDate = new Date(cell.getValue() || new Date().toISOString());
          return cellDate.toISOString().split("T")[0];
        });
        const [showStartDate, setShowStartDate] = useState(false);
        const handleDateChange = (newDate) => {
          setDate(newDate);
          handleUpdateData(row.original._id, { jobDate: newDate });
          setShowStartDate(false);
        };
        return (
          <div className="w-full flex  ">
            {!showStartDate ? (
              <p onDoubleClick={() => setShowStartDate(true)} className="w-full">
                {jobDate ? format(new Date(jobDate), "dd-MMM-yyyy") : <span className="text-white">.</span>}
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
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (filterValue.includes("-")) {
          const [year, month] = filterValue.split("-");
          const cellYear = cellDate.getFullYear().toString();
          const cellMonth = (cellDate.getMonth() + 1).toString().padStart(2, "0");
          return year === cellYear && month === cellMonth;
        }
        switch (filterValue) {
          case "Expired":
            return cellDate < startOfToday;
          case "Today":
            return cellDate.toDateString() === today.toDateString();
          case "Yesterday": {
            const d = new Date(today);
            d.setDate(today.getDate() - 1);
            return cellDate.toDateString() === d.toDateString();
          }
          case "Last 7 days": {
            const d = new Date(today);
            d.setDate(today.getDate() - 7);
            return cellDate >= d && cellDate < startOfToday;
          }
          case "Last 15 days": {
            const d = new Date(today);
            d.setDate(today.getDate() - 15);
            return cellDate >= d && cellDate < startOfToday;
          }
          case "Last 30 Days": {
            const d = new Date(today);
            d.setDate(today.getDate() - 30);
            return cellDate >= d && cellDate < startOfToday;
          }
          case "Last 60 Days": {
            const d = new Date(today);
            d.setDate(today.getDate() - 60);
            return cellDate >= d && cellDate < startOfToday;
          }
          default:
            return false;
        }
      },
      filterSelectOptions: [
        "Today",
        "Yesterday",
        "Last 7 days",
        "Last 15 days",
        "Last 30 Days",
        "Last 60 Days",
        "Custom date",
      ],
      filterVariant: "custom",
      size: 120,
      minSize: 90,
      maxSize: 120,
      grow: false,
    },

    {
      accessorKey: "deadline",
      Header: ({ column }) => {
        const [filterValue, setFilterValue] = useState("");
        const [customDate, setCustomDate] = useState(getCurrentMonthYear());
        useEffect(() => {
          if (filterValue === "Custom date") {
            column.setFilterValue(customDate);
          }
        }, [customDate, filterValue]);
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
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  column.setFilterValue(e.target.value);
                }}
                className="h-[1.8rem] font-normal  cursor-pointer rounded-md border border-gray-200 outline-none"
              />
            ) : (
              <select
                value={filterValue}
                onChange={(e) => {
                  setFilterValue(e.target.value);
                  column.setFilterValue(e.target.value);
                }}
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
          const cellDate = new Date(cell.getValue() || new Date().toISOString());
          return cellDate.toISOString().split("T")[0];
        });
        const [showStartDate, setShowStartDate] = useState(false);
        const handleDateChange = (newDate) => {
          setDate(newDate);
          handleUpdateData(row.original._id, { deadline: newDate });
          setShowStartDate(false);
        };
        return (
          <div className="w-full flex  ">
            {!showStartDate ? (
              <p onDoubleClick={() => setShowStartDate(true)} className="w-full">
                {deadline ? format(new Date(deadline), "dd-MMM-yyyy") : <span className="text-white">.</span>}
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
          const cellMonth = (cellDate.getMonth() + 1).toString().padStart(2, "0");
          return year === cellYear && month === cellMonth;
        }
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        switch (filterValue) {
          case "Expired":
            return cellDate < startOfToday;
          case "Today":
            return cellDate.toDateString() === today.toDateString();
          case "Yesterday": {
            const d = new Date(today);
            d.setDate(today.getDate() - 1);
            return cellDate.toDateString() === d.toDateString();
          }
          case "In 7 days": {
            const d = new Date(today);
            d.setDate(today.getDate() + 7);
            return cellDate <= d && cellDate > today;
          }
          case "In 15 days": {
            const d = new Date(today);
            d.setDate(today.getDate() + 15);
            return cellDate <= d && cellDate > today;
          }
          case "30 Days": {
            const d = new Date(today);
            d.setDate(today.getDate() + 30);
            return cellDate <= d && cellDate > today;
          }
          case "60 Days": {
            const d = new Date(today);
            d.setDate(today.getDate() + 60);
            return cellDate <= d && cellDate > today;
          }
          case "Last 12 months": {
            const lastYear = new Date(today);
            lastYear.setFullYear(today.getFullYear() - 1);
            return cellDate >= lastYear && cellDate <= today;
          }
          default:
            return false;
        }
      },
      filterSelectOptions: [
        "Expired",
        "Today",
        "Yesterday",
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
      accessorKey: "note",
      minSize: 200,
      maxSize: 500,
      size: 350,
      grow: false,
      Header: ({ column }) => (
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
      ),
      Cell: ({ row }) => {
        const note = row.original.note;
        const [show, setShow] = useState(false);
        const [localNote, setLocalNote] = useState(note);
        const handleSubmit = (e) => {
          e?.preventDefault?.();
          setFormData((prevData) => ({ ...prevData, note: localNote }));
          handleUpdateData(row.original._id, { note: localNote });
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
              <div onDoubleClick={() => setShow(true)} className="cursor-pointer w-full">
                {localNote ? localNote : <div className="text-white w-full h-full">.</div>}
              </div>
            )}
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.original[columnId]?.toString().toLowerCase() || "";
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
      Header: ({ column }) => (
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
      ),
      Cell: ({ row }) => {
        const source = row.original.source;
        const [show, setShow] = useState(false);
        const [localSource, setLocalSource] = useState(source || "");
        const handleChange = (e) => {
          const selectedValue = e.target.value;
          setLocalSource(selectedValue);
          setFormData((prevData) => ({ ...prevData, source: localSource }));
          handleUpdateData(row.original._id, { source: selectedValue });
          setShow(false);
        };
        return (
          <div className="w-full ">
            {!show ? (
              <div className="w-full cursor-pointer" onDoubleClick={() => setShow(true)}>
                {source ? <span>{source}</span> : <span className="text-white">.</span>}
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

    {
      accessorKey: "propos",
      minSize: 80,
      maxSize: 150,
      size: 90,
      grow: false,
      Header: ({ column }) => (
        <div className=" flex flex-col gap-[2px]">
          <span
            className="ml-1 cursor-pointer"
            title="Clear Filter"
            onClick={() => {
              column.setFilterValue("");
              setSelectFilter("");
            }}
          >
            Proposal
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
              <option key={stat} value={stat}>
                {stat}
              </option>
            ))}
          </select>
        </div>
      ),
      Cell: ({ row }) => {
        const state = row.original.propos;
        const [show, setShow] = useState(false);
        const [localStage, setLocalStage] = useState(state || ".");
        const handleChange = (e) => {
          const selectedValue = e.target.value;
          setLocalStage(selectedValue);
          setFormData((prevData) => ({ ...prevData, propos: localStage }));
          handleUpdateData(row.original._id, { propos: selectedValue });
          setShow(false);
        };
        return (
          <div className="w-full ">
            {!show ? (
              <div className="w-full cursor-pointer" onDoubleClick={() => setShow(true)}>
                {state ? <span>{state}</span> : <span className="text-white">.</span>}
              </div>
            ) : (
              <select
                value={localStage || ""}
                className="w-full h-[2rem] rounded-md border-none  outline-none"
                onChange={handleChange}
              >
                <option value="." className="text-white">
                  Select
                </option>
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
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.original[columnId] != null ? row.original[columnId].toString().toLowerCase() : "";
        return cellValue.includes(filterValue.toLowerCase());
      },
      filterSelectOptions: status?.map((stat) => stat),
      filterVariant: "select",
    },

    {
      accessorKey: "lead",
      minSize: 80,
      maxSize: 150,
      size: 90,
      grow: false,
      Header: ({ column }) => (
        <div className=" flex flex-col gap-[2px]">
          <span
            className="ml-1 cursor-pointer"
            title="Clear Filter"
            onClick={() => {
              column.setFilterValue("");
              setSelectFilter("");
            }}
          >
            Lead
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
              <option key={stat} value={stat}>
                {stat}
              </option>
            ))}
          </select>
        </div>
      ),
      Cell: ({ row }) => {
        const state = row.original.lead;
        const [show, setShow] = useState(false);
        const [localStage, setLocalStage] = useState(state || "");
        const handleChange = (e) => {
          const selectedValue = e.target.value;
          setLocalStage(selectedValue);
          setFormData((prevData) => ({ ...prevData, lead: localStage }));
          handleUpdateData(row.original._id, { lead: selectedValue });
          setShow(false);
        };
        return (
          <div className="w-full ">
            {!show ? (
              <div className="w-full cursor-pointer" onDoubleClick={() => setShow(true)}>
                {state ? <span>{state}</span> : <span className="text-white">.</span>}
              </div>
            ) : (
              <select
                value={localStage || ""}
                className="w-full h-[2rem] rounded-md border-none  outline-none"
                onChange={handleChange}
              >
                <option value="." className="text-white"></option>
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
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.original[columnId] != null ? row.original[columnId].toString().toLowerCase() : "";
        return cellValue.includes(filterValue.toLowerCase());
      },
      filterSelectOptions: status?.map((stat) => stat),
      filterVariant: "select",
    },

    {
      accessorKey: "client",
      minSize: 80,
      maxSize: 150,
      size: 90,
      grow: false,
      Header: ({ column }) => (
        <div className=" flex flex-col gap-[2px]">
          <span
            className="ml-1 cursor-pointer"
            title="Clear Filter"
            onClick={() => {
              column.setFilterValue("");
              setSelectFilter("");
            }}
          >
            Client
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
              <option key={stat} value={stat}>
                {stat}
              </option>
            ))}
          </select>
        </div>
      ),
      Cell: ({ row }) => {
        const state = row.original.client;
        const [show, setShow] = useState(false);
        const [localStage, setLocalStage] = useState(state || "");
        const handleChange = (e) => {
          const selectedValue = e.target.value;
          setLocalStage(selectedValue);
          setFormData((prevData) => ({ ...prevData, client: localStage }));
          handleUpdateData(row.original._id, { client: selectedValue });
          setShow(false);
        };
        return (
          <div className="w-full ">
            {!show ? (
              <div className="w-full cursor-pointer" onDoubleClick={() => setShow(true)}>
                {state ? <span>{state}</span> : <span className="text-white">.</span>}
              </div>
            ) : (
              <select
                value={localStage || ""}
                className="w-full h-[2rem] rounded-md border-none  outline-none"
                onChange={handleChange}
              >
                <option value="." className="text-white"></option>
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
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.original[columnId] != null ? row.original[columnId].toString().toLowerCase() : "";
        return cellValue.includes(filterValue.toLowerCase());
      },
      filterSelectOptions: status?.map((stat) => stat),
      filterVariant: "select",
    },

    {
      accessorKey: "actions",
      header: "Actions",
      Cell: ({ row }) => (
        <div className="flex items-center justify-center gap-4 w-full h-full">
          <span className="text-[1rem] cursor-pointer" onClick={() => handleCopyProposal(row.original._id)} title="Copy Proposal">
            <GrCopy className="h-5 w-5 text-cyan-500 hover:text-cyan-600 " />
          </span>
          <span className="" title="Edit Proposal" onClick={() => { setProposalId(row.original._id); setShow(true); }}>
            <CiEdit className="h-7 w-7 cursor-pointer text-green-500 hover:text-green-600" />
          </span>
          <span className="text-[1rem] cursor-pointer" onClick={() => handleDeleteLeadConfirmation(row.original._id)} title="Delete Lead!">
            <AiTwotoneDelete className="h-6 w-6 text-pink-500 hover:text-pink-600 " />
          </span>
        </div>
      ),
      size: 120,
    },
  ];
};

export default getProposalColumns;


