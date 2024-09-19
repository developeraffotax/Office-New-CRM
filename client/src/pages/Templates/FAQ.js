import React, { useEffect, useState } from "react";
import { LuImport } from "react-icons/lu";
import { style } from "../../utlis/CommonStyle";
import { AiTwotoneDelete } from "react-icons/ai";
import { MdOutlineEdit } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../../context/authContext";
import toast from "react-hot-toast";
import axios from "axios";
import Swal from "sweetalert2";
import { TbLoader2 } from "react-icons/tb";
import AddFaq from "../../components/Template/AddFaq";
import { HiOutlinePlus } from "react-icons/hi";
import { FaRegWindowMinimize } from "react-icons/fa6";
import { RiEdit2Line } from "react-icons/ri";
import Loader from "../../utlis/Loader";

export default function FAQ({ setSelectedTab, selectedTab }) {
  const { auth } = useAuth();
  const [showCategory, setShowCategory] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [name, setName] = useState("");
  const [loading, setlaoding] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  // -------------FAQ's--------------
  const [isAddFAQ, setIsAddFAQ] = useState(false);
  const [faqId, setFaqId] = useState("");
  const [faqData, setFaqData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [filteredFaq, setFilterFaq] = useState([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  console.log("filteredFaq:", filteredFaq);

  // --------------Get All Templates---------->
  const getAllFaqs = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/faqs/get/all/faq`
      );
      setFaqData(data?.faqs);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getAllFaqs();
    // eslint-disable-next-line
  }, []);

  // Filter FAQ Datq

  const filterFAQData = (cate, question) => {
    let filteredData = [];

    if (cate && !question) {
      filteredData = faqData.filter((item) => item.category === cate);
    } else if (question && !cate) {
      filteredData = faqData.filter((item) =>
        item.question.toLowerCase().includes(question.toLowerCase())
      );
    } else if (cate && question) {
      filteredData = faqData.filter(
        (item) =>
          item.category === cate &&
          item.question.toLowerCase().includes(question.toLowerCase())
      );
    }

    setFilterFaq([...filteredData]);
  };

  // Get Template Without Loading
  const getFaqs = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/faqs/get/all/faq`
      );
      setFaqData(data?.faqs);
    } catch (error) {
      console.log(error);
    }
  };

  //---------- Get All Categories-----------
  const getAllCategories = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/categories/get/faq/category`
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
          { name, type: "faq" }
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
  // -----------------------FAQ's------------------>

  const handleDeleteFaqConfirmation = (faqId) => {
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
        deleteFaq(faqId);
        Swal.fire("Deleted!", "Your faq has been deleted.", "success");
      }
    });
  };
  const deleteFaq = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/faqs/delete/faq/${id}`
      );
      if (data) {
        const filterTemplate = faqData.filter((item) => item._id !== id);
        setFaqData(filterTemplate);
        getFaqs();
        toast.success("Faq deleted successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  const copyFaq = (answer) => {
    navigator.clipboard.writeText(answer).then(
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
    <div className="w-full min-h-screen">
      {selectedTab === "faq" && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className=" text-xl sm:text-2xl font-semibold ">FAQ's</h1>

            <span
              className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
              onClick={() => {
                setSearch("");
                setCategory("");
                filterFAQData();
              }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6  cursor-pointer" />
            </span>
          </div>

          {/* ---------FAQ's Buttons------------*/}
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

            {/* <button
              className={`w-[3rem] h-[2.2rem] flex items-center justify-center rounded-md hover:shadow-md text-gray-800 bg-sky-100 hover:text-white hover:bg-sky-600 text-[15px] `}
              // onClick={handleExportData}
              title="Export Data"
            >
              <LuImport className="h-6 w-6 " />
            </button> */}
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShowCategory(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Add Category
            </button>
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setIsAddFAQ(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              Add FAQ
            </button>
          </div>
        </div>
      )}
      {/* ---------  Buttons--------- */}
      <div className="flex items-center flex-wrap gap-6">
        <div className="flex items-center  border-2 border-orange-500 rounded-sm overflow-hidden mt-2 transition-all duration-300 w-fit">
          <button
            className={`py-1 px-2 outline-none transition-all  duration-300   w-full ${
              selectedTab === "templates"
                ? "bg-orange-500 text-white "
                : "text-black bg-gray-100"
            }`}
            onClick={() => setSelectedTab("templates")}
          >
            Templates
          </button>
          <button
            className={`py-1 px-2 outline-none transition-all duration-300 w-full  ${
              selectedTab === "faq"
                ? "bg-orange-500 text-white border-l-2 border-orange-500"
                : "text-black bg-gray-100 hover:bg-slate-200"
            }`}
            onClick={() => setSelectedTab("faq")}
          >
            FAQ's
          </button>
        </div>
        {/* ------------Filter FAQ---------*/}
        <div className="flex items-center gap-4 translate-y-1">
          <select
            className={`border border-gray-400 focus:border-orange-600 rounded-md w-[8rem] h-[2.1rem] outline-none`}
            value={category}
            required
            onChange={(e) => {
              setCategory(e.target.value);
              filterFAQData(e.target.value, search);
            }}
          >
            <option value={""}>Select</option>
            {categoryData &&
              categoryData?.map((cat) => (
                <option
                  key={cat?._id}
                  value={cat?.name}
                  className=" flex items-center gap-1"
                >
                  {cat?.name}
                </option>
              ))}
          </select>
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              filterFAQData(category, e.target.value);
            }}
            className=" w-[17rem] focus:border-orange-600 rounded-md border border-gray-400 outline-none px-4 h-[2.1rem] "
          />
        </div>
      </div>
      <hr className="mb-1 bg-gray-300 w-full h-[1px] my-1" />
      {/* ----------------All FAQ's Data-------------------- */}
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-screen px-4 py-4">
          <Loader />
        </div>
      ) : (
        <div className="w-full flex flex-col gap-2 items-start ml-[15%] mt-4  ">
          {(filteredFaq?.length || category || search
            ? filteredFaq
            : faqData
          )?.map((faq) => (
            <div
              key={faq?._id}
              className="flex flex-col  border border-gray-300 rounded-sm hover:shadow py-3 w-[21rem] sm:w-[40rem] transition-all duration-500"
            >
              <div className="flex items-center  gap-2 cursor-pointer px-4">
                <div
                  className="flex items-center w-full gap-2"
                  onClick={() => {
                    setFaqId((prevId) => (prevId === faq._id ? "" : faq._id));
                    setShow((prevShow) => faqId !== faq._id || !prevShow);
                  }}
                >
                  <span className="cursor-pointer">
                    {show && faqId === faq._id ? (
                      <FaRegWindowMinimize className="h-5 w-5 -mt-4" />
                    ) : (
                      <HiOutlinePlus className="h-5 w-5" />
                    )}
                  </span>
                  <p className="text-[15px] font-normal">{faq?.question}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    onClick={() => {
                      setFaqId(faq._id);
                      setIsAddFAQ(true);
                    }}
                    className="cursor-pointer"
                  >
                    <RiEdit2Line className="h-5 w-5 text-sky-500 hover:text-sky-600" />
                  </span>
                  <span
                    onClick={() => handleDeleteFaqConfirmation(faq._id)}
                    className="cursor-pointer"
                  >
                    <AiTwotoneDelete className="h-5 w-5 text-red-500 hover:text-red-600" />
                  </span>
                </div>
              </div>
              {/* Answer section with animation */}
              <div
                className={`overflow-hidden text-justify transition-all duration-500  ${
                  show && faqId === faq._id
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div
                  className="w-full px-4 border-t-2 mt-2 py-2 cursor-pointer"
                  onClick={() => copyFaq(faq?.answer)}
                >
                  <p className="text-[15px] border-none w-full h-fit font-normal">
                    {faq?.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {((filteredFaq.length === 0 && search) ||
        (filteredFaq.length === 0 && category) ||
        faqData.length === 0) && (
        <div className="w-full flex flex-col gap-3 items-center justify-center min-h-[50vh]">
          <div className="w-full py-8 flex items-center flex-col justify-center">
            <img
              src="/notask1.png"
              alt="No_Task"
              className="h-[15rem] w-[19rem] animate-pulse"
            />
            <span className="text-center text-[14px] text-gray-500">
              FAQ's not available!
            </span>
          </div>
        </div>
      )}

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

      {/* ----------------Add FAQ--------------- */}
      {isAddFAQ && (
        <div className="fixed top-0 left-0 z-[999] w-full h-full py-4 px-4 bg-gray-300/70 flex items-center justify-center">
          <AddFaq
            setIsAddFAQ={setIsAddFAQ}
            faqId={faqId}
            setFaqId={setFaqId}
            users={users}
            setFaqData={setFaqData}
            categoryData={categoryData}
            getFaqs={getFaqs}
          />
        </div>
      )}
    </div>
  );
}
