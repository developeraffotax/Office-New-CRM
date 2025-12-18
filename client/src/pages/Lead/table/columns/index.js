import React, { useEffect, useRef, useState } from "react";
import { DateFilterFn } from "../../../../utlis/DateFilterFn";
import { TiFilter } from "react-icons/ti";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { IoTicket } from "react-icons/io5";
import { formatRef, refFilterFn } from "../../../../utlis/formatRef";
export const getLeadColumns = (ctx) => {
  const {
    setSelectFilter,
    setFormData,
    handleUpdateData,
    users,
    departments,
    sources,
    brands,
    leadSource,
    auth,
    
    anchorRef,
    handleFilterClick,
     
    NumderFilterFn,
    DateRangePopover,
    valueTotal,
    ActionsCell,
    selectedTab,
    setClientCompanyName,
    setClientEmail,
    setShowNewTicketModal,
    handleCopyLead,
    handleLeadStatus,
    handleDeleteLeadConfirmation,
    stages,

    setClientName,
    setCompanyName,

    setEmailPopup,
    ticketMap
  } = ctx;

  return [


    {
    id: "leadRef",
    accessorKey: "leadRef",
    accessorFn: (row) => row.leadRef || "", // safely handle missing jobRef
    // header: "Ref",
    size: 70,

        Header: ({ column }) => {
      return (
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Ref</span>

          {/* 🔍 Header Search Input */}
          <input
            type="text"
            
            className="border font-normal rounded px-2 py-1 text-sm outline-none"
            value={column.getFilterValue() ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value)}
          />
        </div>
      );
    },
    filterFn: refFilterFn,


    // enableColumnFilter: true,
    // enableSorting: true,
    // sortingFn: "alphanumeric",
    Cell: ({ cell }) => {

      const prefix = "L"; 
      const number = cell.getValue();
      const cellValue = formatRef(prefix, number);


      const handleCopy = () => {
        if(!number) return;
        navigator.clipboard.writeText(cellValue);
        toast.success(`Copied ${cellValue}`);
      };


      return (
        <span
        className=" text-gray-700 font-semibold text-sm cursor-pointer "
        onClick={handleCopy}
        title="Click to copy"
      >
        {cellValue}
      </span>
      )
    },
    
  },




    {
      accessorKey: "companyName",
      minSize: 100,
      maxSize: 200,
      size: 170,
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
              Company Name
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
      Cell: ({ row }) => {
        const companyName = row.original?.companyName;
        const [show, setShow] = useState(false);
        const [localCompanyName, setLocalCompanyName] = useState(companyName);

        const handleSubmit = () => {
          setFormData((prevData) => ({
            ...prevData,
            companyName: localCompanyName,
          }));

          handleUpdateData(row.original._id, {
            companyName: localCompanyName,
          });

          setShow(false);
        };

         useEffect(() => {
    // when table refreshes, update local state
    setLocalCompanyName(companyName);
  }, [companyName]);

        return (
          <div className="w-full px-1">
            {show ? (
              <input
                type="text"
                value={localCompanyName}
                autoFocus
                onChange={(e) => setLocalCompanyName(e.target.value)}
                onBlur={() => handleSubmit()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                  if (e.key === "Escape") {
                    setShow(false);
                  }
                }}
                className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
              />
            ) : (
              <div
                onDoubleClick={() => setShow(true)}
                onClick={(event) => {
                  if (event.ctrlKey) {
                    navigator.clipboard.writeText(companyName);
                    toast.success(`Copied to clipboard! | ${companyName}`);
                  }
                }}
                className="cursor-pointer w-full"
              >
                {localCompanyName ? (
                  localCompanyName
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
      Cell: ({ row }) => {
        const clientName = row.original?.clientName || "";
        const count = ticketMap?.[clientName] ?? 0;
        const hasTickets = count > 0;
        
        
        const [show, setShow] = useState(false);
        const [localClientName, setLocalClientName] = useState(clientName);

        const handleSubmit = () => {
          setFormData((prevData) => ({
            ...prevData,
            clientName: localClientName,
          }));

          handleUpdateData(row.original._id, {
            clientName: localClientName,
          });

          setShow(false);
        };


        useEffect(() => {
    // when table refreshes, update local state
    setLocalClientName(clientName);
  }, [clientName]);
      
        return (
          <div className="w-full px-1">
            {show ? (
              <input
                type="text"
                value={localClientName}
                autoFocus
                onChange={(e) => setLocalClientName(e.target.value)}
                onBlur={() => handleSubmit()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                  if (e.key === "Escape") {
                    setShow(false);
                  }
                }}
                className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
              />
            ) : (
              <div
                
                className="cursor-pointer w-full flex justify-between items-center gap-2"
              >
                


                <span 
                title={clientName}
                className={`overflow-hidden ${(auth?.user?.role?.name === 'Admin') ? 'w-[90%]' : "w-full"}`}
                onDoubleClick={() => setShow(true)}
                onClick={(event) => {
                  if (event.ctrlKey) {
                    navigator.clipboard.writeText(clientName);
                    toast.success(`Copied to clipboard! | ${clientName}`);
                  }
                }}>
                  
                  {localClientName ? (
                  localClientName
                ) : (
                  <div className="text-white w-full h-full">.</div>
                )}</span>


                {
                  auth?.user?.role?.name === 'Admin' && (
                    <span 
                      title="Client's latest ticket"
                      className="w-[10%] "
                        onClick={() => {

                          setEmailPopup({
                            open: true,
                            email: row.original.email,
                            clientName: row.original.clientName

                          })


                        }}
                      >
                
                  <IoTicket className={`w-4 h-4 hover:text-orange-500 ${hasTickets ? 'text-sky-500' : 'text-gray-600'}`}/>
                </span>
                  )
                }

                
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
      accessorKey: "jobHolder",
      header: "Job Holder",
      Header: ({ column }) => {
        const user = auth?.user?.name;

        useEffect(() => {
          column.setFilterValue(user);
        }, []);

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
              <option value="empty">Empty</option>
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

          setFormData((prevData) => ({
            ...prevData,
            jobHolder: localJobholder,
          }));

          handleUpdateData(row.original._id, {
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
                {jobholder ? <span>{jobholder}</span> : <span className="text-white">.</span>}
              </div>
            )}
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.getValue(columnId);
        if (filterValue === "empty") {
          return !cellValue || cellValue === "empty";
        }
        return String(cellValue ?? "") === String(filterValue);
      },
      filterSelectOptions: users.map((jobhold) => jobhold.name),
      filterVariant: "select",
      size: 110,
      minSize: 80,
      maxSize: 130,
      grow: false,
    },

    {
      accessorKey: "department",
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
                setSelectFilter("");
              }}
            >
              Department
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
              {departments.map((dep, i) => (
                <option value={dep} key={i}>
                  {dep}
                </option>
              ))}
            </select>
          </div>
        );
      },
      Cell: ({ row }) => {
        const department = row.original.department;
        const [show, setShow] = useState(false);
        const [localDepartment, setLocalDepartment] = useState(department || "");

        const handleChange = (e) => {
          const selectedValue = e.target.value;
          setLocalDepartment(selectedValue);

          setFormData((prevData) => ({
            ...prevData,
            department: localDepartment,
          }));

          handleUpdateData(row.original._id, {
            department: selectedValue,
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
                {department ? <span>{department}</span> : <span className="text-white">.</span>}
              </div>
            ) : (
              <select
                value={localDepartment || ""}
                className="w-full h-[2rem] rounded-md border-none  outline-none"
                onChange={handleChange}
              >
                <option value="empty"></option>
                {departments?.map((depart, i) => (
                  <option value={depart} key={i}>
                    {depart}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.getValue(columnId);
        return String(cellValue ?? "") === String(filterValue);
      },
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
      Cell: ({ row }) => {
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
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.getValue(columnId);
        return String(cellValue ?? "") === String(filterValue);
      },
    },

    {
      accessorKey: "brand",
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
              Brand
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
              {brands.map((brand) => (
                <option value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        );
      },
      Cell: ({ row }) => {
        const brand = row.original.brand;
        const [show, setShow] = useState(false);
        const [localBrand, setLocalBrand] = useState(brand || "");

        const handleChange = (e) => {
          const selectedValue = e.target.value;
          setLocalBrand(selectedValue);

          setFormData((prevData) => ({
            ...prevData,
            brand: localBrand,
          }));

          handleUpdateData(row.original._id, {
            brand: selectedValue,
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
                {brand ? <span>{brand}</span> : <span className="text-white">.</span>}
              </div>
            ) : (
              <select
                value={localBrand || ""}
                className="w-full h-[2rem] rounded-md border-none  outline-none"
                onChange={handleChange}
              >
                <option value="empty"></option>
                {brands?.map((b, i) => (
                  <option value={b} key={i}>
                    {b}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.getValue(columnId);
        return String(cellValue ?? "") === String(filterValue);
      },
    },

    {
      accessorKey: "received",
      Header: ({ column }) => (
        <div className="flex flex-col items-center justify-between">
          <span
            title="Click to remove filter"
            onClick={() => column.setFilterValue("")}
            className="cursor-pointer "
          >
            Received
          </span>
          <button ref={anchorRef} onClick={(e) => handleFilterClick(e, "received")}>
            <TiFilter size={20} className="ml-1 text-gray-500 hover:text-black" />
          </button>
        </div>
      ),
      filterFn: NumderFilterFn,
      Cell: ({ row }) => (
        <span className="w-full flex justify-center text-lg bg-sky-600 text-white rounded-md">
          {row.original.received}
        </span>
      ),
      size: 60,
    },

    {
      accessorKey: "sent",
      Header: ({ column }) => (
        <div className="flex flex-col items-center justify-between">
          <span
            title="Click to remove filter"
            onClick={() => column.setFilterValue("")}
            className="cursor-pointer "
          >
            Sent
          </span>
          <button ref={anchorRef} onClick={(e) => handleFilterClick(e, "sent")}>
            <TiFilter size={20} className="ml-1 text-gray-500 hover:text-black" />
          </button>
        </div>
      ),
      Cell: ({ row }) => {
        const sent = row.original.sent;
        return (
          <span className="w-full flex justify-center text-lg bg-orange-600 text-white rounded-md">
            {sent}
          </span>
        );
      },
      size: 60,
      filterFn: NumderFilterFn,
    },

    {
      accessorKey: "value",
      minSize: 50,
      maxSize: 100,
      size: 60,
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
              Value
            </span>
            <span className="border rounded px-2 py-1 text-sm ">{valueTotal}</span>
          </div>
        );
      },
      Cell: ({ row }) => {
        const value = row.original.value;
        const [show, setShow] = useState(false);
        const [localValue, setLocalValue] = useState(value || "");

        const handleChange = () => {
          setFormData((prevData) => ({
            ...prevData,
            value: localValue,
          }));

          handleUpdateData(row.original._id, {
            value: localValue,
          });

          setShow(false);
        };

        return (
          <div className="w-full ">
            {!show ? (
              <div
                className="w-full cursor-pointer flex items-center justify-center"
                onDoubleClick={() => setShow(true)}
              >
                {value ? <span>{value}</span> : <span className="text-white">.</span>}
              </div>
            ) : (
              <input
                value={localValue || ""}
                className="w-full h-[2rem] px-1 rounded-md border-none  outline-none"
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={() => handleChange()}
              />
            )}
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.getValue(columnId);
        if (cellValue == null) return false;
        return cellValue.toString().includes(filterValue.toString());
      },
      filterVariant: "select",
    },

    {
      accessorKey: "number",
      minSize: 50,
      maxSize: 100,
      size: 70,
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
              Number
            </span>
            <input
              type="text"
              placeholder=""
              className="border rounded px-2 py-1 text-sm outline-none"
              value={column.getFilterValue() || ""}
              onChange={(e) => column.setFilterValue(e.target.value)}
            />
          </div>
        );
      },
      Cell: ({ row }) => {
        const number = row.original.number;
        const [show, setShow] = useState(false);
        const [localValue, setLocalValue] = useState(number || "");

        const handleChange = () => {
          setFormData((prevData) => ({
            ...prevData,
            number: localValue,
          }));

          handleUpdateData(row.original._id, {
            number: localValue,
          });

          setShow(false);
        };

        return (
          <div className="w-full ">
            {!show ? (
              <div
                className="w-full cursor-pointer flex items-center justify-center"
                onDoubleClick={() => setShow(true)}
              >
                {number ? <span>{number}</span> : <span className="text-white">.</span>}
              </div>
            ) : (
              <input
                value={localValue || ""}
                className="w-full h-[2rem] px-1 rounded-md border-none  outline-none"
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={() => handleChange()}
              />
            )}
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.getValue(columnId);
        if (cellValue == null) return false;
        return cellValue.toString().includes(filterValue.toString());
      },
      filterVariant: "select",
    },

    {
      accessorKey: "lead_Source",
      minSize: 100,
      maxSize: 150,
      size: 110,
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
              Lead Source
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
              {leadSource.map((leadS, i) => (
                <option value={leadS} key={i}>
                  {leadS}
                </option>
              ))}
            </select>
          </div>
        );
      },
      Cell: ({ row }) => {
        const lead_Source = row.original.lead_Source;
        const [show, setShow] = useState(false);
        const [localLead, setLocalLead] = useState(lead_Source || "");

        const handleChange = (e) => {
          const selectedValue = e.target.value;
          setLocalLead(selectedValue);

          setFormData((prevData) => ({
            ...prevData,
            lead_Source: localLead,
          }));

          handleUpdateData(row.original._id, {
            lead_Source: selectedValue,
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
                {lead_Source ? <span>{lead_Source}</span> : <span className="text-white">.</span>}
              </div>
            ) : (
              <select
                value={localLead || ""}
                className="w-full h-[2rem] rounded-md border-none  outline-none"
                onChange={handleChange}
              >
                <option value="empty"></option>
                {leadSource?.map((leads, i) => (
                  <option value={leads} key={i}>
                    {leads}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.getValue(columnId);
        return String(cellValue ?? "") === String(filterValue);
      },
    },

    {
      accessorKey: "leadCreatedAt",
      Header: ({ column }) => {
        const [filterValue, setFilterValue] = useState("");
        const [dateRange, setDateRange] = useState({ from: "", to: "" });
        const [showPopover, setShowPopover] = useState(false);
        const selectRef = useRef(null);

        useEffect(() => {
          if (filterValue === "Custom Range") {
            column.setFilterValue(dateRange);
          } else {
            column.setFilterValue(filterValue);
          }
        }, [dateRange, filterValue]);

        const handleFilterChange = (e) => {
          const val = e.target.value;
          setFilterValue(val);
          if (val === "Custom Range") {
            setShowPopover(true);
          } else {
            setShowPopover(false);
          }
        };

        const handleRangeChange = (key, value) => {
          setDateRange((prev) => ({ ...prev, [key]: value }));
        };

        return (
          <div className="flex flex-col gap-[2px] relative">
            <span
              className="ml-1 cursor-pointer"
              title="Clear Filter"
              onClick={() => {
                setFilterValue("");
                setDateRange({ from: "", to: "" });
                column.setFilterValue("");
              }}
            >
              Created Date
            </span>

            <select
              ref={selectRef}
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
              <option value="Custom Range">Custom Date</option>
            </select>

            {showPopover && (
              <DateRangePopover
                anchorRef={selectRef}
                onChange={handleRangeChange}
                onClose={() => setShowPopover(false)}
              />
            )}
          </div>
        );
      },
      Cell: ({ cell, row }) => {
        const createdAt = row.original.leadCreatedAt;

        const [date, setDate] = useState(() => {
          const rawValue = cell.getValue();
          if (!rawValue) return "";
          const cellDate = new Date(rawValue);
          return isNaN(cellDate.getTime())
            ? ""
            : cellDate.toISOString().split("T")[0];
        });

        const [showStartDate, setShowStartDate] = useState(false);

        const handleDateChange = (newDate) => {
          setDate(newDate);
          handleUpdateData(row.original._id, {
            leadCreatedAt: newDate,
          });
          setShowStartDate(false);
        };

        return (
          <div className="w-full flex">
            {!showStartDate ? (
              <p
                onDoubleClick={() => setShowStartDate(true)}
                className="w-full cursor-pointer"
              >
                {createdAt ? (
                  (() => {
                    const parsed = new Date(createdAt);
                    return isNaN(parsed.getTime())
                      ? "-"
                      : format(parsed, "dd-MMM-yyyy");
                  })()
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </p>
            ) : (
              <input
                type="date"
                value={date || ""}
                onChange={(e) => setDate(e.target.value)}
                onBlur={(e) => handleDateChange(e.target.value)}
                className="h-[2rem] w-full cursor-pointer rounded-md border border-gray-200 outline-none"
                autoFocus
              />
            )}
          </div>
        );
      },
      filterFn: DateFilterFn,
      filterSelectOptions: [
        "Today",
        "Yesterday",
        "Last 7 days",
        "Last 15 days",
        "Last 30 Days",
        "Last 60 Days",
        "This Month",
        "Last Month",
        "This Quarter",
        "Last Quarter",
        "This Year",
        "Last Year",
      ],
      filterVariant: "custom",
      size: 100,
      minSize: 90,
      maxSize: 110,
      grow: false,
    },

    {
      accessorKey: "followUpDate",
     Header: ({ column }) => {
  const filterVal = column.getFilterValue();

  const selectRef = useRef(null);
  const [showPopover, setShowPopover] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Keep local UI synced if filter set from outside
  useEffect(() => {
    if (typeof filterVal === "object") {
      setDateRange(filterVal || { from: "", to: "" });
      setShowPopover(true); // show popover again if custom range re-applied
    }
  }, [filterVal]);

  const handleSelectChange = (e) => {
    const val = e.target.value;

    if (val === "Custom Range") {
      setShowPopover(true);

      // Keep previous range if exists
      column.setFilterValue(dateRange);
    } else {
      setShowPopover(false);
      column.setFilterValue(val);
    }
  };

  // Trigger filtering immediately when user types
  const handleRangeChange = (key, value) => {
    const updated = { ...dateRange, [key]: value };
    setDateRange(updated);
    column.setFilterValue(updated);
  };

  return (
    <div className="flex flex-col gap-[2px] relative">
      <span
        className="ml-1 cursor-pointer"
        title="Clear Filter"
        onClick={() => {
          column.setFilterValue("");
          setDateRange({ from: "", to: "" });
          setShowPopover(false);
        }}
      >
        Follow-Up Date
      </span>

      <select
        ref={selectRef}
        className="h-[1.8rem] w-full rounded-md border border-gray-200 font-normal"
        value={
          typeof filterVal === "object" ? "Custom Range" : filterVal || ""
        }
        onChange={handleSelectChange}
      >
        <option value="">Select</option>
        {column.columnDef.filterSelectOptions.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
        <option value="Custom Range">Custom Date</option>
      </select>

      {showPopover && (
        <DateRangePopover
          anchorRef={selectRef}
          onChange={handleRangeChange}
          onClose={() => setShowPopover(false)}
          value={dateRange}
        />
      )}
    </div>
  );
},

      Cell: ({ cell, row }) => {
        const followUpDate = row.original.followUpDate;
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
            followUpDate: newDate,
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
                {followUpDate ? (
                  format(new Date(followUpDate), "dd-MMM-yyyy")
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
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);


    const startOfToday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

  // Handle custom range
  if (typeof filterValue === "object") {
    const { from, to } = filterValue;

    if (from && !to) {
      return cellDate >= new Date(from);
    }
    if (!from && to) {
      return cellDate <= new Date(to);
    }
    if (from && to) {
      return (
        cellDate >= new Date(from) && cellDate <= new Date(to)
      );
    }

    return true; // no range selected yet → show all
  }

        switch (filterValue) {
          case "Expired":
            return cellDate < startOfToday;
          case "Upcoming":
            return cellDate > tomorrow;
          case "Today":
            return cellDate.toDateString() === today.toDateString();
          case "Tomorrow": {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return cellDate.toDateString() === tomorrow.toDateString();
          }
          case "In 7 days": {
            const in7Days = new Date(today);
            in7Days.setDate(today.getDate() + 7);
            return cellDate <= in7Days && cellDate > today;
          }
          case "In 15 days": {
            const in15Days = new Date(today);
            in15Days.setDate(today.getDate() + 15);
            return cellDate <= in15Days && cellDate > today;
          }
          case "30 Days": {
            const in30Days = new Date(today);
            in30Days.setDate(today.getDate() + 30);
            return cellDate <= in30Days && cellDate > today;
          }
          case "60 Days": {
            const in60Days = new Date(today);
            in60Days.setDate(today.getDate() + 60);
            return cellDate <= in60Days && cellDate > today;
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
        "Tomorrow",
        "In 7 days",
        "In 15 days",
        "30 Days",
        "60 Days",
        "Upcoming"
      ],
      filterVariant: "custom",
      size: 120,
      minSize: 90,
      maxSize: 120,
      grow: false,
    },

    {
      accessorKey: "Days",
      Header: ({ column }) => {
        return (
          <div className="w-full flex flex-col gap-[2px]">
            <span
              className="cursor-pointer"
              title="Clear Filter"
              onClick={() => column.setFilterValue("")}
            >
              Days
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
              <option value="0-5">0-5</option>
              <option value="5-10">5-10</option>
              <option value="10-20">10-20</option>
              <option value="20-30">20-30</option>
              <option value="30+">30+</option>
            </select>
          </div>
        );
      },
      Cell: ({ row }) => {
        const createdAt = new Date(row.original.leadCreatedAt);
        const deadline = new Date(row.original.followUpDate);
        if (!createdAt || !deadline) return <div>N/A</div>;
        const timeDifference = deadline.getTime() - createdAt.getTime();
        const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        return (
          <div className="w-full text-center">
            {dayDifference >= 0 ? `${dayDifference} Days` : <span className="text-red-500">Expired</span>}
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const createdAt = new Date(row.original.leadCreatedAt);
        const deadline = new Date(row.original.followUpDate);
        if (!createdAt || !deadline) return false;
        const timeDifference = deadline.getTime() - createdAt.getTime();
        const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        if (filterValue === "30+") {
          return dayDifference >= 30;
        }
        const [min, max] = filterValue.split("-").map(Number);
        return dayDifference >= min && dayDifference <= max;
      },
      enableColumnFilter: true,
      size: 70,
      minSize: 60,
      maxSize: 120,
      grow: false,
    },

    {
      accessorKey: "stage",
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
              Stages
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
              {stages.map((stage) => (
                <option value={stage}>{stage}</option>
              ))}
            </select>
          </div>
        );
      },
      Cell: ({ row }) => {
        const stage = row.original.stage;
        const [show, setShow] = useState(false);
        const [localStage, setLocalStage] = useState(stage || "");

        const handleChange = (e) => {
          const selectedValue = e.target.value;
          setLocalStage(selectedValue);

          setFormData((prevData) => ({
            ...prevData,
            stage: localStage,
          }));

          handleUpdateData(row.original._id, {
            stage: selectedValue,
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
                {stage ? <span>{stage}</span> : <span className="text-white">.</span>}
              </div>
            ) : (
              <select
                value={localStage || ""}
                className="w-full h-[2rem] rounded-md border-none  outline-none"
                onChange={handleChange}
              >
                <option value="empty"></option>
                {stages?.map((st, i) => (
                  <option value={st} key={i}>
                    {st}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      },
      filterFn: "equals",
      filterSelectOptions: stages?.map((stage) => stage),
      filterVariant: "select",
    },

    {
      accessorKey: "yearEnd",
      Header: ({ column }) => {
        const [filterValue, setFilterValue] = useState("");
        const [dateRange, setDateRange] = useState({ from: "", to: "" });
        const [showPopover, setShowPopover] = useState(false);
        const selectRef = useRef(null);

        useEffect(() => {
          if (filterValue === "Custom Range") {
            column.setFilterValue(dateRange);
          } else {
            column.setFilterValue(filterValue);
          }
        }, [dateRange, filterValue]);

        const handleFilterChange = (e) => {
          const val = e.target.value;
          setFilterValue(val);
          if (val === "Custom Range") {
            setShowPopover(true);
          } else {
            setShowPopover(false);
          }
        };

        const handleRangeChange = (key, value) => {
          setDateRange((prev) => ({ ...prev, [key]: value }));
        };
        return (
          <div className="flex flex-col gap-[2px] relative">
            <span
              className="ml-1 cursor-pointer"
              title="Clear Filter"
              onClick={() => {
                setFilterValue("");
                setDateRange({ from: "", to: "" });
                column.setFilterValue("");
              }}
            >
              Year End
            </span>

            <select
              ref={selectRef}
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
              <option value="Custom Range">Custom Date</option>
            </select>

            {showPopover && (
              <DateRangePopover
                anchorRef={selectRef}
                onChange={handleRangeChange}
                onClose={() => setShowPopover(false)}
              />
            )}
          </div>
        );
      },
      Cell: ({ cell, row }) => {
        const [date, setDate] = useState(() => {
          if (!cell.getValue()) {
            return "";
          }
          const cellDate = new Date(cell.getValue());
          return cellDate.toISOString().split("T")[0];
        });

        const [showYearend, setShowYearend] = useState(false);

        const handleDateChange = (newDate) => {
          const dateValue = new Date(newDate);
          if (isNaN(dateValue.getTime())) {
            toast.error("Please enter a valid date.");
            return;
          }
          setDate(newDate);

          setFormData((prevData) => ({
            ...prevData,
            yearEnd: dateValue,
          }));
          handleUpdateData(row.original._id, {
            yearEnd: dateValue,
          });

          setShowYearend(false);
        };

        return (
          <div className="w-full ">
            {!showYearend ? (
              <p onDoubleClick={() => setShowYearend(true)}>
                {date ? format(new Date(date), "dd-MMM-yyyy") : "--"}
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
        const today = new Date();
        const startOfToday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        if (typeof filterValue === "object" && filterValue.from && filterValue.to) {
          const fromDate = new Date(filterValue.from);
          const toDate = new Date(filterValue.to);
          return cellDate >= fromDate && cellDate <= toDate;
        }
        switch (filterValue) {
          case "Expired":
            return cellDate < startOfToday;
          case "Today":
            return cellDate.toDateString() === today.toDateString();
          case "Tomorrow": {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return cellDate.toDateString() === tomorrow.toDateString();
          }
          case "In 7 days": {
            const in7Days = new Date(today);
            in7Days.setDate(today.getDate() + 7);
            return cellDate <= in7Days && cellDate > today;
          }
          case "In 15 days": {
            const in15Days = new Date(today);
            in15Days.setDate(today.getDate() + 15);
            return cellDate <= in15Days && cellDate > today;
          }
          case "30 Days": {
            const in30Days = new Date(today);
            in30Days.setDate(today.getDate() + 30);
            return cellDate <= in30Days && cellDate > today;
          }
          case "60 Days": {
            const in60Days = new Date(today);
            in60Days.setDate(today.getDate() + 60);
            return cellDate <= in60Days && cellDate > today;
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
        "Tomorrow",
        "In 7 days",
        "In 15 days",
        "30 Days",
        "60 Days",
      ],
      filterVariant: "custom",
      size: 115,
      minSize: 80,
      maxSize: 140,
      grow: false,
    },

    {
      accessorKey: "jobDeadline",
      header: "Deadline",
      Header: ({ column }) => {
        const [filterValue, setFilterValue] = useState("");
        const [dateRange, setDateRange] = useState({ from: "", to: "" });
        const [showPopover, setShowPopover] = useState(false);
        const selectRef = useRef(null);

        useEffect(() => {
          if (filterValue === "Custom Range") {
            column.setFilterValue(dateRange);
          } else {
            column.setFilterValue(filterValue);
          }
        }, [dateRange, filterValue]);

        const handleFilterChange = (e) => {
          const val = e.target.value;
          setFilterValue(val);
          if (val === "Custom Range") {
            setShowPopover(true);
          } else {
            setShowPopover(false);
          }
        };

        const handleRangeChange = (key, value) => {
          setDateRange((prev) => ({ ...prev, [key]: value }));
        };
        return (
          <div className="flex flex-col gap-[2px] relative">
            <span
              className="ml-1 cursor-pointer"
              title="Clear Filter"
              onClick={() => {
                setFilterValue("");
                setDateRange({ from: "", to: "" });
                column.setFilterValue("");
              }}
            >
              Deadline
            </span>

            <select
              ref={selectRef}
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
              <option value="Custom Range">Custom Date</option>
            </select>

            {showPopover && (
              <DateRangePopover
                anchorRef={selectRef}
                onChange={handleRangeChange}
                onClose={() => setShowPopover(false)}
              />
            )}
          </div>
        );
      },
      Cell: ({ cell, row }) => {
        const [date, setDate] = useState(() => {
          if (!cell.getValue()) {
            return "";
          }
          const cellDate = new Date(cell.getValue());
          return cellDate.toISOString().split("T")[0];
        });

        const [showDeadline, setShowDeadline] = useState(false);

        const handleDateChange = (newDate) => {
          const dateValue = new Date(newDate);
          if (isNaN(dateValue.getTime())) {
            toast.error("Please enter a valid date.");
            return;
          }
          setDate(newDate);

          setFormData((prevData) => ({
            ...prevData,
            jobDeadline: dateValue,
          }));
          handleUpdateData(row.original._id, {
            jobDeadline: dateValue,
          });

          setShowDeadline(false);
        };

        const cellDate = new Date(date);
        const today = new Date();
        const isExpired = cellDate < today;

        return (
          <div className="w-full ">
            {!showDeadline ? (
              <p onDoubleClick={() => setShowDeadline(true)}>
                {date ? format(new Date(date), "dd-MMM-yyyy") : "--"}
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
        const today = new Date();
        const startOfToday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        if (typeof filterValue === "object" && filterValue.from && filterValue.to) {
          const fromDate = new Date(filterValue.from);
          const toDate = new Date(filterValue.to);
          return cellDate >= fromDate && cellDate <= toDate;
        }
        switch (filterValue) {
          case "Expired":
            return cellDate < startOfToday;
          case "Today":
            return cellDate.toDateString() === today.toDateString();
          case "Tomorrow": {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return cellDate.toDateString() === tomorrow.toDateString();
          }
          case "In 7 days": {
            const in7Days = new Date(today);
            in7Days.setDate(today.getDate() + 7);
            return cellDate <= in7Days && cellDate > today;
          }
          case "In 15 days": {
            const in15Days = new Date(today);
            in15Days.setDate(today.getDate() + 15);
            return cellDate <= in15Days && cellDate > today;
          }
          case "30 Days": {
            const in30Days = new Date(today);
            in30Days.setDate(today.getDate() + 30);
            return cellDate <= in30Days && cellDate > today;
          }
          case "60 Days": {
            const in60Days = new Date(today);
            in60Days.setDate(today.getDate() + 60);
            return cellDate <= in60Days && cellDate > today;
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
        "Tomorrow",
        "In 7 days",
        "In 15 days",
        "30 Days",
        "60 Days",
      ],
      filterVariant: "custom",
      size: 115,
      minSize: 80,
      maxSize: 140,
      grow: false,
    },

    {
      accessorKey: "actions",
      header: "Actions",
      Cell: ({ row }) => (
        <ActionsCell
          row={row}
          setClientCompanyName={setClientCompanyName}
          setClientEmail={setClientEmail}
          setShowNewTicketModal={setShowNewTicketModal}
          handleCopyLead={handleCopyLead}
          handleLeadStatus={handleLeadStatus}
          handleDeleteLeadConfirmation={handleDeleteLeadConfirmation}
          selectedTab={selectedTab}
          setClientName={setClientName}
          setCompanyName={setCompanyName}

          ticketMap={ticketMap}
        />
      ),
      size: 240,
    },

    {
      accessorKey: "email",
      minSize: 200,
      maxSize: 500,
      size: 250,
      grow: false,
      Header: ({ column }) => {
        return (
          <div className="flex flex-col gap-[2px]">
            <span
              className="ml-1 cursor-pointer"
              title="Clear Filter"
              onClick={() => {
                column.setFilterValue("");
                setSelectFilter("");
              }}
            >
              Email
            </span>
            <input
              type="search"
              value={column.getFilterValue() || ""}
              onChange={(e) => {
                column.setFilterValue(e.target.value);
                setSelectFilter(e.target.value);
              }}
              className="font-normal h-[1.8rem] w-[240px] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
            />
          </div>
        );
      },
      Cell: ({ row, cell }) => {
        const email = row.original.email;
        const [show, setShow] = React.useState(false);
        const [localEmail, setLocalEmail] = React.useState(email);

        const handleSubmit = React.useCallback(() => {
          setFormData((prevData) => ({
            ...prevData,
            email: localEmail,
          }));
          handleUpdateData(row.original._id, { email: localEmail });
          setShow(false);
        }, [localEmail, row.original._id]);

        const handleCancel = () => {
          setLocalEmail(email);
          setShow(false);
        };

        const handleCopy = async () => {
          if (localEmail) {
            await navigator.clipboard.writeText(localEmail);
            toast.success("Email copied to clipboard!");
          }
        };

        const handleClick = (e) => {
          if (e.ctrlKey || e.metaKey) {
            handleCopy();
          }
        };

        const handleKeyDown = (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
          }
        };

        return (
          <div className="w-full px-1">
            {show ? (
              <input
                type="text"
                value={localEmail}
                autoFocus
                onChange={(e) => setLocalEmail(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={handleKeyDown}
                className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
              />
            ) : (
              <div
                onClick={handleClick}
                onDoubleClick={() => setShow(true)}
                className="cursor-pointer w-full"
                title="Double-click to edit, Ctrl+Click (or ⌘+Click) to copy"
              >
                {localEmail ? (
                  localEmail.length > 80 ? (
                    <span>{localEmail.slice(0, 80)}...</span>
                  ) : (
                    <span>{localEmail}</span>
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
      accessorKey: "Note",
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
      Cell: ({ row }) => {
        const note = row.original.Note;
        const [show, setShow] = useState(false);
        const [localNote, setLocalNote] = useState(note);

        const handleSubmit = (e) => {
          e?.preventDefault?.();
          setFormData((prevData) => ({
            ...prevData,
            Note: localNote,
          }));
          handleUpdateData(row.original._id, {
            Note: localNote,
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
                  onBlur={handleSubmit} // <-- this triggers submit on click outside
                  className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
                />
              </form>
            ) : (
              <div onDoubleClick={() => setShow(true)} className="cursor-pointer w-full">
                {note ? (
                  note.length > 46 ? <span>{note.slice(0, 46)}...</span> : <span>{note}</span>
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
  ];
};

export default getLeadColumns;


