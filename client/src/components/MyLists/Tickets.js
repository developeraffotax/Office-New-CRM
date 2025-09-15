import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import { format } from "date-fns";

import SendEmailModal from "../../components/Tickets/SendEmailModal";
import toast from "react-hot-toast";
import axios from "axios";
 
import { MdCheckCircle, MdInsertComment } from "react-icons/md";
import { AiOutlineEdit, AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import JobCommentModal from "../../pages/Jobs/JobCommentModal";
import { style } from "../../utlis/CommonStyle";
import { useSelector } from "react-redux";
import { getTicketsColumns } from "../../pages/Tickets/table/columns";
import { NumberFilterPortal } from "../../utlis/NumberFilterPortal";
import ActivityLogDrawer from "../Modals/ActivityLogDrawer";
import { Drawer } from "@mui/material";
import EmailDetailDrawer from "../../pages/Tickets/EmailDetailDrawer";

const jobStatusOptions = [
  "Quote",
  "Data",
  "Progress",
  "Queries",
  "Approval",
  "Submission",
  "Billing",
  "Feedback",
];

const Tickets = forwardRef(
  ({ emailData, setEmailData, childRef, setIsload }, ref) => {
     

      const anchorRef = useRef(null);


       const auth = useSelector((state => state.auth.auth));
    const [showSendModal, setShowSendModal] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [userName, setUserName] = useState([]);
    const companyData = ["Affotax", "Outsource"];
    const status = ["Read", "Unread", "Send"];
    const navigate = useNavigate();
    const [isComment, setIsComment] = useState(false);
    const commentStatusRef = useRef(null);
    const [commentTicketId, setCommentTicketId] = useState("");
    const [access, setAccess] = useState([]);

    const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 20, // ✅ default page size
    });



  const [ticketId, setTicketId] = useState("")

  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen) => {
     
    setOpen(newOpen);
  };


    const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
    const [activityDrawerTicketId, setActivityDrawerTicketId] = useState("");






const [filterInfo, setFilterInfo] = useState({
  col: null,
  value: "",
  type: "eq",
});



    
const handleFilterClick = (e, colKey) => {
  e.stopPropagation();
  anchorRef.current = e.currentTarget;
  setFilterInfo({
    col: colKey,
    value: "",
    type: "eq",
  });
};


const handleCloseFilter = () => {
  setFilterInfo({ col: null, value: "", type: "eq" });
  anchorRef.current = null;
};

const applyFilter = (e) => {
  e.stopPropagation()
  const { col, value, type } = filterInfo;
  if (col && value) {
    table.getColumn(col)?.setFilterValue({ type, value: parseFloat(value) });
  }
  handleCloseFilter();
};



    // Get Auth Access
    useEffect(() => {
      if (auth.user) {
        const filterAccess = auth.user.role.access
          .filter((role) => role.permission === "Tickets")
          .flatMap((jobRole) => jobRole.subRoles);

        setAccess(filterAccess);
      }
    }, [auth]);

    // With Loading
    const getEmails = async () => {
      setIsload(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/tickets`
        );
        if (data) {
          setEmailData(data.emails);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsload(false);
      }
    };

    useImperativeHandle(childRef, () => ({
      refreshData: getEmails,
    }));

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

    // ------------Update Status ------------>
    const updateJobStatus = async (ticketId, status) => {
      try {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/tickets/update/ticket/${ticketId}`,
          { jobStatus: status }
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

          //getEmails();
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


















      const updateTicketSingleField = async (ticketId, update) => {
        // if (!ticketId || !updates) {
        //   toast.error("Ticket ID and updates are required!");
        //   return;
        // }
    
        try {
          const { data } = await axios.put(
            `${process.env.REACT_APP_API_URL}/api/v1/tickets/update/ticket/${ticketId}`,
            update
          );
    
          if (data) {
            const updatedTicket = data?.ticket;
    
            // Update the emailData state with the updated ticket
            setEmailData((prevData) =>
              prevData.map((item) =>
                item._id === updatedTicket._id ? updatedTicket : item
              )
            );
    
            // Update the filteredData state if it exists
            if (filteredData) {
              setFilteredData((prevData) =>
                prevData.map((item) =>
                  item._id === updatedTicket._id ? updatedTicket : item
                )
              );
            }
    
            toast.success("Ticket updated successfully!");
          }
        } catch (error) {
          console.log(error);
          toast.error(error?.response?.data?.message || "An error occurred");
        }
      };






      
      
        const updateJobHolder = async (ticketId, jobHolder) => {
          try {
            const { data } = await axios.put(
              `${process.env.REACT_APP_API_URL}/api/v1/tickets/update/ticket/${ticketId}`,
              { jobHolder }
            );
            if (data) {
              const updateTicket = data?.ticket;
              toast.success("Job Holder updated successfully!");
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
      
    







    // ------------------------Table Detail------------->

    // Clear table Filter
    const handleClearFilters = () => {
      table.setColumnFilters([]);

      table.setGlobalFilter("");
    };

    useImperativeHandle(ref, () => ({
      handleClearFilters,
    }));

    const getCurrentMonthYear = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      return `${year}-${month}`;
    };

 



    
    
      
        // ----------------------------
        // 🔑 Authentication & User Data
        // ----------------------------
        const authCtx = useMemo(
          () => ({
            auth,
            users,
             
          }),
          [auth, users, ]
        );
      
        // ----------------------------
        // 📂 Projects
        // ----------------------------
        const companyCtx = useMemo(
          () => ({
            companyData,
             
          }),
          [companyData]
        );
      
        // ----------------------------
        // 📊 Tasks / Filtering
        // ----------------------------
        const ticketCtx = useMemo(
          () => ({
             
            anchorRef,
            status,
            jobStatusOptions,
            navigate,
            handleFilterClick,
            updateJobStatus,
            updateTicketSingleField,
            updateJobHolder,
            updateJobDate,
            toggleDrawer,
            setTicketId,
    
             setIsActivityDrawerOpen,
             setActivityDrawerTicketId,
             setCommentTicketId,
             setIsComment,
             handleUpdateTicketStatusConfirmation,
             handleDeleteTicketConfirmation
          }),
          [status, jobStatusOptions,  ]
        );
      
        // ----------------------------
     
     
      
        
      
        // ----------------------------
        // 📦 Merge into one ctx if needed
        // ----------------------------
        const ctx = useMemo(
          () => ({
            ...authCtx,
            ...ticketCtx,
            ...companyCtx,
             
            
          }),
          [authCtx, ticketCtx, companyCtx  ]
        );
      
        // ----------------------------
        // 📑 Columns
        // ----------------------------
        const columns = useMemo(() => getTicketsColumns(ctx), [ctx]);
    
    







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
        columnVisibility: { _id: false, }
      },

      state: {
        pagination, // ✅ Controlled pagination
        density: "compact",
      },
      onPaginationChange: setPagination, // ✅ Hook for page changes

      autoResetPageIndex: false,

      muiTableHeadCellProps: {
        style: {
          fontWeight: "600",
          fontSize: "14px",
          background: "#E5E7EB",
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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <>
        <div className=" relative w-full h-full overflow-y-auto ">
          <div className="flex items-center justify-end pb-4 pr-4">
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






          
          {filterInfo.col && anchorRef.current && (
            <NumberFilterPortal
              anchorRef={anchorRef}
              value={filterInfo.value}
              filterType={filterInfo.type}
              onApply={applyFilter}
              onClose={handleCloseFilter}
              setValue={(val) => setFilterInfo((f) => ({ ...f, value: val }))}
              setFilterType={(type) => setFilterInfo((f) => ({ ...f, type }))}
            />
          )}









          {/* ---------------------Activity Log Drawer------------------ */}
                  {isActivityDrawerOpen && (
                    <ActivityLogDrawer isOpen={isActivityDrawerOpen} onClose={() => setIsActivityDrawerOpen(false)} ticketId={activityDrawerTicketId} />
          )}
          
          
          
          
             <Drawer open={open} onClose={() => {toggleDrawer(false); } } anchor="right"   sx={{zIndex: 1400, '& .MuiDrawer-paper': {
                  width: 600, // Set your custom width here (px, %, etc.)
                },}}  >
                          
                            <div className="  " >
            
                              <EmailDetailDrawer id={ticketId} toggleDrawer={toggleDrawer} />
                            </div>
            
                        </Drawer>



        </div>
      </>
    );
  }
);

export default Tickets;
