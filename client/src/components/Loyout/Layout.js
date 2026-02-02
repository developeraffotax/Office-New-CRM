import React, { useEffect, useState } from "react";
import { IoMenu, IoClose, IoCloseCircleOutline } from "react-icons/io5";
import { CgList } from "react-icons/cg";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Draggable from "react-draggable";
import toast from "react-hot-toast";
import axios from "axios";

import Sidebar from "./Sidebar";
import Header from "./header/Header";
import Spinner from "../../utlis/Spinner";
import OverdueModal from "../../utlis/OverdueModal";
import ReminderModal from "../../utlis/ReminderModal";

import {
  fetchGlobalTimer,
  tick,
  initGlobalTimerListener,
} from "../../redux/slices/globalTimerSlice";

/* ---------------- helpers ---------------- */

const formatTimer = (ms = 0) => {
  const totalSeconds = Math.floor(ms / 1000);

  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");

  return `${h}:${m}:${s} ⏱`;
};

/* ---------------- Layout ---------------- */

export default function Layout() {
  const dispatch = useDispatch();
  const location = useLocation();

  /* UI state */
  const [showSidebar, setShowSidebar] = useState(false);
  const [hideSidebar, setHideSidebar] = useState(false);
  const [showQuickList, setShowQuickList] = useState(false);
  const [quickListData, setQuickListData] = useState("");
  const [editId, setEditId] = useState("");

  /* Auth */
  const auth = useSelector((state) => state.auth.auth);

  /* Global Timer (Redux) */
  const { timer, elapsed } = useSelector((state) => state.globalTimer);
  const isRunning = timer?.isRunning;

  /* Settings */
  const { settings } = useSelector((state) => state.settings);
  const { showCrmNotifications = true, showEmailNotifications = true } =
    settings || {};

  /* Notifications */
  const unread_notifications_count = useSelector((state) =>
    state.notifications.notificationData.filter(
      (n) =>
        n.status === "unread" &&
        (n.type === "ticket_received"
          ? showEmailNotifications
          : showCrmNotifications)
    ).length
  );

 

  /* ---------------- Init Global Timer ---------------- */
  // useEffect(() => {
  //   dispatch(fetchGlobalTimer());
  //   dispatch(initGlobalTimerListener());
  // }, [dispatch]);

  /* ---------------- Tick every second ---------------- */
  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      dispatch(tick());
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, dispatch]);

  /* ---------------- Document Title ---------------- */
  useEffect(() => {
    // const timerRunningIn = localStorage.getItem("timer_in");
    // if (location.pathname === timerRunningIn) return;


    let mainTitle = isRunning ? formatTimer(elapsed) : "Affotax-CRM";

    if( unread_notifications_count > 0 ) {
document.title =
      `${mainTitle} | 🔔 (${unread_notifications_count})`
        
    } else {
      document.title = mainTitle;
    }

 

    
  }, [elapsed, isRunning, unread_notifications_count,]);



  /* ---------------- Quick List ---------------- */
  const getQuickList = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/quicklist/get/quicklist`
      );
      setQuickListData(data.quickList.description);
      setEditId(data.quickList._id);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (auth?.user) getQuickList();
  }, [auth]);

  const updateQuickList = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/quicklist/update/quicklist/${editId}`,
        { description: quickListData }
      );
      getQuickList();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <>
      <ReminderModal />
      <OverdueModal />

      <div className="relative w-full h-[111vh] flex flex-col overflow-hidden">
        <Header
          setShowQuickList={setShowQuickList}
          showQuickList={showQuickList}
          getQuickList={getQuickList}
        />

        <div className="fixed top-[3.8rem] left-0 w-full flex h-full overflow-hidden">
          {/* Mobile Menu */}
          {!showSidebar && (
            <div className="absolute sm:hidden top-2 left-3 z-20">
              <IoMenu size={25} onClick={() => setShowSidebar(true)} />
            </div>
          )}

          {/* Desktop Sidebar */}
          <div
            className={`hidden sm:flex transition-all duration-200 ${
              hideSidebar ? "w-[5rem]" : "w-[13rem]"
            }`}
          >
            <Sidebar hide={hideSidebar} setHide={setHideSidebar} />
          </div>

          {/* Mobile Sidebar */}
          {showSidebar && (
            <div className="absolute top-0 left-0 z-30 sm:hidden w-[13rem] bg-white border-r pt-8">
              <IoClose
                size={25}
                className="absolute top-2 right-2"
                onClick={() => setShowSidebar(false)}
              />
              <Sidebar />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto pt-6 sm:pt-0">
            <Outlet />
          </div>
        </div>

        {/* Quick List */}
        {showQuickList && (
          <Draggable handle=".drag-handle">
            <div className="fixed top-[4rem] right-[8rem] z-[999] w-[29rem] bg-gray-50 rounded-md shadow-md">
              <div className="drag-handle flex justify-between bg-orange-600 text-white p-3 cursor-move">
                <h5 className="flex items-center gap-2 text-lg">
                  <CgList /> Quick Lists
                </h5>
                <IoCloseCircleOutline
                  size={26}
                  onClick={() => setShowQuickList(false)}
                />
              </div>

              <textarea
                className="w-full h-[16rem] p-3 bg-transparent outline-none resize-none"
                value={quickListData}
                onChange={(e) => setQuickListData(e.target.value)}
                onBlur={updateQuickList}
                placeholder="Add quick list here..."
              />
            </div>
          </Draggable>
        )}
      </div>
    </>
  );
}
