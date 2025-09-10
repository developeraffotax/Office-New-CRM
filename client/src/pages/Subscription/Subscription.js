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
import getSubscriptionColumns from "./table/columns";

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
  const columns = useMemo(() => getSubscriptionColumns({

    
    auth,
    users,
    subscriptions,

    userName,
    totalFee,
    states,
    dataLable,



    
    
    
    addDatalabel,
     setSubscriptionId,
      setShow,
       handleDeleteConfirmation,
        setClientCompanyName,
         setShowNewTicketModal,

    handleUpdateSubscription,
     
  }), [ auth, users, subscriptions, userName, totalFee, states, dataLable]);



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
