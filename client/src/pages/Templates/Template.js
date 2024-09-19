import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { style } from "../../utlis/CommonStyle";
import { LuImport } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import toast from "react-hot-toast";
import { TbLoader2 } from "react-icons/tb";
import { MdCheckCircle, MdOutlineEdit } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import AddTemplateModal from "../../components/Template/AddTemplateModal";
import FAQ from "./FAQ";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Loader from "../../utlis/Loader";
import { format } from "date-fns";
import { GrCopy } from "react-icons/gr";
import { RxClipboardCopy } from "react-icons/rx";
import { FaUsers } from "react-icons/fa";
import { RiEdit2Line } from "react-icons/ri";

export default function Template() {
  const { auth } = useAuth();
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

  console.log("templateData:", templateData);

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

  // --------------Get All Templates---------->
  const getAllTemplates = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/templates/get/all/template`
      );
      setTemplateData(data?.templates);
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
        `${process.env.REACT_APP_API_URL}/api/v1/templates/get/all/template`
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
        `${process.env.REACT_APP_API_URL}/api/v1/categories/get/all/category`
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
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(data?.users);

      setUserName(data?.users.map((user) => user.name));
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
          { name }
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
          { name }
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
        `${process.env.REACT_APP_API_URL}/api/v1/categories/delete/template/category/${id}`
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
        `${process.env.REACT_APP_API_URL}/api/v1/templates/delete/template/${id}`
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
      }
    );
    if (data) {
      setTemplateData((prevData) => [...prevData, data.template]);
      getTemplates();
      toast.success("Template copy successfully!");
    }
  };

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

  // ---------------------Table Data-------------------->
  const columns = useMemo(
    () => [
      {
        accessorKey: "category",
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
                }}
              >
                Category
              </span>
              <select
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              >
                <option value="">Select</option>
                {categoryData?.map((cate) => (
                  <option key={cate._id} value={cate.name}>
                    {cate.name}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const categroyName = row.original.category;
          return (
            <div className="w-full px-1">
              <span>{categroyName}</span>
            </div>
          );
        },
        filterFn: "equals",
        filterSelectOptions: categoryData?.map((category) => category?.name),
        filterVariant: "select",
      },
      {
        accessorKey: "name",
        header: "Template Name",
        Header: ({ column }) => {
          return (
            <div className=" w-[130px] flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Template Name
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const name = row.original.name;
          const [allocateName, setAllocateName] = useState(name);
          const [showEdit, setShowEdit] = useState(false);
          useEffect(() => {
            setAllocateName(row.original.name);
          }, [row.original]);
          const updateAllocateTask = (task) => {
            setShowEdit(false);
          };
          return (
            <div className="w-full h-full ">
              {showEdit ? (
                <input
                  type="text"
                  placeholder="Enter Task..."
                  value={allocateName}
                  onChange={(e) => setAllocateName(e.target.value)}
                  onBlur={(e) => updateAllocateTask(e.target.value)}
                  className="w-full h-[2.3rem] focus:border border-gray-300 px-1 outline-none rounded"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-start "
                  onDoubleClick={() => setShowEdit(true)}
                  title={allocateName}
                >
                  <p
                    className="cursor-pointer text-start  "
                    onDoubleClick={() => setShowEdit(true)}
                    // onClick={() => {
                    //   setTaskID(row.original._id);
                    //   setProjectName(row.original.project.projectName);
                    //   setShowDetail(true);
                    // }}
                  >
                    {allocateName}
                  </p>
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
        size: 180,
        minSize: 120,
        maxSize: 200,
        grow: false,
      },
      {
        accessorKey: "description",
        header: "Description",
        Header: ({ column }) => {
          return (
            <div className=" w-[480px] flex flex-col gap-[2px]">
              <span
                className="ml-1 cursor-pointer"
                title="Clear Filter"
                onClick={() => {
                  column.setFilterValue("");
                }}
              >
                Description
              </span>
              <input
                type="search"
                value={column.getFilterValue() || ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="font-normal h-[1.8rem] w-[100%] px-2 cursor-pointer bg-gray-50 rounded-md border border-gray-200 outline-none"
              />
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const description = row.original.description;
          const [allocateDescription, setAllocateDescription] =
            useState(description);
          const [showEdit, setShowEdit] = useState(false);
          useEffect(() => {
            setAllocateDescription(row.original.description);
          }, [row.original]);
          const updateAllocateTask = (task) => {
            setShowEdit(false);
          };
          return (
            <div className="w-full h-full ">
              {showEdit ? (
                <input
                  type="text"
                  placeholder="Enter Task..."
                  value={allocateDescription}
                  onChange={(e) => setAllocateDescription(e.target.value)}
                  onBlur={(e) => updateAllocateTask(e.target.value)}
                  className="w-full h-[2.3rem] focus:border border-gray-300 px-1 outline-none rounded"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-start "
                  onDoubleClick={() => setShowEdit(true)}
                  title={allocateDescription}
                >
                  <p
                    className="text-blue-600 hover:text-blue-700 cursor-pointer text-start  "
                    onDoubleClick={() => setShowEdit(true)}
                    onClick={() => {
                      setTemplate(row.original.template);
                      setShowTemplate(true);
                    }}
                  >
                    {allocateDescription}
                  </p>
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
        size: 500,
        minSize: 350,
        maxSize: 560,
        grow: false,
      },
      {
        accessorKey: "template",
        header: "Copy",
        Cell: ({ cell, row }) => {
          const template = row.original.template;

          return (
            <div className="flex items-center justify-center gap-3 w-full h-full">
              <span
                className="text-[1rem] cursor-pointer"
                onClick={() => copyTemplate(template)}
                title="Copy Template"
              >
                <RxClipboardCopy className="h-5 w-5 text-cyan-500 hover:text-cyan-600 " />
              </span>
            </div>
          );
        },
        size: 60,
      },

      // <-----Action------>
      {
        accessorKey: "actions",
        header: "Actions",
        Cell: ({ cell, row }) => {
          return (
            <div className="flex items-center justify-center gap-4 w-full h-full">
              {/* <span
                className="text-[1rem] cursor-pointer"
                // onClick={() => copyTask(row.original)}
                title="Users in this Template"
              >
                <FaUsers className="h-5 w-5 text-orange-500 hover:text-orange-600 " />
              </span> */}
              <span
                className="text-[1rem] cursor-pointer"
                onClick={() => duplicateTemplate(row.original)}
                title="Copy Template"
              >
                <GrCopy className="h-5 w-5 text-cyan-500 hover:text-cyan-600 " />
              </span>
              <span
                className=""
                title="Edit Template"
                onClick={() => {
                  setTemplateId(row.original._id);
                  setAddTemplate(true);
                }}
              >
                <RiEdit2Line className="h-6 w-6 cursor-pointer text-green-500 hover:text-green-600" />
              </span>
              <span
                className="text-[1rem] cursor-pointer"
                onClick={() =>
                  handleDeleteTemplateConfirmation(row.original._id)
                }
                title="Delete Template!"
              >
                <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600 " />
              </span>
            </div>
          );
        },
        size: 140,
      },
    ],
    // eslint-disable-next-line
    [users, auth, categoryData, templateData]
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
    muiTableContainerProps: { sx: { maxHeight: "805px" } },
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
        backgroundColor: "#f0f0f0",
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

  return (
    <Layout>
      <div className=" relative w-full min-h-screen py-4 px-2 sm:px-4">
        {selectedTab === "templates" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className=" text-xl sm:text-2xl font-semibold ">Templates</h1>

              <span
                className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
                onClick={() => {
                  handleClearFilters();
                }}
                title="Clear filters"
              >
                <IoClose className="h-6 w-6  cursor-pointer" />
              </span>
            </div>

            {/* ---------Template Buttons */}
            <div className="flex items-center gap-4">
              {auth?.user?.role === "Admin" && (
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
              )}

              <button
                className={`w-[3rem] h-[2.2rem] flex items-center justify-center rounded-md hover:shadow-md text-gray-800 bg-sky-100 hover:text-white hover:bg-sky-600 text-[15px] `}
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
            <div className="flex items-center  border-2 border-orange-500 rounded-sm overflow-hidden mt-2 transition-all duration-300 w-fit">
              <button
                className={`py-1 px-2 outline-none transition-all duration-300  w-full ${
                  selectedTab === "templates"
                    ? "bg-orange-500 text-white border-r-2 border-orange-500"
                    : "text-black bg-gray-100"
                }`}
                onClick={() => setSelectedTab("templates")}
              >
                Templates
              </button>
              <button
                className={`py-1 px-2 outline-none transition-all duration-300 w-full  ${
                  selectedTab === "faq"
                    ? "bg-orange-500 text-white"
                    : "text-black bg-gray-100 hover:bg-slate-200"
                }`}
                onClick={() => setSelectedTab("faq")}
              >
                FAQ's
              </button>
            </div>
            <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />
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
                  <div className="h-full hidden1 overflow-y-scroll relative">
                    <MaterialReactTable table={table} />
                  </div>
                </div>
              )}
            </div>
          ) : selectedTab === "faq" ? (
            <div className="w-full h-full">
              <FAQ setSelectedTab={setSelectedTab} selectedTab={selectedTab} />
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
    </Layout>
  );
}
