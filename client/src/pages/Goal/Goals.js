import React, { useEffect, useMemo, useRef, useState } from "react";
 
import { IoBriefcaseOutline, IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import HandleGoalModal from "../../components/Goal/HandleGoalModal";
import axios from "axios";
 
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { AiTwotoneDelete } from "react-icons/ai";
import { MdCheckCircle, MdDeleteOutline, MdInsertComment, MdOutlineContentCopy } from "react-icons/md";
import { MdOutlineModeEdit } from "react-icons/md";
import Swal from "sweetalert2";
import CompletedGoals from "./CompletedGoals";
import ChartData from "./ChartData";
import { VscGraph } from "react-icons/vsc";
import JobCommentModal from "../Jobs/JobCommentModal";
import { TbLoader2 } from "react-icons/tb";
import { GrCopy } from "react-icons/gr";
import { GoEye } from "react-icons/go";
import GoalDetail from "../../components/Goal/GoalDetail";
 
import { FaListOl } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import QuickAccess from "../../utlis/QuickAccess";
import DraggableUserList from "../../utlis/DraggableUserList";
import { filterByRowId } from "../../utlis/filterByRowId";
import { useSelector } from "react-redux";
import getGoalColumns from "./table/columns";
import OverviewForPages from "../../utlis/overview/OverviewForPages";
import { isAdmin } from "../../utlis/isAdmin";

export default function Goals() {


   
const auth = useSelector((state) => state.auth.auth);

  const [show, setShow] = useState(false);
  const [goalId, setGoalId] = useState("");
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [goalsData, setGoalsData] = useState([]);
  const [completeGoalsData, setCompleteGoalsData] = useState([]);
  const [filterGoals, setFilterGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("progress");
  const [showGraph, setShowGraph] = useState(false);
  const [selectChart, setSelectChart] = useState("Line & Bar");
  const [isComment, setIsComment] = useState(false);
  const [commentTaskId, setCommentTaskId] = useState("");
  const commentStatusRef = useRef(null);
  const [rowSelection, setRowSelection] = useState({});
  const [isUpdate, setIsUpdate] = useState(false);
  const [status, setStatus] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [activeUser, setActiveUser] = useState("All");
  const [showGoalDetail, setShowGoalDetail] = useState(false);
  const [note, setNote] = useState("");
  const [formData, setFormData] = useState({
    subject: "",
    achievement: "",
    startDate: "",
    endDate: "",
    goalType: "",
    jobHolder: "",
  });
  const goalTypes = [
    "Target Lead Count",
    "Target Lead Value",
    "Target Proposal Count",
    "Target Proposal Value",
    "Increase Client",
    "Increase Fee",
    "Total Proposal",
    "Proposal Lead",
    "Proposal Client",
    "Total Lead",
    "Lead Won",
    "Lead Won Manual",
    "Affotax Clicks",
    "Affotax Impressions",
    "Job Prepared",
    "Job Review",
    "Job Filed",
    "Chargeable Time %",
    "Manual Goal",
  ];

 

  
        const [showJobHolderFilter, setShowJobHolderFilter] = useState(true);


    const [searchParams] = useSearchParams();
    const comment_taskId = searchParams.get('comment_taskId');
    const navigate = useNavigate();
  
 
  




  // -------Get All Proposal-------
  const getAllGoals = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/fetch/all/goals`
      );
      if (data) {
        // setGoalsData(data.goals);
        setLoading(false);
         
        if (auth.user.role.name === "Admin") {
          setGoalsData(data.goals);
        } else {
          const filteredGoals = data.goals.filter((goal) =>
            goal.usersList.some((user) => user._id === auth?.user?.id)
          );
          setGoalsData(filteredGoals);
        }
        // filter goals by user
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllGoals();
  }, []);

  const getGoals = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/fetch/all/goals`
      );
      if (data) {
        // setGoalsData(data.goals);
        if (auth.user.role.name === "Admin") {
          setGoalsData(data.goals);
        } else {
          const filteredGoals = data.goals.filter((goal) =>
            goal.usersList.some((user) => user._id === auth?.user?.id)
          );
          setGoalsData(filteredGoals);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };













  function mergeWithSavedOrder(fetchedUsernames, savedOrder) {
    const savedSet = new Set(savedOrder);
    console.log("savedSET>>>>", savedSet)
    // Preserve the order from savedOrder, but only if the username still exists in the fetched data
    const ordered = savedOrder.filter(name => fetchedUsernames.includes(name));
    
    // Add any new usernames that aren't in the saved order
    const newOnes = fetchedUsernames.filter(name => !savedSet.has(name));
    
    return [...ordered, ...newOnes];
  }



  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access.some((item) => item?.permission?.includes("Goals"))
        ) || []
      );

      
      const userNameArr = data?.users
      ?.filter((user) =>
        user.role?.access.some((item) =>
          item?.permission?.includes("Goals")
        )
      )
      ?.map((user) => user.name) || []

      setUserName(userNameArr);

      const savedOrder = JSON.parse(localStorage.getItem("usernamesOrder"));
        if(savedOrder) {
          const savedUserNames = mergeWithSavedOrder(userNameArr, savedOrder);
          
            setUserName(savedUserNames)
        }




    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line




   




  }, []);

  // ---------------Filter Goals By User---------->

  useEffect(() => {
    const goals = selectedTab === "progress" ? goalsData : completeGoalsData;
    setFilterGoals(goals);

    const selected_user = localStorage.getItem("selected_user_goals");

    if(selected_user) {
      filterGoalsByUser(selected_user)
    }


  }, [goalsData, completeGoalsData, selectedTab]);

  const filterGoalsByUser = (user) => {
    localStorage.setItem("selected_user_goals", user)
    setActiveUser(user);
    const goals = selectedTab === "progress" ? goalsData : completeGoalsData;

    // Check if "All" is selected, else filter by user
    const filteredGoals =
      user === "All"
        ? goals
        : goals.filter((goal) => goal.jobHolder.name === user);

    setFilterGoals(filteredGoals);
  };

  //   Update Data
  const handleUpdateData = async (goalId, updateData) => {
    if (!goalId) {
      toast.error("Goal id is required!");
      return;
    }

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/update/goal/${goalId}`,
        { ...updateData }
      );
      if (data?.success) {
        const updateGoal = data.goal;

        setGoalsData((prevData) =>
          prevData?.filter((item) => item._id !== updateGoal._id)
        );
        if (filterData) {
          setFilterData((prevData) =>
            prevData.filter((item) => item._id !== updateGoal._id)
          );
        }
        setFormData({
          subject: "",
          achievement: "",
          startDate: "",
          endDate: "",
          goalType: "",
          jobHolder: "",
        });
        toast.success("Goal data updated!");
        getGoals();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // ---------Handle Delete Task-------------

  const handleDeleteGoalConfirmation = (goalId) => {
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
        handleDeleteGoal(goalId);
        Swal.fire("Deleted!", "Your goal has been deleted.", "success");
      }
    });
  };

  const handleDeleteGoal = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/delete/goals/${id}`
      );
      if (data) {
        getGoals();

        toast.success("Goal deleted successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //   Complete Status
  const handleupdateConfirmation = (goalId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, complete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleCompleteGoal(goalId);
        Swal.fire("Deleted!", "Goal status updated successfully.", "success");
      }
    });
  };

  const handleCompleteGoal = async (id) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/upadate/goals/status/${id}`,
        { status: "completed" }
      );
      if (data) {
        getGoals();
        toast.success("Goal status updated!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  // ----------Copy Goal---------->
  const handleCopyGoal = async (id) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/copy/goal/${id}`
      );
      if (data) {
        getGoals();
        toast.success("Goal copied successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // -------Update Bulk Jobs------------->

  const updateBulkJob = async (e) => {
    e.preventDefault();
    setIsUpdate(true);
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/goals/bulk/goals`,
        {
          rowSelection: Object.keys(rowSelection).filter(
            (id) => rowSelection[id] === true
          ),
          status,
        }
      );

      if (data) {
        getGoals();
        setShowEdit(false);
        setStatus("");
        toast.success("Goals Updated successfully");
      }
    } catch (error) {
      setIsUpdate(false);
      console.log(error?.response?.data?.message);
      toast.error("Something went wrong!");
    } finally {
      setIsUpdate(false);
    }
  };

  //   --------------------Table Data --------------->
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };
  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");
  };

 
  const columns = useMemo(() => getGoalColumns({
    users,
    auth,
    setFormData,
    handleUpdateData,
    formData,
    goalTypes,
    setCommentTaskId,
    setIsComment,
    setShowGoalDetail,
    setNote,
    handleCopyGoal,
    setGoalId,
    setShow,
    handleupdateConfirmation,
    handleDeleteGoalConfirmation,
     
  }), [users, auth,  formData, goalTypes,  ]);



 





  const table = useMaterialReactTable({
    columns,
    data: filterGoals || [],
    getRowId: (row) => row._id,
    enableStickyHeader: true,
    enableStickyFooter: true,
    muiTableContainerProps: { sx: { maxHeight: "840px" } },
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
      columnVisibility: {
      _id: false,
    },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection, },

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
  }, [table.getFilteredRowModel().rows]);

  

    // Close Comment Box to click anywhere
  //   useEffect(() => {
  //      const handleClickOutside = (event) => {
  
           
  //   const clickInside =
  //     commentStatusRef.current?.contains(event.target) ||
  //     document.querySelector(".MuiPopover-root")?.contains(event.target) || // for MUI Menu
  //     document.querySelector(".EmojiPickerReact")?.contains(event.target) || // for emoji picker
  //     document.querySelector(".MuiDialog-root")?.contains(event.target); // ✅ For Dialog
  
  //   if (!clickInside) {
  //     setIsComment(false);
  //   }
  // };
  
  //     document.addEventListener("mousedown", handleClickOutside);
  //     return () => document.removeEventListener("mousedown", handleClickOutside);
  //   }, []);
  









  const [isReorderList, setIsReorderList] = useState(false)








  const grid = userName?.length || 10;

  const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? "#34495e" : "#34495e",
    padding: grid,
    width: 250,
    borderRadius: "12px",
  });

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: 8,
    margin: `0 0 ${grid}px 0`,
    color: "black",
    borderRadius: "5px",
    
  
    // change background colour if dragging
    background: isDragging ? "#95a5a6" : " #f0f3f4",
  
    // styles we need to apply on draggables
    ...draggableStyle
  });








  // a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};



const onDragEnd = (result) => {
  // dropped outside the list
  if (!result.destination) {
    return;
  }

  const items = reorder(
    userName,
    result.source.index,
    result.destination.index
  );


  localStorage.setItem("usernamesOrder", JSON.stringify(items));
  setUserName( items )
}















  // ----------Copy Selected Goal---------->
  const copySelectedGoals = async () => {

    const selectedRowsArr = Object.keys(rowSelection)
    
    const requestsArr = selectedRowsArr.map(id => axios.post( `${process.env.REACT_APP_API_URL}/api/v1/goals/copy/goal/${id}` ))
    
    try {
     
       const responses = await Promise.all(requestsArr)
    
      if (responses) {
        getGoals();
        toast.success("Goals copied successfully!");

       
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };









 
 


  // ----------Delete Selected Goal---------->
  const deleteSelectedGoals = async () => {

    const result = await Swal.fire({ title: "Are you sure?", text: "You won't be able to revert this!", icon: "warning", showCancelButton: true, confirmButtonColor: "#3085d6", cancelButtonColor: "#d33", confirmButtonText: "Yes, delete it!", })
    
    

    const selectedRowsArr = Object.keys(rowSelection)
    const requestsArr = selectedRowsArr.map(id => axios.delete( `${process.env.REACT_APP_API_URL}/api/v1/goals/delete/goals/${id}` ))


    if(result.isConfirmed) {
      try {
     
        const responses = await Promise.all(requestsArr)
        
       if (responses) {
         getGoals();
         toast.success("Goals Deleted successfully!");
         Swal.fire("Deleted!", "Your goals has been deleted.", "success");
       }
     } catch (error) {
       console.log(error);
       toast.error(error?.response?.data?.message);
     }
    }

    
  };











  
useEffect(() => {
  if (comment_taskId) {
      console.log(comment_taskId, "The comment taskid is 🤎💜💜💙💙💚💚💛💛🧡🧡❤")
    filterByRowId(table, comment_taskId, setCommentTaskId, setIsComment);

    // searchParams.delete("comment_taskId");
    // navigate({ search: searchParams.toString() }, { replace: true });
  }
}, [comment_taskId, searchParams, navigate, table]);



 


  return (
    <>
      <div className=" relative w-full h-[100%] overflow-y-auto py-4 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              Goal's
            </h1>

            <div className="flex items-center gap-3">
              <span
                className={`p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400 mb-1 hover:rotate-180 `}
                onClick={() => {
                  handleClearFilters();
                }}
                title="Clear filters"
              >
                <IoClose className="h-6 w-6 text-white" />
              </span>
              <span className="mt-2"><QuickAccess /></span>
                {isAdmin(auth) && <span className=" "> <OverviewForPages /> </span>}
              <span
                onClick={() => setShowGraph(!showGraph)}
                className="ml-[2rem] hidden sm:block mb-1 p-1 rounded-md hover:shadow-md transition-all duration-300 cursor-pointer text-orange-500 hover:text-orange-600 bg-gray-200/60 hover:bg-gray-200/80 border"
              >
                <VscGraph className="h-6 w-6" />
              </span>

              {auth?.user?.role?.name === "Admin" && <button onClick={(e) => setIsReorderList(prev => !prev)} className={`ml-4 mb-1 p-2 ${isReorderList ? 'bg-orange-500 text-white' : "bg-gray-100"} rounded-md   text-xl  flex gap-2   cursor-pointer hover:shadow-md`}> <FaListOl  />  </button>}

              {auth?.user?.role?.name === "Admin" && <button onClick={copySelectedGoals} title="Copy Multiple Goals" className="transition-all duration-500 ml-4 mb-1 p-2 bg-orange-400 hover:bg-orange-500 text-white rounded-md   text-xl disabled:text-black  disabled:bg-gray-100 disabled:cursor-not-allowed hover:cursor-pointer hover:shadow-md " disabled={Object.keys(rowSelection).length === 0}>   <MdOutlineContentCopy /> </button>}
              {auth?.user?.role?.name === "Admin" && <button onClick={deleteSelectedGoals} title="Delete Multiple Goals" className="transition-all duration-500 ml-4 mb-1 p-2 bg-red-400 hover:bg-red-500 text-white rounded-md   text-xl disabled:text-black  disabled:bg-gray-100 disabled:cursor-not-allowed hover:cursor-pointer hover:shadow-md " disabled={Object.keys(rowSelection).length === 0}>   <MdDeleteOutline /> </button>}
            </div>
          </div>

          {/* ---------Template Buttons */}
          <div className="flex items-center gap-4">
            {/* --------Edit Multiple Job--------- */}
            <span
              className={` p-1 rounded-md hover:shadow-md bg-gray-50 cursor-pointer border ${
                showEdit && "bg-orange-500 text-white"
              }`}
              onClick={() => {
                setShowEdit(!showEdit);
              }}
              title="Edit Multiple Goals"
            >
              <MdOutlineModeEdit className="h-6 w-6  cursor-pointer" />
            </span>

            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShow(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              New Goal
            </button>
          </div>
        </div>
        {/* ----------Buttons------ */}
        <div className="flex items-center gap-5 mt-5">
          <div className="flex items-center  border-2 border-orange-500 rounded-sm overflow-hidden  transition-all duration-300 w-fit">
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
              className={`py-1 flex items-center justify-center px-4 outline-none border-l-2 border-orange-500 transition-all duration-300 w-[6rem]  ${
                selectedTab === "complete"
                  ? "bg-orange-500 text-white"
                  : "text-black bg-gray-100 hover:bg-slate-200"
              }`}
              onClick={() => {
                setSelectedTab("complete");
              }}
            >
              Completed
            </button>
          </div>



              {auth?.user?.role?.name === "Admin" &&

                           <span
                                                className={` p-1 rounded-md hover:shadow-md bg-gray-50 mb-1  cursor-pointer border ${showJobHolderFilter && 'bg-orange-500 text-white '}  `}
                                                onClick={() => {
                                                  
                                                  setShowJobHolderFilter(!showJobHolderFilter);
                                  
                                                }}
                                                title="Filter by Job Holder"
                                              >
                                                <IoBriefcaseOutline className="h-6 w-6  cursor-pointer " />
                                              </span>}






















          {/* ----- Users ---------
          {auth?.user?.role?.name === "Admin" && selectedTab === "progress" && (
            <>
            <div className=" hidden sm:flex items-center  gap-3 overflow-x-auto hidden1">
              <button
                onClick={() => filterGoalsByUser("All")}
                className={`px-4 py-[8px] text-[14px]  rounded-md font-medium transition-all duration-300 ${
                  activeUser === "All"
                    ? "bg-orange-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All
              </button>
              {userName?.map((user) => (
                <button
                  key={user}
                  onClick={() => filterGoalsByUser(user)}
                  className={`px-4 py-[8px]  ${
                    user === "M Salman " && "min-w-[6rem]"
                  }  text-[14px] rounded-md font-medium transition-all duration-300 ${
                    activeUser === user
                      ? "bg-orange-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {user}
                </button>
              ))}
            </div>




            {
              isReorderList && <div className="fixed top-[60px] right-0 z-[9999] shadow-lg ">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                    >
                      { userName?.map((item, index) => (
                        <Draggable key={item} draggableId={item} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >
                              {item}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
  
              </div>
            }
            
            
            
            </>











          )} */}
        </div>










           <div className="w-full py-2">
            {auth?.user?.role?.name === "Admin" && showJobHolderFilter && selectedTab === "progress" && <DraggableUserList table={table} usersArray={users.map(el => el.name)} updateJobHolderCountMapFn={(map, totalCount) => {
          
                            for (const item of goalsData || []) {
                                const holder = item.jobHolder.name ;
                                map.set(holder, (map.get(holder) || 0) + 1);
                                totalCount++;
                              }
          
                              map.set("All", totalCount);
                          
                        } } listName={'goals'} filterColName="jobHolderId"  />}

           </div>


                        


        {/* Update Bulk Jobs */}
        {showEdit && (
          <div className="w-full  py-2">
            <hr className=" bg-gray-300 w-full h-[1px] my-2 mb-3" />
            <form
              onSubmit={updateBulkJob}
              className="w-full flex items-center flex-wrap gap-2 "
            >
              <div className="">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`${style.input} w-full`}
                  style={{ width: "8rem" }}
                >
                  <option value=".">Select Staus</option>

                  <option value="Progress">Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center justify-end pl-4">
                <button
                  className={`${style.button1} text-[15px] `}
                  type="submit"
                  disabled={isUpdate}
                  style={{ padding: ".5rem 1rem" }}
                >
                  {isUpdate ? (
                    <TbLoader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <span>Save</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
       

        {/* ---------Table Detail---------- */}
        {selectedTab === "progress" ? (
          <div className="w-full h-full">
            {loading ? (
              <div className="flex items-center justify-center w-full h-screen px-4 py-4">
                <Loader />
              </div>
            ) : (
              <div className="w-full min-h-[10vh] relative ">
                 <hr className="w-full h-[1px] bg-gray-300 my-2" />
                <div className="h-full hidden1 overflow-y-auto relative">
                  <MaterialReactTable table={table} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <CompletedGoals
            setShow={setShow}
            setGoalId={setGoalId}
            setCompleteGoalsData={setCompleteGoalsData}
            fetchGoals={getGoals}
            showJobHolderFilter={showJobHolderFilter}
          />
        )}

        {/* --------Add Goals-------- */}
        {show && (
          <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
            <HandleGoalModal
              setShow={setShow}
              users={users}
              setGoalId={setGoalId}
              goalId={goalId}
              getGoals={getGoals}
            />
          </div>
        )}
        {/* ---------Goal Note---------- */}
        {showGoalDetail && (
          <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
            <GoalDetail setShowGoalDetail={setShowGoalDetail} note={note} />
          </div>
        )}
        {/* ------------Graphic View setShowGraph-------- */}
        {showGraph && (
          <div className="absolute top-0 3xl:top-[14rem] right-0 w-[91%] h-full z-[999] bg-white flex  flex-col gap-4 py-4  px-4">
            <div className="inputBox " style={{ width: "15rem" }}>
              <select
                value={selectChart}
                onChange={(e) => setSelectChart(e.target.value)}
                className={`${style.input} w-full `}
              >
                <option value={"Line & Bar"}>Line & Bar</option>
                <option value={"Area Chart"}>Area Chart</option>
              </select>
            </div>
            <ChartData
              setShowGraph={setShowGraph}
              goalsData={
                selectedTab === "progress"
                  ? filterData || goalsData
                  : completeGoalsData
              }
              selectChart={selectChart}
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
              jobId={commentTaskId}
              setJobId={setCommentTaskId}
              users={userName}
              type={"Goals"}
              getTasks1={getGoals}
              page={"Goals"}
            />
          </div>
        )}
      </div>
    </>
  );
}
