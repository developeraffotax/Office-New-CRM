import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { style } from "../../utlis/CommonStyle";
import axios from "axios";
 
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { AiTwotoneDelete } from "react-icons/ai";
import { MdCheckCircle, MdInsertComment } from "react-icons/md";
import { MdOutlineModeEdit } from "react-icons/md";
import Swal from "sweetalert2";
 

import { VscGraph } from "react-icons/vsc";
import CompletedGoals from "../../pages/Goal/CompletedGoals";
import HandleGoalModal from "../Goal/HandleGoalModal";
import ChartData from "../../pages/Goal/ChartData";
import JobCommentModal from "../../pages/Jobs/JobCommentModal";
import { GoEye } from "react-icons/go";
import { GrCopy } from "react-icons/gr";
import GoalDetail from "../Goal/GoalDetail";
import { useSelector } from "react-redux";
import getGoalColumns from "../../pages/Goal/table/columns";

const Goals = forwardRef(
  ({ goalsData, setGoalsData, childRef, setIsload }, ref) => {
     const auth = useSelector((state => state.auth.auth));

    const [goals, setGoals] = useState([]); 


    const [show, setShow] = useState(false);
    const [goalId, setGoalId] = useState("");
    const [users, setUsers] = useState([]);
    const [userName, setUserName] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterData, setFilterData] = useState([]);
    const [completeGoalsData, setCompleteGoalsData] = useState([]);
    const [selectedTab, setSelectedTab] = useState("progress");
    const [showGraph, setShowGraph] = useState(false);
    const [selectChart, setSelectChart] = useState("Line & Bar");
    const [isComment, setIsComment] = useState(false);
    const [commentTaskId, setCommentTaskId] = useState("");
    const commentStatusRef = useRef(null);
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


    useEffect(() => {
      setGoals(goalsData)
      // eslint-disable-next-line
    }
    , [goalsData]);



    const getGoals = async () => {
      setIsload(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/goals/fetch/all/goals`
        );
        if (data) {
          setGoalsData(data.goals);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsload(false);
      }
    };

    useImperativeHandle(childRef, () => ({
      refreshData: getGoals,
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
              item?.permission?.includes("Goals")
            )
          ) || []
        );

        setUserName(
          data?.users
            ?.filter((user) =>
              user.role?.access.some((item) =>
                item?.permission?.includes("Goals")
              )
            )
            ?.map((user) => user.name) || []
        );
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      getAllUsers();
      // eslint-disable-next-line
    }, []);

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
            prevData.filter((item) => item._id !== updateGoal._id)
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

    //   --------------------Table Data --------------->
    const getCurrentMonthYear = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      return `${year}-${month}`;
    };
    // Clear table Filter
    // Clear table Filter
    const handleClearFilters = () => {
      table.setColumnFilters([]);

      table.setGlobalFilter("");
    };

    useImperativeHandle(ref, () => ({
      handleClearFilters,
    }));

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
      data: goals || [],
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
    }, [table.getFilteredRowModel().rows]);

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
        <div className=" relative w-full h-[100%] overflow-y-auto">
          {/* ----------Buttons------ */}
          <div className="flex items-center gap-5 mt-4">
            <div className="flex items-center  border-2 border-orange-500 rounded-sm overflow-hidden mt-2 transition-all duration-300 w-fit">
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
            <span
              onClick={() => setShowGraph(!showGraph)}
              className="ml-[2rem] mt-2 p-1 rounded-md hover:shadow-md transition-all duration-300 cursor-pointer text-orange-500 hover:text-orange-600 bg-gray-200/60 hover:bg-gray-200/80 border"
            >
              <VscGraph className="h-6 w-6" />
            </span>
          </div>
          <hr className="w-full h-[1px] bg-gray-300 my-4" />

          {/* ---------Table Detail---------- */}
          {selectedTab === "progress" ? (
            <div className="w-full h-full">
              {loading ? (
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
          ) : (
            <CompletedGoals
              setShow={setShow}
              setGoalId={setGoalId}
              setCompleteGoalsData={setCompleteGoalsData}
              fetchGoals={getGoals}
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
            <div className="fixed top-[4rem] right-0 w-[21rem] sm:w-[50%] h-full z-[999] bg-white flex  flex-col gap-4 py-4  px-4">
              <div className="inputBox">
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
                goalsData={filterData ? filterData : goalsData}
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
);

export default Goals;
