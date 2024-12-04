import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { useNavigate } from "react-router-dom";
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
import { FaTrophy } from "react-icons/fa6";
import { GiBrokenHeart } from "react-icons/gi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { MdOutlineAnalytics } from "react-icons/md";

export default function Lead() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [selectedTab, setSelectedTab] = useState("progress");
  const [isLoading, setIsLoading] = useState(false);
  const [leadData, setLeadData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [load, setLoad] = useState(false);
  const leadSource = [
    "Upwork",
    "Fiverr",
    "PPH",
    "Referral",
    "Partner",
    "Google",
    "Facebook",
    "LinkedIn",
    "Other",
  ];
  const stages = ["Interest", "Decision", "Action"];
  const brands = ["Affotax", "Outsource", "OTL"];
  const sources = ["Invitation", "Proposal", "Website"];
  const departments = [
    "Bookkeeping",
    "Payroll",
    "VAT Return",
    "Accounts",
    "Personal Tax",
    "Company Sec",
    "Address",
    "Billing",
  ];
  const [formData, setFormData] = useState({
    companyName: "",
    clientName: "",
    jobHolder: "",
    department: "",
    source: "",
    brand: "",
    lead_Source: "",
    followUpDate: "",
    JobDate: "",
    Note: "",
    stage: "",
    value: "",
    number: "",
  });
  const [active, setActive] = useState(false);
  const [selectFilter, setSelectFilter] = useState("");

  // console.log("formData:", formData);

  // -------Get All Leads-------
  const getAllLeads = async () => {
    setIsLoading(true);
    try {
      if (selectedTab === "progress") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/progress/lead`
        );
        if (data) {
          setLeadData(data.leads);
          setIsLoading(false);
        }
      } else if (selectedTab === "won") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/won/lead`
        );
        if (data) {
          setLeadData(data.leads);
          setIsLoading(false);
        }
      } else {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/lost/lead`
        );
        if (data) {
          setLeadData(data.leads);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllLeads();
  }, [selectedTab]);

  const getLeads = async () => {
    setLoad(true);
    try {
      if (selectedTab === "progress") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/progress/lead`
        );
        if (data) {
          setLeadData(data.leads);
          setIsLoading(false);
        }
      } else if (selectedTab === "won") {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/won/lead`
        );
        if (data) {
          setLeadData(data.leads);
          setIsLoading(false);
        }
      } else {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/fetch/lost/lead`
        );
        if (data) {
          setLeadData(data.leads);
          setIsLoading(false);
        }
      }
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  // Total Source Count
  const getSourceCount = (source) => {
    if (filteredData.length > 0 || selectFilter) {
      return filteredData.filter((item) => item.source === source).length;
    } else {
      return leadData.filter((item) => item.source === source).length;
    }
  };

  const sourcePercentage = (source) => {
    const totalLead =
      filteredData.length > 0 || selectFilter
        ? filteredData.length
        : leadData.length;
    const sourceCount = getSourceCount(source);
    return totalLead > 0 ? ((sourceCount / totalLead) * 100).toFixed(0) : 0;
  };

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access?.some((item) => item?.permission.includes("Leads"))
        ) || []
      );

      setUserName(
        data?.users
          ?.filter((user) =>
            user.role?.access.some((item) => item?.permission.includes("Leads"))
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

  //   Create New Lead
  const handleCreateLead = async () => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/create/lead`,
        { ...formData }
      );
      if (data) {
        setLeadData((prevData) =>
          prevData ? [...prevData, data.lead] : [data.lead]
        );
        getAllLeads();
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
        const updateLead = data?.lead;

        setLeadData((prevData) =>
          prevData.filter((item) => item._id !== updateLead._id)
        );
        if (filteredData) {
          setFilteredData((prevData) =>
            prevData.filter((item) => item._id !== updateLead._id)
          );
        }
        getLeads();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  //  ------------Delete Lead------------>
  const handleDeleteLeadConfirmation = (taskId) => {
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
        handleDeleteLead(taskId);
        Swal.fire("Deleted!", "Your lead has been deleted.", "success");
      }
    });
  };

  const handleDeleteLead = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/delete/lead/${id}`
      );
      if (data) {
        const filteredData = leadData?.filter((item) => item._id !== id);
        setLeadData(filteredData);

        if (filteredData) {
          const filterData1 = filteredData?.filter((item) => item._id !== id);
          setFilteredData(filterData1);
        }
        getAllLeads();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //   Update Form Data
  const handleUpdateData = async (leadId, updateData) => {
    if (!leadId) {
      toast.error("Lead id is required!");
      return;
    }

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/update/lead/${leadId}`,
        { ...updateData }
      );
      if (data?.success) {
        const updateLead = data?.lead;

        setLeadData((prevData) =>
          prevData.filter((item) => item._id !== updateLead._id)
        );
        if (filteredData) {
          setFilteredData((prevData) =>
            prevData.filter((item) => item._id !== updateLead._id)
          );
        }
        setFormData({
          companyName: "",
          clientName: "",
          jobHolder: "",
          department: "",
          source: "",
          brand: "",
          lead_Source: "",
          followUpDate: "",
          JobDate: "",
          Note: "",
          stage: "",
          value: "",
          number: "",
        });
        toast.success("Lead data updated!");
        getLeads();
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

  // Copy Lead
  const handleCopyLead = async ({
    jobHolder,
    department,
    source,
    brand,
    lead_Source,
    followUpDate,
    JobDate,
    stage,
  }) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/create/lead`,
        {
          jobHolder,
          department,
          source,
          brand,
          lead_Source,
          followUpDate,
          JobDate,
          stage,
        }
      );
      if (data) {
        setLeadData((prevData) =>
          prevData ? [...prevData, data.lead] : [data.lead]
        );
        getAllLeads();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  const columns = useMemo(
    () => [
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
        Cell: ({ cell, row }) => {
          const companyName = row.original.companyName;
          const [show, setShow] = useState(false);
          const [localCompanyName, setLocalCompanyName] = useState(companyName);

          const handleSubmit = (e) => {
            setFormData((prevData) => ({
              ...prevData,
              companyName: localCompanyName,
            }));

            handleUpdateData(row.original._id, {
              ...formData,
              companyName: localCompanyName,
            });

            setShow(false);
          };

          return (
            <div className="w-full px-1">
              {show ? (
                <input
                  type="text"
                  value={localCompanyName}
                  autoFocus
                  onChange={(e) => setLocalCompanyName(e.target.value)}
                  onBlur={(e) => handleSubmit(e.target.value)}
                  className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
                />
              ) : (
                <div
                  onDoubleClick={() => setShow(true)}
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
        Cell: ({ cell, row }) => {
          const clientName = row.original.clientName;
          const [show, setShow] = useState(false);
          const [localClientName, setLocalClientName] = useState(clientName);

          const handleSubmit = (e) => {
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
                <input
                  type="text"
                  value={localClientName}
                  autoFocus
                  onChange={(e) => setLocalClientName(e.target.value)}
                  onBlur={(e) => handleSubmit(e.target.value)}
                  className="w-full h-[2.2rem] outline-none rounded-md border-2 px-2 border-blue-950"
                />
              ) : (
                <div
                  onDoubleClick={() => setShow(true)}
                  className="cursor-pointer w-full"
                >
                  {localClientName ? (
                    localClientName
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
        Cell: ({ cell, row }) => {
          const department = row.original.department;
          const [show, setShow] = useState(false);

          const [localDepartment, setLocalDepartment] = useState(
            department || ""
          );

          const handleChange = (e) => {
            const selectedValue = e.target.value;
            setLocalDepartment(selectedValue);

            setFormData((prevData) => ({
              ...prevData,
              department: localDepartment,
            }));

            handleUpdateData(row.original._id, {
              ...formData,
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
                  {department ? (
                    <span>{department}</span>
                  ) : (
                    <span className="text-white">.</span>
                  )}
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
        filterFn: "equals",
        filterSelectOptions: departments?.map((dep) => dep),
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
        Cell: ({ cell, row }) => {
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
              ...formData,
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
                  {brand ? (
                    <span>{brand}</span>
                  ) : (
                    <span className="text-white">.</span>
                  )}
                </div>
              ) : (
                <select
                  value={localBrand || ""}
                  className="w-full h-[2rem] rounded-md border-none  outline-none"
                  onChange={handleChange}
                >
                  <option value="empty"></option>
                  {brands?.map((brand, i) => (
                    <option value={brand} key={i}>
                      {brand}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: brands?.map((brand) => brand),
        filterVariant: "select",
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
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const value = row.original.value;
          const [show, setShow] = useState(false);
          const [localValue, setLocalValue] = useState(value || "");

          const handleChange = (e) => {
            setFormData((prevData) => ({
              ...prevData,
              value: localValue,
            }));

            handleUpdateData(row.original._id, {
              ...formData,
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
                  {value ? (
                    <span>{value}</span>
                  ) : (
                    <span className="text-white">.</span>
                  )}
                </div>
              ) : (
                <input
                  value={localValue || ""}
                  className="w-full h-[2rem] px-1 rounded-md border-none  outline-none"
                  onChange={(e) => setLocalValue(e.target.value)}
                  onBlur={(e) => handleChange(e.target.value)}
                />
              )}
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: brands?.map((brand) => brand),
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
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const number = row.original.number;
          const [show, setShow] = useState(false);
          const [localValue, setLocalValue] = useState(number || "");

          const handleChange = (e) => {
            setFormData((prevData) => ({
              ...prevData,
              number: localValue,
            }));

            handleUpdateData(row.original._id, {
              ...formData,
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
                  {number ? (
                    <span>{number}</span>
                  ) : (
                    <span className="text-white">.</span>
                  )}
                </div>
              ) : (
                <input
                  value={localValue || ""}
                  className="w-full h-[2rem] px-1 rounded-md border-none  outline-none"
                  onChange={(e) => setLocalValue(e.target.value)}
                  onBlur={(e) => handleChange(e.target.value)}
                />
              )}
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: brands?.map((brand) => brand),
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
                {leadSource.map((leadS) => (
                  <option value={leadS}>{leadS}</option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
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
              ...formData,
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
                  {lead_Source ? (
                    <span>{lead_Source}</span>
                  ) : (
                    <span className="text-white">.</span>
                  )}
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
        filterFn: "equals",
        filterSelectOptions: leadSource?.map((leads) => leads),
        filterVariant: "select",
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
      //   Follow Up
      {
        accessorKey: "followUpDate",
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
                Followup Date
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
              ...formData,
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
      // Days
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
              <input
                type="text"
                placeholder="Search Days..."
                className="border rounded px-2 py-1 text-sm outline-none"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
              />
            </div>
          );
        },
        Cell: ({ row }) => {
          const createdAt = new Date(row.original.createdAt);
          const deadline = new Date(row.original.followUpDate);

          if (!createdAt || !deadline) return <div>N/A</div>;

          const timeDifference = deadline.getTime() - createdAt.getTime();
          const dayDifference = Math.ceil(
            timeDifference / (1000 * 60 * 60 * 24)
          );

          return (
            <div className="w-full text-center">
              {dayDifference > 0 ? (
                `${dayDifference} Days`
              ) : (
                <span className="text-red-500">Expired</span>
              )}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const createdAt = new Date(row.original.createdAt);
          const deadline = new Date(row.original.followUpDate);

          if (!createdAt || !deadline) return false;

          const timeDifference = deadline.getTime() - createdAt.getTime();
          const dayDifference = Math.ceil(
            timeDifference / (1000 * 60 * 60 * 24)
          );

          // alert(dayDifference);

          return dayDifference.toString().includes(filterValue);
        },
        enableColumnFilter: true,
        size: 70,
        minSize: 60,
        maxSize: 120,
        grow: false,
      },

      //   Stages
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
        Cell: ({ cell, row }) => {
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
              ...formData,
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
                  {stage ? (
                    <span>{stage}</span>
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
                  {stages?.map((stage, i) => (
                    <option value={stage} key={i}>
                      {stage}
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

      // <-----Action------>
      {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ cell, row }) => {
          return (
            <div className="flex items-center justify-center gap-4 w-full h-full">
              <span
                className="text-[1rem] cursor-pointer"
                onClick={() => {
                  handleCopyLead({
                    jobHolder: row.original.jobHolder,
                    department: row.original.department,
                    source: row.original.source,
                    brand: row.original.brand,
                    lead_Source: row.original.lead_Source,
                    followUpDate: row.original.followUpDate,
                    JobDate: row.original.JobDate,
                    stage: row.original.stage,
                  });
                }}
                title="Copy Lead"
              >
                <GrCopy className="h-5 w-5 text-cyan-500 hover:text-cyan-600 " />
              </span>
              <span
                className=""
                title="Won Lead"
                onClick={() => {
                  handleLeadStatus(row.original._id, "won");
                }}
              >
                <FaTrophy className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
              </span>
              <span
                className=""
                title="Lost Lead"
                onClick={() => {
                  handleLeadStatus(row.original._id, "lost");
                }}
              >
                <GiBrokenHeart className="h-6 w-6 cursor-pointer text-red-500 hover:text-red-600" />
              </span>

              <span
                className="text-[1rem] cursor-pointer"
                onClick={() => handleDeleteLeadConfirmation(row.original._id)}
                title="Delete Lead!"
              >
                <AiTwotoneDelete className="h-5 w-5 text-pink-500 hover:text-pink-600 " />
              </span>
            </div>
          );
        },
        size: 160,
      },
      //  --- Note--->
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
        Cell: ({ cell, row }) => {
          const note = row.original.Note;
          const [show, setShow] = useState(false);
          const [localNote, setLocalNote] = useState(note);

          const handleSubmit = (e) => {
            e.preventDefault();
            setFormData((prevData) => ({
              ...prevData,
              Note: localNote,
            }));
            handleUpdateData(row.original._id, {
              ...formData,
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
    ],
    // eslint-disable-next-line
    [users, auth, leadData, load]
  );

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");
    setSelectFilter("");
  };

  const table = useMaterialReactTable({
    columns,
    data: leadData || [],
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
        backgroundColor: "rgb(193, 183, 173, 0.8)",
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

    setFilteredData(filteredRows);
  }, [table.getFilteredRowModel().rows]);

  return (
    <Layout>
      <div className=" relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              Leads
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
              onClick={() => handleCreateLead()}
              style={{ padding: ".4rem 1rem" }}
            >
              New Lead
            </button>
          </div>
        </div>
        {/*  */}
        <>
          <div className="flex items-center gap-5">
            <div className="flex items-center  border-2 border-orange-500 rounded-sm overflow-hidden mt-5 transition-all duration-300 w-fit">
              <button
                className={`py-1 px-4  outline-none transition-all duration-300  w-[6rem] ${
                  selectedTab === "progress"
                    ? "bg-orange-500 text-white "
                    : "text-black bg-gray-100"
                }`}
                onClick={() => setSelectedTab("progress")}
              >
                Progress
              </button>
              <button
                className={`py-1 px-4 outline-none border-l-2 border-orange-500 transition-all duration-300 w-[6rem]  ${
                  selectedTab === "won"
                    ? "bg-orange-500 text-white"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setSelectedTab("won");
                  // navigate("/tickets/complete");
                }}
              >
                Won
              </button>
              <button
                className={`py-1 px-4 outline-none border-l-2 border-orange-500 transition-all duration-300 w-[6rem]  ${
                  selectedTab === "lost"
                    ? "bg-orange-500 text-white"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => {
                  setSelectedTab("lost");
                  // navigate("/tickets/complete");
                }}
              >
                Lost
              </button>
            </div>
            <button
              onClick={() => setActive(!active)}
              className={`flex items-center justify-center px-2 py-[4px] mt-[1.2rem] bg-gray-100  border border-gray-300 ${
                active && "bg-orange-600 text-white border-orange-500"
              }   rounded-md hover:shadow-md `}
            >
              <MdOutlineAnalytics className="h-7 w-7" />
            </button>
          </div>
          <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />
          {active && (
            <>
              <div className="flex flex-col gap-2  py-1 px-4">
                <h3 className="font-semibold text-lg">Lead Source </h3>
                <div className="flex items-center gap-5">
                  {sources.map((source, i) => (
                    <div
                      className={`flex items-center gap-[2px] py-1 px-3 rounded-[2rem] text-white ${
                        source === "Invitation"
                          ? "bg-green-600"
                          : source === "Proposal"
                          ? "bg-pink-600"
                          : "bg-purple-600"
                      } `}
                      key={i}
                    >
                      <span className="font-medium text-[1rem]">{source}</span>
                      （{getSourceCount(source)} - {sourcePercentage(source)}%）
                    </div>
                  ))}
                </div>
              </div>
              <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />
            </>
          )}
        </>

        {/* ---------Table Detail---------- */}
        <div className="w-full h-full">
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-screen px-4 py-4">
              <Loader />
            </div>
          ) : (
            <div className="w-full min-h-[10vh] relative ">
              <div className="h-full hidden1 overflow-y-auto relative">
                <MaterialReactTable table={table} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
