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
 
import toast from "react-hot-toast";
import { format } from "date-fns";
import { AiOutlineEdit, AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import SubscriptionModel from "../SubscriptionModel";
import { useSelector } from "react-redux";
import getSubscriptionColumns from "../../pages/Subscription/table/columns";
import NewTicketModal from "../../utlis/NewTicketModal";

const Subscriptions = forwardRef(
  ({ subscriptionData, setSubscriptionData, childRef, setIsload }, ref) => {
 
       const auth = useSelector((state => state.auth.auth));


    const [subscriptionsArr, setSubscriptionsArr] = useState([]);
    const [clientCompanyName, setClientCompanyName] = useState("");
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);

    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [userName, setUserName] = useState([]);
    const [subscriptionId, setSubscriptionId] = useState("");
    const [filterData, setFilterData] = useState([]);
    const [totalFee, setTotalFee] = useState(0);
    const [dataLable, setDataLabel] = useState([]);
    //
    const subscriptions = ["Weekly", "Monthly", "Quarterly", "Yearly"];
    const states = ["Paid", "Unpaid", "On Hold", "Not Due"];

    useEffect(() => {

      setSubscriptionsArr(subscriptionData)

    }, [subscriptionData])

    const fetchSubscriptions = async () => {
      setIsload(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/subscriptions/fetch/all`
        );
        if (data) {
          setSubscriptionData(data.subscriptions);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsload(false);
      }
    };

    useImperativeHandle(childRef, () => ({
      refreshData: fetchSubscriptions,
    }));

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


















      // --------------Update JobHolder------------>
      const handleUpdateSubscription = async (id, value, type) => {
    
    
        const allowedFields = [ "jobHolder", "billingStart", "billingEnd", "deadline", "lead", "fee", "note", "status", "subscription", ];
    
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








      

    // // --------------Update JobHolder------------>
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

    // Update data Label
    const addDatalabel = async (id, labelId) => {
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
      data: subscriptionsArr,
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
);

export default Subscriptions;
