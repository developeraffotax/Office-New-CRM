import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import Loader from "../../utlis/Loader";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import axios from "axios";
import { AiTwotoneDelete } from "react-icons/ai";
import { format } from "date-fns";
import { GrCopy } from "react-icons/gr";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { CiEdit } from "react-icons/ci";
 
import AddProposal from "../../pages/Proposal/AddProposal";
import { useSelector } from "react-redux";
import getProposalColumns from "../../pages/Proposal/table/columns";

const Proposals = forwardRef(
  ({ proposalData, setProposalData, childRef, setIsload }, ref) => {
     
       const auth = useSelector((state => state.auth.auth));
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const [proposals, setProposals] = useState([]);

    const [filteredData, setFilteredData] = useState([]);
    const [users, setUsers] = useState([]);
    const [userName, setUserName] = useState([]);
    const [load, setLoad] = useState(false);
    const [formData, setFormData] = useState({
      clientName: "",
      jobHolder: "",
      subject: "",
      createdAt: "",
      jobDate: "",
      deadline: "",
      source: "",
      note: "",
      propos: "",
      lead: "",
      client: "",
      value: "",
    });
    const [selectFilter, setSelectFilter] = useState("");
    const [proposalId, setProposalId] = useState("");
    const sources = ["Email", "UPW", "PPH", "Other"];
    const status = ["Yes", "No"];
    const [showMail, setShowMail] = useState(false);
    const [mail, setMail] = useState("");
    const mailDetailref = useRef(null);

    console.log("filteredData:", filteredData);

    useEffect(() => {

      setProposals(proposalData);


    }, [proposalData, ]); 



    const getProposal = async () => {
      setLoad(true);
      setIsload(true);
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
      } finally {
        setIsload(false);
      }
    };

    useImperativeHandle(childRef, () => ({
      refreshData: getProposal,
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
              item?.permission?.includes("Proposals")
            )
          ) || []
        );

        setUserName(
          data?.users
            ?.filter((user) =>
              user.role?.access.some((item) =>
                item?.permission?.includes("Proposals")
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
          getProposal();
          setFormData({
            clientName: "",
            jobHolder: "",
            createdAt: "",
            jobDate: "",
            deadline: "",
            source: "",
            note: "",
            status: "",
            value: "",
          });
          toast.success("Proposal data updated!");
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
        () =>
          getProposalColumns({
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
             
          }),
        [auth, users, status, sources, ]
      );

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
      data: proposals || [],
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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
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
      <>
        <div className=" relative w-full h-[100%] overflow-y-auto ">
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
      </>
    );
  }
);

export default Proposals;
