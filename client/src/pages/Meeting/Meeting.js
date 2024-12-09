import React, { useEffect, useRef, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { style } from "../../utlis/CommonStyle";
import MeetingModal from "./MeetingModal";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import MeetingDetail from "./MeetingDetail";
import { format, parse } from "date-fns";
import { useAuth } from "../../context/authContext";
import Loader from "../../utlis/Loader";
import { FaLock } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";

export default function Meeting() {
  const { auth } = useAuth();
  const [show, setShow] = useState(false);
  const [meetingId, setMeetingId] = useState("");
  const [meetingData, setMeetingData] = useState([]);
  const isInitialRender = useRef(true);
  const [isloading, setIsloading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const userId = auth.user.id;

  //   Fetch Meetings

  const fetchMeetingData = async () => {
    if (isInitialRender.current) {
      setIsloading(true);
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/meetings/fetch/meetings`
      );
      if (data) {
        setMeetingData(data.meetings);
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (isInitialRender.current) {
        setIsloading(false);
        isInitialRender.current = false;
      }
    }
  };

  useEffect(() => {
    fetchMeetingData();
    // eslint-disable-next-line
  }, []);

  // Map meeting data to FullCalendar events format
  const events = meetingData
    .filter((meeting) => {
      if (auth?.user?.role?.name === "Admin") return true;
      return meeting.usersList.some((user) => user._id === userId);
    })
    .map((meeting) => {
      const datePart = meeting.date.split("T")[0];
      const combinedDatetime = `${datePart}T${meeting.time}:00`;
      const formattedTime = format(
        parse(meeting.time, "HH:mm", new Date()),
        "h:mm a"
      );
      return {
        id: meeting._id,
        title: meeting.title,
        start: combinedDatetime,
        backgroundColor: meeting.color || "#000",
        borderColor: meeting.color || "#000",
        extendedProps: {
          description: meeting.description,
          results: meeting.results,
          usersList: meeting.usersList,
          time: formattedTime,
        },
      };
    });

  // Handle event click to open the modal
  const handleEventClick = (info) => {
    setMeetingId(info.event.id);
    setShowDetail(true);
  };

  // Custom event content renderer
  const renderEventContent = (eventInfo) => {
    return (
      <div className="flex flex-col gap-1 text-white w-full px-2  cursor-pointer">
        <div className="flex items-center gap-1">
          <span>
            <FaLock className="h-4 w-4 text-white mr-1" />
          </span>
          <p className="font-semibold mt-1">{eventInfo.event.title}</p>
        </div>

        <span className="text-sm flex items-center">
          <span className="mr-1">
            <FaUsers className="h-5 w-5 text-white mr-1" />
          </span>
          {eventInfo.event.extendedProps.usersList.length}
        </span>
        <span className="text-sm w-full flex items-center justify-end">
          {eventInfo.event.extendedProps.time}
        </span>
      </div>
    );
  };

  return (
    <Layout>
      <div
        className=" relative w-full h-[100%] overflow-y-auto py-4 px-2 sm:px-4"
        style={{ zoom: 1.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
              Meeting
            </h1>
          </div>

          {/* ---------Template Buttons */}
          <div className="flex items-center gap-4">
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShow(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              New Meeting
            </button>
          </div>
        </div>
        <hr className="w-full h-[1px] bg-gray-300 my-4" />

        {/* ----------------FullCalendar------------- */}
        {isloading ? (
          <div className="w-full">
            <Loader />
          </div>
        ) : (
          <div className="calendar-container w-full">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              eventClick={handleEventClick}
              height="auto"
              contentHeight="auto"
              eventColor="transparent"
              eventDisplay="block"
              eventContent={renderEventContent}
            />
          </div>
        )}

        {/* ----------Handle Meeting--------- */}
        {show && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/80 flex items-center justify-center">
            <div className="w-[50rem]">
              <MeetingModal
                setShowReminder={setShow}
                link={"/meetings"}
                meetingId={meetingId}
                fetchMeetingData={fetchMeetingData}
                setMeetingId={setMeetingId}
              />
            </div>
          </div>
        )}
        {/* ----------Handle Meeting Detail--------- */}
        {showDetail && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full bg-gray-300/80 flex items-center justify-center">
            <div className="w-[50rem] ">
              <MeetingDetail
                setShowDetail={setShowDetail}
                meetingId={meetingId}
                fetchMeetingData={fetchMeetingData}
                setMeetingId={setMeetingId}
                setShow={setShow}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
