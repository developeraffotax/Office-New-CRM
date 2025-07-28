import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import { AiOutlineDelete } from "react-icons/ai";
import { LuLock } from "react-icons/lu";
import { LuClock8 } from "react-icons/lu";
import { format, parse, parseISO } from "date-fns";
import { BiDetail } from "react-icons/bi";
import { IoPodiumOutline } from "react-icons/io5";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaUsers } from "react-icons/fa";
import { MdOutlineEdit } from "react-icons/md";
import { useAuth } from "../../context/authContext";

export default function MeetingDetail({
  setShowDetail,
  meetingId,
  fetchMeetingData,
  setMeetingId,
  setShow,
}) {
  const { auth } = useAuth();
  const [meeting, setMeeting] = useState([]);
  const [loading, setLoading] = useState(false);

  const meetingData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/meetings/meeting/detail/${meetingId}`
      );
      if (data) {
        setMeeting(data.meeting);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    meetingData();
    // eslint-disable-next-line
  }, []);
  // ------Delete User------>
  const handleDeleteConfirmation = (meetingId) => {
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
        handleDelete(meetingId);
        Swal.fire("Deleted!", "Meeting has been deleted.", "success");
      }
    });
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/meetings/delete/meeting/${id}`
      );
      if (data) {
        fetchMeetingData();
        setShowDetail(false);
        setMeetingId("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  // const formatMeetingDate = (date, time) => {
  //   if (!date || !time) return "";

  //   const meetingDate = new Date(date);

  //   const options = { weekday: "short", month: "long", day: "numeric" };
  //   const formattedDate = meetingDate.toLocaleDateString("en-US", options);

  //   const formattedTime = format(parse(time, "HH:mm", new Date()), "h:mm a");

  //   return `${formattedDate}, ${formattedTime}`;
  // };

 const formatDateTime = (utcString) => {
  if (!utcString) return "";

  try {
    const date = parseISO(utcString);

    const formattedDate = format(date, "EEE, MMMM d, h:mm a"); // "Mon, July 28, 5:00 PM"
    return formattedDate;
  } catch (error) {
    console.error("Invalid date string:", utcString);
    return "";
  }
};


  return (
    <div className=" relative w-full  rounded-lg shadow-md bg-white max-h-[99vh] overflow-y-auto overflow-hidden hidden1">
      <div className="flex items-center justify-between py-4 px-3 sm:px-4 border-b border-gray-300">
        <h1 className="text-2xl font-semibold">Meeting Detail</h1>
        <span
          onClick={() => {
            setShowDetail(false);
            setMeetingId("");
          }}
          className="p-1 bg-gray-100 hover:bg-gray-200 transition-all duration-300 rounded-md"
        >
          <IoClose className="h-7 w-7 cursor-pointer" />
        </span>
      </div>
      <hr />
      {loading ? (
        <div className="w-full h-full p-4">
          <SkeletonTheme baseColor="#ccc" highlightColor="#777">
            <p>
              <Skeleton
                count={5}
                height={60}
                width="100%"
                className="animate-pulse"
              />
            </p>
          </SkeletonTheme>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-2">
            <span>
              <LuLock className="text-[26px] text-fuchsia-600" />
            </span>
            <h3 className="text-[20px] font-medium">{meeting?.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span>
              <LuClock8 className="text-[26px] text-green-600" />
            </span>
            <h3 className="text-[16px] text-gray-700 ">
               {formatDateTime(meeting?.scheduledAt)} 
              {/* {meeting.scheduledAt} */}
            </h3>
          </div>
          {meeting?.description && (
            <div className="flex items-start gap-2 mt-2">
              <span>
                <BiDetail className="text-[26px] text-orange-600" />
              </span>
              <div className="text-[16px] text-gray-800 border-l-4 border-orange-600 bg-gray-100 rounded-sm">
                <div
                  dangerouslySetInnerHTML={{
                    __html: meeting.description,
                  }}
                  className="whitespace-pre-wrap break-words px-2 py-2"
                ></div>
              </div>
            </div>
          )}
          {meeting?.results && (
            <div className="flex items-start gap-2  mt-2">
              <span>
                <IoPodiumOutline className="text-[26px] text-pink-600" />
              </span>
              <div className="text-[16px] text-gray-800 border-l-4 border-pink-600 bg-gray-100 rounded-sm">
                <div
                  dangerouslySetInnerHTML={{
                    __html: meeting.results,
                  }}
                  className="whitespace-pre-wrap break-words px-2 py-2"
                ></div>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2 mt-2">
            <span>
              <FaUsers className="text-[26px] text-yellow-600" />
            </span>
            <div className=" flex flex-wrap gap-4">
              {meeting?.usersList?.map((user) => (
                <div
                  key={user._id}
                  className=" py-2 px-3 rounded-lg bg-gray-200 text-black"
                >
                  {user?.name}
                </div>
              ))}
            </div>
          </div>
          {/* Action */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                setShowDetail(false);
                setMeetingId(meetingId);
                setShow(true);
              }}
              className="p-1 bg-sky-100 hover:bg-sky-200 mr-5 text-sky-500 hover:text-sky-600 rounded-full transition-all duration-300"
            >
              <MdOutlineEdit className="h-7 w-7 cursor-pointer" />
            </button>
            {auth?.user?.role?.name === "Admin" && (
              <button
                onClick={() => {
                  handleDeleteConfirmation(meetingId);
                }}
                className="p-1 bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-600 rounded-full transition-all duration-300"
              >
                <AiOutlineDelete className="h-7 w-7 cursor-pointer" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
