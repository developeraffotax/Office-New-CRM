import React from "react";
import { CgClose } from "react-icons/cg";
import { useAuth } from "../../context/authContext";
import { FaPen } from "react-icons/fa";

export default function ProfileModal({ setIsProfile, setIsActive }) {
  const { auth } = useAuth();

  return (
    <div className="relative w-[30rem]  bg-white rounded-lg overflow-hidden">
      <span
        className="absolute top-3 right-3 cursor-pointer z-10 p-1 rounded-lg bg-white/50 hover:bg-white/70 transition-all duration-150 flex items-center justify-center"
        onClick={() => {
          setIsActive(false);
          setIsProfile(false);
        }}
      >
        <CgClose className="h-5 w-5 text-black" />
      </span>
      <div className="flex flex-col gap-4">
        <div
          className="w-full h-[12rem] flex items-center justify-center "
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(255, 69, 0, 0.5), rgba(255, 69, 0, 0.3), rgba(255, 69, 0, 0.1))",
          }}
        >
          <div className="relative">
            <img
              src={`${
                auth?.user?.avatar ? auth?.user?.avatar : "/profile1.jpeg"
              }`}
              alt="Admin"
              className={`rounded-full w-[6rem] h-[6rem] border-2 border-orange-600`}
              onClick={() => setIsProfile(true)}
            />
            <input type="file" id="logo" className="hidden" />
            <label
              htmlFor="logo"
              className="absolute bottom-6 right-[-.6rem] cursor-pointer p-1"
            >
              <FaPen className="h-4 w-4 text-gray-600 hover:text-orange-700 transition-all duration-150 " />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
