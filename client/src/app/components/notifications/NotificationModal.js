"use client";
import React, { useEffect, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoIosClose } from "react-icons/io";
import toast from "react-hot-toast";
import axios from "axios";
import JoditEditor from "jodit-react";
import Select from "react-select";
import { FaSpinner } from "react-icons/fa";
import { Style } from "@/app/utils/CommonStyling";

export default function NotificationModal({
  closeModal,
  setAddNotification,
  notificationId,
  setNotificationId,
}) {
  const [usersData, setUsersData] = useState([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [emails, setEmails] = useState([]);
  const editor = useRef(null);
  const [usersOptions, setUsersOptions] = useState([]);
  const [isloading, setIsloading] = useState(false);

  console.log("emails:", emails);

  useEffect(() => {
    if (usersData && Array?.isArray(usersData)) {
      const formattedOptions = usersData?.map((user) => ({
        value: user.email || "",
        label: user.name || "",
      }));
      setUsersOptions(formattedOptions);
    }
  }, [usersData]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/all`
      );
      if (data) {
        setUsersData(data.users);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  //   -----------Handle Submit--------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !content) {
      return toast.error("Please fill all the fields");
    }
    setIsloading(true);
    const data = {
      subject,
      context: content,
      emails: emails.map((email) => email.value),
    };
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/send`,
        data
      );
      if (res?.data?.success) {
        toast.success(res?.data?.message);
        setSubject("");
        setContent("");
        setEmails([]);
        setIsloading(false);
        setNotificationId("");
        setAddNotification(false);
      } else {
        toast.error(res?.data?.message);
        setIsloading(false);
      }
    } catch (error) {
      console.log("Error sending notification:", error);
      toast.error("Error sending notification. Please try again!");
      setIsloading(false);
    }
  };

  // Editor configuration
  const config = {
    readonly: false,
    contentCss: "body { color: red; }",
    height: 450,
    width: 1000,
    color: "#111",
    placeholder: "Write content here...",
  };

  return (
    <div className="w-[40rem] bg-white rounded-md overflow-hidden shadow min-h-[15rem] max-h-[99%] flex flex-col">
      <div className="flex items-center justify-between bg-customBrown px-4 py-2 sm:py-4 ">
        <h3 className="text-lg font-medium text-white">
          {notificationId ? "Edit Notification" : "Add Notification"}
        </h3>
        <span
          onClick={() => {
            setNotificationId("");
            setAddNotification(false);
          }}
          className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white "
        >
          <CgClose className="text-[18px]" />
        </span>
      </div>
      <div className="w-full h-[98%] overflow-y-auto ">
        <form
          onSubmit={handleSubmit}
          className=" flex flex-col gap-4 px-4 py-2 mt-4 h-full w-full "
        >
          {/* Left */}
          <div className="flex flex-col gap-4">
            {/* --------Name---------- */}
            <div className="">
              <label className="block text-sm font-medium text-gray-700">
                Subject<span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`${Style.input} outline-none rounded-sm border border-gray-300 py-[5px] px-2 w-full`}
                placeholder="Enter Subject"
                required
              />
            </div>
            {/* Users */}
            <div className="">
              <label className="block text-sm font-medium text-gray-700">
                Emails <span className="text-red-700">*</span>
              </label>
              <Select
                options={usersOptions}
                value={emails}
                onChange={setEmails}
                isMulti
                placeholder="Select Users"
                required
              />
            </div>

            {/*  */}
          </div>
          {/* Description */}
          {/* <JoditEditor
            ref={editor}
            value={content}
            config={config}
            color="#fff"
            tabIndex={1}
            onBlur={(newContent) => setContent(newContent)}
            required
          /> */}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your message here"
            className={`${Style.input} h-[10rem] resize-none outline-none rounded-sm border border-gray-300 py-[5px] px-2 w-full`}
          ></textarea>

          <div className="flex items-center justify-end w-full pb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setNotificationId("");
                  setAddNotification(false);
                }}
                className="w-[6rem] py-[.3rem] text-[14px] rounded-sm border-2 border-customRed text-customBrown hover:bg-gray-100 hover:shadow-md hover:scale-[1.03] transition-all duration-300 "
              >
                CANCEL
              </button>
              <button className="w-[6rem] py-[.4rem] text-[14px] flex items-center justify-center rounded-sm bg-customBrown hover:bg-orange-950 hover:shadow-md hover:scale-[1.03] transition-all duration-300 text-white">
                {isloading ? (
                  <span>
                    <FaSpinner className="h-5 w-5 text-white animate-spin" />
                  </span>
                ) : (
                  <span>{notificationId ? "Save" : "SUBMIT"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
