import React, { useEffect, useMemo, useRef, useState } from "react";

import { style } from "../../utlis/CommonStyle";
import { LuImport } from "react-icons/lu";
import { IoBriefcaseOutline, IoClose } from "react-icons/io5";

import axios from "axios";
import toast from "react-hot-toast";
import { TbLoader2 } from "react-icons/tb";
import { MdOutlineEdit, MdOutlineModeEdit } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import AddTemplateModal from "../../components/Template/AddTemplateModal";
import FAQ from "./FAQ";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import { GrCopy } from "react-icons/gr";
 
import QuickAccess from "../../utlis/QuickAccess";
import DraggableUserList from "../../utlis/DraggableUserList";
import { useSelector } from "react-redux";
import createTemplateColumns from "./table/columns";
import { isAdmin } from "../../utlis/isAdmin";
import OverviewForPages from "../../utlis/overview/OverviewForPages";
import { useEscapeKey } from "../../utlis/useEscapeKey";
import { useClickOutside } from "../../utlis/useClickOutside";
import { usePersistedUsers } from "../../hooks/usePersistedUsers";
import SelectedUsers from "../../components/SelectedUsers";
import { GoEye, GoEyeClosed } from "react-icons/go";


export const colVisibility = {
  templateRef: true,
  name: true,
  category: true,
  description: true,
  template: true,
  userList: true,
  actions: true,
  
 
};


export default function Template() {
  const auth = useSelector((state) => state.auth.auth);

  const [showCategory, setShowCategory] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [name, setName] = useState("");
  const [loading, setlaoding] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  // ---------Templates------------------
  const [templateData, setTemplateData] = useState([]);
  const [addTemplate, setAddTemplate] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [isloading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("templates");
  const [showTemplate, setShowTemplate] = useState(false);
  const [template, setTemplate] = useState("");
  const templateDetailref = useRef(null);
  const [access, setAccess] = useState([]);

  const [showJobHolderFilter, setShowJobHolderFilter] = useState(true);

  const [showEdit, setShowEdit] = useState(false);
  const [rowSelection, setRowSelection] = useState({});

  const [bulkForm, setBulkForm] = useState({
    name: "",
    description: "",
    category: "",
    userList: [],
    userMode: "replace",
  });
 




  
    const { selectedUsers, setSelectedUsers } = usePersistedUsers(
      "templates:selected_users",
      userName,
    );
    

 


    // ==========================================
    // COLUMN VISIBILITY
    // ==========================================
    const [showcolumn, setShowColumn] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState({
      _id: false,
      ...colVisibility,
    });
  
    const showColumnRef = useRef(false);
    useClickOutside(showColumnRef, () => setShowColumn(false));
  
    const toggleColumnVisibility = (column) => {
      const updatedVisibility = {
        ...columnVisibility,
        [column]: !columnVisibility[column],
      };
      setColumnVisibility(updatedVisibility);
      localStorage.setItem(
        "visibleTemplatesColumn",
        JSON.stringify(updatedVisibility),
      );
    };



  useEscapeKey(() => {
    setAddTemplate(false);
  }, addTemplate);

  useEscapeKey(() => {
    setShowTemplate(false);
  }, showTemplate);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        templateDetailref.current &&
        !templateDetailref.current.contains(event.target)
      ) {
        setShowTemplate(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get Auth Access
  useEffect(() => {
    if (auth.user) {
      const filterAccess = auth.user.role.access
        .filter((role) => role.permission === "Templates")
        .flatMap((jobRole) => jobRole.subRoles);


      setAccess(filterAccess);
    }
  }, [auth]);

  // --------------Get All Templates---------->
  const getAllTemplates = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/templates/get/all/template`,
      );
      if (auth.user.role.name === "Admin") {
 
        setTemplateData(data?.templates);
      } else {
        const filteredTemplate = data?.templates.filter((template) =>
          template?.userList?.some((user) => user._id === auth.user.id),
        );

        setTemplateData(filteredTemplate);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getAllTemplates();
    // eslint-disable-next-line
  }, []);

  // Get Template Without Loading
  const getTemplates = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/templates/get/all/template`,
      );
      setTemplateData(data?.templates);
    } catch (error) {
      console.log(error);
    }
  };

  //---------- Get All Categories-----------
  const getAllCategories = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/categories/get/all/category`,
      );
      setCategoryData(data?.categories);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllCategories();
    // eslint-disable-next-line
  }, []);

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`,
      );
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access.some((item) =>
            item?.permission?.includes("Templates"),
          ),
        ) || [],
      );

      setUserName(
        data?.users
          ?.filter((user) =>
            user.role?.access.some((item) =>
              item?.permission?.includes("Templates"),
            ),
          )
          .map((user) => user.name),
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  // ------------Add Category-------->
  const createCategory = async (e) => {
    e.preventDefault();
    setlaoding(true);

    try {
      if (categoryId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/categories/update/template/category/${categoryId}`,
          { name },
        );
        if (data) {
          toast.success("Category updated successfully.");
          getAllCategories();
          setCategoryId("");
          setName("");
          setShowCategory(false);
          setlaoding(false);
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/categories/create/template/category`,
          { name },
        );
        if (data) {
          toast.success("Category added successfully.");
          getAllCategories();
          setCategoryId("");
          setName("");
          setShowCategory(false);
          setlaoding(false);
        }
      }
    } catch (error) {
      setlaoding(false);
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // <------------Delete Category------------>
  const handleDeleteConfirmation = (categoryId) => {
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
        deleteCategory(categoryId);
        Swal.fire("Deleted!", "Your category has been deleted.", "success");
      }
    });
  };
  const deleteCategory = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/categories/delete/template/category/${id}`,
      );
      if (data) {
        getAllCategories();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  // -----------------------Templates------------------>
  const handleDeleteTemplateConfirmation = (tempId) => {
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
        deleteTemplate(tempId);
        Swal.fire("Deleted!", "Your template has been deleted.", "success");
      }
    });
  };
  const deleteTemplate = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/templates/delete/template/${id}`,
      );
      if (data) {
        const filterTemplate = templateData.filter((item) => item._id !== id);
        setTemplateData(filterTemplate);
        getTemplates();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // --------Copy Template--------->
  const duplicateTemplate = async (originalTemplate) => {
    const taskCopy = { ...originalTemplate };

    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/v1/templates/create/template`,
      {
        ...taskCopy,
      },
    );
    if (data) {
      setTemplateData((prevData) => [...prevData, data.template]);
      getTemplates();
      toast.success("Template copy successfully!");
    }
  };

  const handleBulkUpdate = async (e) => {
    e.preventDefault();

    try {
      const selectedTemplates = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);

      if (selectedTemplates.length === 0) {
        return toast.error("Select at least one template");
      }

      const payload = selectedTemplates.map((item) => {
        const base = {
          _id: item._id,
          ...(bulkForm.name && { name: bulkForm.name }),
          ...(bulkForm.category && { category: bulkForm.category }),
          ...(bulkForm.description && { description: bulkForm.description }),
        };

        // 🔥 USER MODE LOGIC
        if (bulkForm.userList.length > 0) {
          if (bulkForm.userMode === "replace") {
            base.userList = bulkForm.userList;
          }

          if (bulkForm.userMode === "add") {
            base.addUsers = bulkForm.userList;
          }

          if (bulkForm.userMode === "remove") {
            base.removeUsers = bulkForm.userList.map((u) => u._id);
          }
        }

        return base;
      });

      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/templates/bulk-update-templates`,
        payload,
      );

      if (data?.success) {
        toast.success("Bulk updated successfully!");
        getTemplates();
        setRowSelection({});
        setBulkForm({
          name: "",
          category: "",
          userList: [],
          description: "",
          userMode: "replace",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Bulk update failed");
    }
  };

  const convertQuillHtmlToPlainText = (html) => {
 

    html = html.replace(/<br\s*\/?>/gi, "\n");
    html = html.replace(/<\/p>/gi, "\n");

    html = html.replace(/<li[^>]*>(.*?)<\/li>/gi, "\n- $1");

    // Remove all remaining HTML tags
    html = html.replace(/<[^>]*>/g, "");

    html = html.replace(/&nbsp;/g, " ");
    html = html.replace(/&amp;/g, " ");
    html = html.replace(/&lt;/g, " ");
    html = html.replace(/&gt;/g, " ");

    // Remove multiple blank lines but keep single \n
    html = html.replace(/\n{3,}/g, "\n\n");

    // Trim leading/trailing whitespace
    return html.trim();
  };

 

  const copyTemplate = (template) => {
    const cleanText = convertQuillHtmlToPlainText(template);

    navigator.clipboard.writeText(cleanText).then(
      () => {
        toast.success("Copied!");
      },
      (err) => {
        // console.log("Failed to copy the template!:", err);
        toast.error("Failed to copy the template!");
      },
    );
  };

  // ---------------------Table Data-------------------->
  const columns = useMemo(
    () =>
      createTemplateColumns({
        categoryData,
        setTemplate,
        setShowTemplate,
        copyTemplate,
        duplicateTemplate,
        setTemplateId,
        setAddTemplate,
        handleDeleteTemplateConfirmation,
        userName,
      }),
    [categoryData, userName],
  );

  // Clear table Filter
  const handleClearFilters = () => {
    table.setColumnFilters([]);

    table.setGlobalFilter("");
    // table.resetColumnFilters();
  };

  const table = useMaterialReactTable({
    columns,
    data: templateData || [],
    enableStickyHeader: true,
    enableStickyFooter: true,
    muiTableContainerProps: { sx: { maxHeight: "850px" } },

    enableRowSelection: true, // ✅ ADD THIS
    enableMultiRowSelection: true,
    onRowSelectionChange: setRowSelection,

    onColumnVisibilityChange: setColumnVisibility,

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

    state: {
      rowSelection,
      columnVisibility,

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

const buildJobHolderCountMap = (data = []) => {
  const map = {};
  let totalCount = 0;

  for (const { userList = [] } of data) {
    for (const { name } of userList) {
      if (!name) continue;
      map[name] = (map[name] ?? 0) + 1;
    }

    totalCount++;
  }

  map.All = totalCount;

  return map;
};


const countMap = useMemo(() => {
  return buildJobHolderCountMap(templateData);
}, [templateData]);


    const renderColumnControls = () => (
      <section className="w-[600px] rounded-lg bg-white border border-slate-200 shadow-sm animate-pop">
        {/* Header */}
        <header className="px-5 py-3 border-b">
          <h3 className="text-sm font-semibold text-slate-800">View settings</h3>
        </header>
  
        {/* Content */}
        <div className="grid grid-cols-2 divide-x">
          {/* LEFT — Columns */}
          <section className="px-5 py-4">
            <h4 className="mb-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
              Columns
            </h4>
  
            <ul className="space-y-1 list-decimal">
              {Object.keys(colVisibility)?.map((column) => (
                <li key={column}>
                  <label
                    className="flex items-center justify-between rounded-md px-2 py-1.5
                             text-sm text-slate-700 cursor-pointer
                             hover:bg-slate-50 transition"
                  >
                    <span className="capitalize">{column}</span>
                    <input
                      type="checkbox"
                      checked={columnVisibility[column]}
                      onChange={() => toggleColumnVisibility(column)}
                      className="h-4 w-4 accent-orange-600"
                    />
                  </label>
                </li>
              ))}
            </ul>
          </section>
  
          {/* RIGHT — Users */}
          <section className="px-5 py-4">
            <h4 className="mb-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
              Users
            </h4>
  
            <div className="h-full overflow-y-auto space-y-1 pr-1">
              <SelectedUsers
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                userNameArr={userName}
                countMap={countMap}
                label={"template"}
              />
            </div>
          </section>
        </div>
      </section>
    );






  return (
    <>
      <div className=" relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4">
        {selectedTab === "templates" && (
          <div className="flex items-start sm:items-center sm:justify-between flex-col gap-2 sm:flex-row">
            <div className="flex justify-start items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
                Templates
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
              <span className="mt-1">
                <QuickAccess />
              </span>
              {isAdmin(auth) && (
                <span className=" ">
                  {" "}
                  <OverviewForPages />{" "}
                </span>
              )}
            </div>

            {/* ---------Template Buttons */}
            <div className="hidden sm:flex items-center gap-4">
              <div
                className={`relative w-[8rem]  border-2 rounded-md py-1 px-2 flex items-center justify-between gap-1 ${
                  showAllCategories ? "border-orange-600" : "border-gray-200 "
                }`}
                onClick={() => setShowAllCategories(!showAllCategories)}
              >
                <span className="text-[15px] select-none text-gray-900 cursor-pointer">
                  Categories
                </span>

                {/* -----------Categories------- */}
                {showAllCategories && (
                  <div className="absolute top-9 right-[-3.5rem] flex flex-col gap-2 max-h-[16rem] overflow-y-auto hidden1 z-[99] border rounded-sm shadow-sm bg-gray-50 py-2 px-2 w-[14rem]">
                    {categoryData &&
                      categoryData?.map((category) => (
                        <div
                          key={category._id}
                          className="w-full flex items-center justify-between gap-1 rounded-md bg-white border py-1 px-1 hover:bg-gray-100"
                        >
                          <p className="text-[13px] w-[8rem] ">
                            {category?.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <span
                              onClick={() => {
                                setCategoryId(category._id);
                                setShowCategory(true);
                                setName(category?.name);
                              }}
                              title="Edit Categroy"
                            >
                              <MdOutlineEdit className="h-5 w-5 cursor-pointer hover:text-sky-500 transition-all duration-200" />
                            </span>
                            <span
                              title="Delete Categroy"
                              onClick={() =>
                                handleDeleteConfirmation(category._id)
                              }
                            >
                              <AiTwotoneDelete className="h-5 w-5 cursor-pointer hover:text-red-500 transition-all duration-200" />
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <button
                className={`w-[3rem] hidden  h-[2.2rem] sm:flex items-center justify-center rounded-md hover:shadow-md text-gray-800 bg-sky-100 hover:text-white hover:bg-sky-600 text-[15px] `}
                // onClick={handleExportData}
                title="Export Data"
              >
                <LuImport className="h-6 w-6 " />
              </button>
              <button
                className={`${style.button1} text-[15px] `}
                onClick={() => setShowCategory(true)}
                style={{ padding: ".4rem 1rem" }}
              >
                Add Category
              </button>
              <button
                className={`${style.button1} text-[15px] `}
                onClick={() => setAddTemplate(true)}
                style={{ padding: ".4rem 1rem" }}
              >
                Add Template
              </button>
            </div>
          </div>
        )}

        {/* ------------------ */}
        {selectedTab === "templates" && (
          <>
            <div className="w-full flex flex-row justify-start items-center gap-2 mt-2 ">
              <div className="flex items-center  border-2 border-orange-500 rounded-sm overflow-hidden transition-all duration-300 w-fit">
                <button
                  className={`py-1 px-2 w-[6.5rem] outline-none transition-all duration-300 ${
                    selectedTab === "templates"
                      ? "bg-orange-500 text-white border-r-2 border-orange-500"
                      : "text-black bg-gray-100"
                  }`}
                  onClick={() => setSelectedTab("templates")}
                >
                  Templates
                </button>
                <button
                  className={`py-1 px-2 w-[6.5rem] outline-none transition-all duration-300   ${
                    selectedTab === "faq"
                      ? "bg-orange-500 text-white"
                      : "text-black bg-gray-100 hover:bg-slate-200"
                  }`}
                  onClick={() => setSelectedTab("faq")}
                >
                  FAQ's
                </button>
              </div>

              {auth?.user?.role?.name === "Admin" && (
                <div className="w-full flex justify-start items-center gap-2">
                  <span
                    className={`p-[6px] rounded-md hover:shadow-md bg-gray-50   cursor-pointer border  ${
                      showJobHolderFilter && "bg-orange-500 text-white"
                    }`}
                    onClick={() => {
                      setShowJobHolderFilter((prev) => !prev);
                    }}
                    title="Filter by Job Holder"
                  >
                    <IoBriefcaseOutline className="  cursor-pointer text-[22px] " />
                  </span>

                  <span
                    className={`hidden sm:block p-1 rounded-md hover:shadow-md   cursor-pointer border ${
                      showEdit && "bg-orange-500 text-white"
                    }`}
                    onClick={() => {
                      setShowEdit(!showEdit);
                    }}
                    title="Edit Multiple Templates"
                  >
                    <MdOutlineModeEdit className="h-6 w-6  cursor-pointer" />
                  </span>



                   <div className="relative">
                              <div
                                className={`  p-[6px] rounded-md hover:shadow-md  cursor-pointer border ${
                                  showcolumn && "bg-orange-500 text-white"
                                }`}
                                onClick={() => setShowColumn(!showcolumn)}
                              >
                                {" "}
                                {showcolumn ? (
                                  <GoEyeClosed className="h-5 w-5" />
                                ) : (
                                  <GoEye className="h-5 w-5" />
                                )}{" "}
                              </div>
                              {showcolumn && (
                                <div
                                  ref={showColumnRef}
                                  className="fixed top-32 left-[50%] z-[9999]    w-[12rem]"
                                >
                                  {renderColumnControls()}
                                </div>
                              )}
                            </div>
                  



                </div>
              )}
            </div>

            {showEdit && (
              <div className="w-full mt-4 mb-8 p-6 bg-white border border-slate-200 rounded-xl shadow-sm animate-pop ">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
                      Bulk Update Actions
                    </h3>
                  </div>
                  <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                    {Object.keys(rowSelection).length} rows selected
                  </div>
                </div>

                <form
                  onSubmit={handleBulkUpdate}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
                >
                  {/* Name Input */}
                  <div className="md:col-span-3 flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={bulkForm.name}
                      onChange={(e) =>
                        setBulkForm({ ...bulkForm, name: e.target.value })
                      }
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm bg-slate-50/30"
                    />
                  </div>

                  {/* Category Select */}
                  <div className="md:col-span-3 flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">
                      Category
                    </label>
                    <select
                      value={bulkForm.category}
                      onChange={(e) =>
                        setBulkForm({ ...bulkForm, category: e.target.value })
                      }
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm bg-slate-50/30 cursor-pointer"
                    >
                      <option value="">Choose category...</option>
                      {categoryData.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3 flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={bulkForm.description}
                      onChange={(e) =>
                        setBulkForm({
                          ...bulkForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm bg-slate-50/30"
                    />
                  </div>

                  {/* Modern User Pills Section */}
                  <div className="md:col-span-6 flex flex-col gap-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                        Assign Users
                      </label>
                      <select
                        className="text-[11px] font-bold text-orange-600 bg-orange-50 border-none rounded-md px-2 py-1 outline-none cursor-pointer"
                        value={bulkForm.userMode || "replace"}
                        onChange={(e) =>
                          setBulkForm({ ...bulkForm, userMode: e.target.value })
                        }
                      >
                        <option value="replace">REPLACE EXISTING</option>
                        <option value="add">ADD TO LIST</option>
                        <option value="remove">REMOVE FROM LIST</option>
                      </select>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/30 transition-all focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500/10">
                      {/* Selected Pills Area */}
                      <div className="p-3 flex flex-wrap gap-2 min-h-[52px] bg-white">
                        {bulkForm.userList.length === 0 ? (
                          <span className="text-sm text-slate-400 pl-1 italic">
                            Click users below to add...
                          </span>
                        ) : (
                          bulkForm.userList.map((user) => (
                            <div
                              key={user._id}
                              className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-orange-500 text-white shadow-sm transition-transform active:scale-95"
                            >
                              {user.name}
                              <IoClose
                                className="w-4 h-4 cursor-pointer hover:bg-orange-600 rounded-full p-0.5 transition-colors"
                                onClick={() => {
                                  setBulkForm({
                                    ...bulkForm,
                                    userList: bulkForm.userList.filter(
                                      (u) => u._id !== user._id,
                                    ),
                                  });
                                }}
                              />
                            </div>
                          ))
                        )}
                      </div>

                      {/* Quick Selection List */}
                      <div className="max-h-32 overflow-y-auto border-t border-slate-100 p-2 flex flex-wrap gap-2">
                        {users.map((user) => {
                          const isSelected = bulkForm.userList.some(
                            (u) => u._id === user._id,
                          );
                          return (
                            <button
                              key={user._id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setBulkForm({
                                    ...bulkForm,
                                    userList: bulkForm.userList.filter(
                                      (u) => u._id !== user._id,
                                    ),
                                  });
                                } else {
                                  setBulkForm({
                                    ...bulkForm,
                                    userList: [...bulkForm.userList, user],
                                  });
                                }
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                isSelected
                                  ? "bg-slate-200 border-transparent text-slate-400 cursor-not-allowed opacity-50"
                                  : "bg-white border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-600 hover:shadow-sm shadow-none"
                              }`}
                            >
                              {isSelected ? `+ ${user.name}` : user.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer / Submit */}
                  <div className="md:col-span-12 flex justify-end items-center pt-4 border-t border-slate-100 mt-2 gap-4">
                    <button
                      type="submit"
                      className="px-8 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
                    >
                      Save All Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />

            {auth?.user?.role?.name === "Admin" && showJobHolderFilter && (
              <div className="w-full py-2">
                <DraggableUserList
                  table={table}
                  usersArray={selectedUsers.map((el) => el)}
                  updateJobHolderCountMapFn={(map, totalCount) => {
                     
                    for (const item of templateData || []) {
                      const holders = item.userList || [];

                      for (const holder of holders) {
                        if (!holder) continue; // skip null/undefined
                        map.set(holder.name, (map.get(holder.name) || 0) + 1);
                      }

                      totalCount++; // still count 1 per job
                    }

                    map.set("All", totalCount);
                    countMap.current = map;

                  }}
                  listName={"templates"}
                  filterColName="userList"
                />
              </div>
            )}
          </>
        )}
        <div className="w-full h-full">
          {selectedTab === "templates" ? (
            <div className="w-full h-full">
              {isloading ? (
                <div className="flex items-center justify-center w-full h-screen px-4 py-4">
                  <Loader />
                </div>
              ) : (
                <div className="w-full min-h-[10vh] relative ">
                  {(auth?.user?.role?.name === "Admin" ||
                    access.includes("Template")) && (
                    <div className="h-full hidden1 overflow-y-auto relative">
                      <MaterialReactTable table={table} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : selectedTab === "faq" ? (
            <div className="w-full h-full">
              <FAQ
                setSelectedTab={setSelectedTab}
                selectedTab={selectedTab}
                access={access}
              />
            </div>
          ) : (
            <div className=""></div>
          )}
        </div>

        {/* -----------------Create Categories------------------------ */}

        {showCategory && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full py-4 px-4 bg-gray-300/70 flex items-center justify-center">
            <form
              onSubmit={createCategory}
              className=" w-[21rem] sm:w-[28rem] rounded-md shadow-md  bg-white flex flex-col gap-4"
            >
              <div className="flex items-center justify-between px-4 pt-2">
                <h1 className="text-[20px] font-semibold text-black">
                  {categoryId ? "Update Category" : "Add Category"}
                </h1>
                <span
                  className=" cursor-pointer"
                  onClick={() => {
                    setCategoryId("");
                    setShowCategory(false);
                  }}
                >
                  <IoClose className="h-6 w-6 " />
                </span>
              </div>
              <hr className="h-[1px] w-full bg-gray-400 " />
              <div className="py-4 px-4 flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Category Name"
                  required
                  className={`${style.input} w-full`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="flex items-center justify-end">
                  <button
                    className={`${style.button1} text-[15px] `}
                    type="submit"
                    style={{ padding: ".4rem 1rem" }}
                  >
                    {loading ? (
                      <TbLoader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <span>{categoryId ? "Update" : "Create"}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ----------------Add Templates--------------- */}
        {addTemplate && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full py-4 px-4 bg-gray-300/70 flex items-center justify-center">
            <AddTemplateModal
              setAddTemplate={setAddTemplate}
              templateId={templateId}
              setTemplateId={setTemplateId}
              users={users}
              setTemplateData={setTemplateData}
              categoryData={categoryData}
              getTemplates={getTemplates}
            />
          </div>
        )}

        {/* -----------------template Details----------- */}
        {showTemplate && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full py-4 px-4 bg-gray-300/70 flex items-center justify-center">
            <div
              ref={templateDetailref}
              className="flex flex-col gap-2 bg-white rounded-md shadow-md w-[35rem] max-h-[95vh] "
            >
              <div className="flex items-center justify-between px-4 pt-2">
                <h1 className="text-[20px] font-semibold text-black">
                  Template View
                </h1>
                <span
                  className=" cursor-pointer"
                  onClick={() => {
                    setTemplate("");
                    setShowTemplate(false);
                  }}
                >
                  <IoClose className="h-6 w-6 " />
                </span>
              </div>
              <hr className="h-[1px] w-full bg-gray-400 " />
              <div
                onClick={() => copyTemplate(template)}
                className="py-4 px-4 w-full max-h-[80vh] text-[14px] overflow-y-auto cursor-pointer"
                dangerouslySetInnerHTML={{ __html: template }}
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
                    onClick={() => copyTemplate(template)}
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
