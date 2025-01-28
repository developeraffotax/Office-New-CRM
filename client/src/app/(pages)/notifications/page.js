"use client";
import MainLayout from "@/app/components/layout/MainLayout";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { MdDelete, MdModeEditOutline, MdNotInterested } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineMarkUnreadChatAlt } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Loader from "@/app/utils/Loader";
import NotificationModal from "@/app/components/notifications/NotificationModal";
import NotificationDetail from "@/app/components/notifications/NotificationDetail";
import { IoAddOutline, IoSearch } from "react-icons/io5";
import { AiFillDelete } from "react-icons/ai";

export default function Notifications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationData, setNotificationData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedNotificationId, setSelectedNotificationId] = useState([]);
  const [show, setShow] = useState(false);
  const [notificationId, setNotificationId] = useState("");
  const closeMenu = useRef(null);
  const [addNotification, setAddNotification] = useState(false);
  const initialNotificationLoad = useRef(true);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [active, setActive] = useState("All");

  console.log("notificationData:", notificationData);

  // Get all notifications
  const fetchNotifications = async () => {
    if (initialNotificationLoad.current) {
      setLoading(true);
    }
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/all/admin`
      );
      setNotificationData(data.notifications);
    } catch (error) {
      console.log(error);
    } finally {
      if (initialNotificationLoad.current) {
        setLoading(false);
        initialNotificationLoad.current = false;
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setFilteredData(notificationData);
  }, [notificationData]);

  // -----------Mark All as Read----------------
  const markAllAsRead = async () => {
    if (!selectedNotificationId.length) {
      return toast.error("Please select a notification to mark as read");
    }
    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/mark/all/read`,
        { nitificationIds: selectedNotificationId }
      );
      if (data) {
        fetchNotifications();
        setSelectedNotificationId([]);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to mark all as read");
    }
  };

  // ----------Mark Single Notification as Read----
  const markSingleNotificationAsRead = async (id) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/read/${id}`
      );
      fetchNotifications();
    } catch (error) {
      console.log(error);
      toast.error("Failed to mark as read");
    }
  };

  // -----------Delete All Notifications------------
  const handleDeleteConfirmation = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAllNotifications();
        Swal.fire("Deleted!", "Notifications has been deleted.", "success");
      }
    });
  };

  const deleteAllNotifications = async () => {
    if (!selectedNotificationId.length) {
      return toast.error("Please select at least one notification to delete.");
    }

    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/delete/many`,
        { notificationIds: selectedNotificationId }
      );

      if (data) {
        fetchNotifications();
        toast.success("All selected notifications deleted successfully.");
        setSelectedNotificationId([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete notifications. Please try again later.");
    }
  };

  // -----------Delete Single Notification------------
  const handleDeleteSingleConfirmation = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSingleNotifications(id);
        Swal.fire("Deleted!", "Notification has been deleted.", "success");
      }
    });
  };

  const deleteSingleNotifications = async (id) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/delete/${id}`
      );
      fetchNotifications();
      toast.success("Notification deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete notification. Please try again later");
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
    filterData(value, active);
  };

  // -------------Handle filtering by tabs and search---------------
  const filterData = (search = searchValue, statusFilter = active) => {
    let filtered = [...notificationData];

    if (statusFilter === "All" && !search) {
      setFilteredData(notificationData);
      return;
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (notification) => notification.status === statusFilter
      );
    }

    if (search) {
      const lowercasedSearch = search.toLowerCase();

      filtered = filtered.filter((notification) => {
        const { user } = notification;
        const { name = "", email = "" } = user;

        return (
          name.toLowerCase().includes(lowercasedSearch) ||
          email.toLowerCase().includes(lowercasedSearch)
        );
      });
    }

    setFilteredData(filtered);
  };

  const handleTabClick = (tab) => {
    setActive(tab);
    filterData(searchQuery, tab);
  };

  // Handle selecting all notifications
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedNotificationId(notificationData?.map((notify) => notify?._id));
    } else {
      setSelectedNotificationId([]);
    }
  };

  // Handle selecting a single notification
  const handleSelectSingle = (id, checked) => {
    if (checked) {
      setSelectedNotificationId((prev) => [...prev, id]);
    } else {
      setSelectedNotificationId((prev) =>
        prev.filter((notifyId) => notifyId !== id)
      );
    }
  };

  // Close Menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (closeMenu.current && !closeMenu.current.contains(event.target)) {
        setNotificationId("");
        setShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <MainLayout title="Notifications - Sync AI">
      <div className="p-1 sm:p-2 px-1 sm:px-6 h-[100%] w-full pb-4 scroll-smooth">
        <div className="flex flex-col gap-4 w-full h-full">
          <div className="flex items-start sm:items-end justify-between flex-col md:flex-row gap-4 ">
            <div className="flex items-center gap-4 md:gap-[5rem]">
              <h1 className=" text-[1.1rem] sm:text-2xl 3xl:text-3xl font-semibold text-texth1 uppercase">
                Notifications
              </h1>
              <div className="relative w-[11rem] sm:w-[15rem] rounded-lg h-[2.2rem] sm:h-[2.4rem] bg-gray-100 border ">
                <span className="absolute right-2 top-[5px] z-30 text-gray-400 hover:text-customBrown p-1 hover:bg-gray-200 rounded-lg ">
                  <IoSearch className="h-5 w-5 cursor-pointer" />
                </span>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full h-full border-none bg-transparent active:outline outline-customBrown rounded-lg pl-2 pr-5 text-[14px]"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4   w-full h-full">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <button
                  className={`min-w-[6.5rem] sm:w-[7.5rem] h-[2.1rem] sm:h-[2.3rem] text-[13px] 2xl:text-[15px] rounded-lg transition-all duration-300 ease-in-out ${
                    active === "All"
                      ? "bg-customBrown text-white"
                      : "bg-gray-50 text-customBrown border-2 border-customBrown hover:bg-gray-100"
                  }`}
                  onClick={() => handleTabClick("All")}
                >
                  All Notifications
                </button>
                <button
                  className={`min-w-[6.5rem] sm:w-[7.5rem] h-[2.1rem] sm:h-[2.3rem] text-[13px] 2xl:text-[15px] rounded-lg transition-all duration-300 ease-in-out ${
                    active === "read"
                      ? "bg-customBrown text-white"
                      : "bg-gray-50 text-customBrown border-2 border-customBrown hover:bg-gray-100"
                  }`}
                  onClick={() => handleTabClick("read")}
                >
                  Responded
                </button>
                <button
                  className={`min-w-[6.5rem] sm:w-[7.5rem] h-[2.1rem] sm:h-[2.3rem] text-[13px] 2xl:text-[15px] rounded-lg transition-all duration-300 ease-in-out ${
                    active === "unread"
                      ? "bg-customBrown text-white"
                      : "bg-gray-50 text-customBrown border-2 border-customBrown hover:bg-gray-100"
                  }`}
                  onClick={() => handleTabClick("unread")}
                >
                  Unread
                </button>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 justify-end w-full sm:w-fit ">
                <span
                  disabled={selectedNotificationId.length === 0}
                  onClick={() => handleDeleteConfirmation()}
                >
                  <AiFillDelete
                    className={`h-5 w-5 cursor-pointer transition-all duration-300 ease-in-out ${
                      selectedNotificationId.length > 0
                        ? "text-red-500 hover:text-red-600"
                        : "text-customBrown cursor-not-allowed"
                    }`}
                  />
                </span>

                <button
                  onClick={() => setAddNotification(true)}
                  className={`w-[6.5rem] sm:w-[7.5rem] flex items-center justify-center h-[2.1rem] sm:h-[2.3rem] text-[14px] 2xl:text-[16px] rounded-lg transition-all duration-300 ease-in-out bg-customBrown text-white gap-1 `}
                >
                  <IoAddOutline className="h-4 w-4" /> Add New
                </button>
              </div>
            </div>
            {/*  */}
            <div className=" relative overflow-hidden w-full h-[86%] py-3 sm:py-4 bg-white rounded-md shadow  px-2 sm:px-4 mt-4  overflow-y-auto shidden ">
              <div className="flex flex-col gap-4 w-full h-full">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-customBrown cursor-pointer"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      checked={
                        selectedNotificationId.length === filteredData.length
                      }
                    />
                    <span className="text-[16px] font-medium text-gray-900">
                      Select All
                    </span>
                  </div>
                  <button
                    onClick={() => markAllAsRead()}
                    className="flex sm:hidden  text-[12px] sm:text-[14px] py-2 px-2 sm:px-4 text-gray-600 hover:text-red-600  border-b-2 border-gray-600 hover:border-red-600  hover:scale-[1.03]  transition-all duration-300 "
                  >
                    Mark all as read
                  </button>
                </div>
                {/* Data */}
                {!loading ? (
                  <div className="flex flex-col gap-4 w-full h-full ">
                    {filteredData &&
                      filteredData?.map((notify) => (
                        <div
                          className="w-full flex items-start gap-4"
                          key={notify?._id}
                        >
                          <input
                            type="checkbox"
                            className="h-5 w-5 accent-customBrown-600 cursor-pointer"
                            onChange={(e) =>
                              handleSelectSingle(notify._id, e.target.checked)
                            }
                            checked={selectedNotificationId?.includes(
                              notify._id
                            )}
                          />
                          <div className=" relative flex items-start  gap-2 rounded-lg border border-gray-300 hover:shadow-md cursor-pointer bg-gray-50 hover:100 p-3 w-full ">
                            <div
                              onClick={() => {
                                setSelectedNotification(notify);
                                setShowNotification(true);
                              }}
                              className="w-[3.2rem] h-[3.2rem] rounded-full"
                            >
                              <div className="w-[3rem] h-[3rem] relative rounded-full overflow-hidden flex items-center justify-center">
                                <Image
                                  src={
                                    notify?.user?.profileImage || "/profile.png"
                                  }
                                  layout="fill"
                                  alt={"Avatar"}
                                  className="w-full h-full "
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                              <div className="w-full relative flex items-center justify-between">
                                <h3
                                  onClick={() => {
                                    setSelectedNotification(notify);
                                    setShowNotification(true);
                                  }}
                                  className="text-[15px] text-gray-900 font-medium w-full"
                                >
                                  {notify?.user?.name}
                                </h3>
                                <span
                                  onClick={() => {
                                    setNotificationId(notify._id);
                                    setShow(!show);
                                  }}
                                  className="bg-gray-100 hover:bg-red-200 p-1 rounded-full hover:shadow-md text-black hover:text-red-600 transition-all duration-200 cursor-pointer"
                                >
                                  <BsThreeDotsVertical className="text-[20px]" />
                                </span>
                                {show && notify?._id === notificationId && (
                                  <div
                                    ref={closeMenu}
                                    className="absolute top-6 right-6 w-[11rem] border bg-gray-50 border-gray-200 z-20 px-2 py-2 rounded-sm flex flex-col gap-2 "
                                  >
                                    {/* <button
                                    onClick={() => {
                                      setNotificationId(notify?._id);
                                      setAddNotification(true);
                                    }}
                                    className="w-full text-[13px] text-gray-600 flex items-center gap-1 bg-gray-100 hover:bg-yellow-100 transition-all duration-200 rounded-sm p-1"
                                  >
                                    <span className="p-1 bg-yellow-500 hover:bg-yellow-600 rounded-full transition-all duration-300 hover:scale-[1.03]">
                                      <MdModeEditOutline className="text-[16px] text-white" />
                                    </span>
                                    <div className="flex flex-col items-start w-full ">
                                      <span className="text-[13px] text-gray-800 font-medium">
                                        Edit
                                      </span>
                                      <span className="text-gray-500 text-[12px]">
                                        Edit notification
                                      </span>
                                    </div>
                                  </button> */}
                                    {/* <button className="w-full text-[13px] text-gray-600 flex items-center gap-1 bg-gray-100 hover:bg-sky-100 transition-all duration-200 rounded-sm p-1">
                                    <span className="p-1 bg-sky-200 hover:bg-sky-300 rounded-full transition-all duration-300 hover:scale-[1.03]">
                                      <MdNotInterested className="text-[16px] text-sky-500 hover:text-sky-600" />
                                    </span>
                                    <div className="flex flex-col items-start w-full ">
                                      <span className="text-[13px] text-gray-800 font-medium">
                                        Archived
                                      </span>
                                      <span className="text-gray-500 text-[12px]">
                                        Archived notification
                                      </span>
                                    </div>
                                  </button> */}
                                    <button
                                      onClick={() =>
                                        markSingleNotificationAsRead(notify._id)
                                      }
                                      className="w-full text-[13px] text-gray-600 flex items-center gap-1 bg-gray-100 hover:bg-sky-100 transition-all duration-200 rounded-sm p-1"
                                    >
                                      <span className="p-1 bg-sky-200 hover:bg-sky-300 rounded-full transition-all duration-300 hover:scale-[1.03]">
                                        <MdOutlineMarkUnreadChatAlt className="text-[16px] text-sky-500 hover:text-sky-600" />
                                      </span>
                                      <div className="flex flex-col items-start w-full ">
                                        <span className="text-[13px] text-gray-800 font-medium">
                                          Read
                                        </span>
                                        <span className="text-gray-500 text-[12px]">
                                          Mark as Read
                                        </span>
                                      </div>
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeleteSingleConfirmation(
                                          notify._id
                                        );
                                      }}
                                      className="w-full text-[13px] text-gray-600 flex items-center gap-1 bg-gray-100 hover:bg-red-100 transition-all duration-200 rounded-sm p-1"
                                    >
                                      <span className="p-1 bg-red-200 hover:bg-red-300   rounded-full transition-all duration-300 hover:scale-[1.03]">
                                        <MdDelete className="text-[16px] text-red-500 hover:text-red-600" />
                                      </span>
                                      <div className="flex flex-col items-start w-full ">
                                        <span className="text-[13px] text-gray-800 font-medium">
                                          Delete
                                        </span>
                                        <span className="text-gray-500 text-[12px]">
                                          Delete notification
                                        </span>
                                      </div>
                                    </button>
                                  </div>
                                )}
                              </div>
                              <p
                                onClick={() => {
                                  setSelectedNotification(notify);
                                  setShowNotification(true);
                                }}
                                className="text-[13px] text-gray-500 text-justify"
                              >
                                {notify?.subject}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <Loader />
                )}
              </div>
            </div>
            {/*  */}
          </div>
        </div>

        {/* -------------Handle Notification Modal------------ */}
        {addNotification && (
          <div className="fixed top-0 left-0 p-2 sm:p-4 w-full h-full flex items-center justify-center z-[9999999] bg-gray-300/80 overflow-y-auto shidden">
            <NotificationModal
              closeModal={closeMenu}
              setAddNotification={setAddNotification}
              notificationId={notificationId}
              setNotificationId={setNotificationId}
            />
          </div>
        )}
        {/* Notification Detail */}
        {showNotification && (
          <div className="fixed top-0 left-0 p-2 sm:p-4 w-full h-full flex items-center justify-center z-[9999999] bg-gray-300/80 overflow-y-auto shidden">
            <div className="w-[35rem]">
              <NotificationDetail
                setShowNotification={setShowNotification}
                selectedNotification={selectedNotification}
                setSelectedNotification={setSelectedNotification}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
