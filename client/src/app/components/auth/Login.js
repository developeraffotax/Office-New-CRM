"use client";
import { useAuth } from "@/app/context/authContext";
import { Style } from "@/app/utils/CommonStyling";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { CgSpinnerTwo } from "react-icons/cg";
import { IoMdEyeOff } from "react-icons/io";
import { IoEye } from "react-icons/io5";
import { MdOutlineAttachEmail } from "react-icons/md";
import { MdLockOutline } from "react-icons/md";
import { MdOutlineMail } from "react-icons/md";

export default function Login() {
  const { auth, setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const router = useRouter();

  //   Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/login`,
        { email, password }
      );
      if (data) {
        router.push("/users");
        toast.success("Login Successful");
        setAuth({ ...auth, user: data.user, token: data.token });
        localStorage.setItem("auth", JSON.stringify(data));
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
      setEmail("");
      setPassword("");
    }
  };
  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="w-full h-full grid grid-cols-8 gap-4 ">
        <div className=" col-span-8 sm:col-span-4 w-full h-full p-3 sm:p-4">
          <div className="flex items-center gap-3 py-2 w-full">
            <h1 className="text-2xl 3xl:text-3xl font-semibold">
              Simple Sync AI
            </h1>
            <span className="h-[2rem] w-[2px] bg-gray-500"></span>
          </div>
          <div className="w-full h-full flex flex-col gap-4 items-center justify-center ">
            <h2 className="text-xl sm:text-3xl 3xl:text-[3xl] font-medium text-customBrown">
              Log In to Simple Sync AI
            </h2>
            <form
              onSubmit={handleLogin}
              className="w-full max-w-[28rem] px-3 sm:px-4"
            >
              <div className="flex flex-col gap-4 w-full mt-4 ">
                <div className="relative w-full">
                  <MdOutlineMail className="absolute top-[.7rem] left-2 h-5 w-5 z-10 text-gray-400 " />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`h-[2.7rem] w-full rounded-lg border-none bg-gray-100  outline-customBrown text-black pl-8`}
                  />
                </div>

                <div className="relative w-full">
                  <span
                    className="absolute top-[.6rem] right-2   z-10  cursor-pointer "
                    onClick={() => setShow(!show)}
                  >
                    {!show ? (
                      <IoMdEyeOff className="h-6 w-6 text-gray-400" />
                    ) : (
                      <IoEye className="h-6 w-6 text-gray-400" />
                    )}
                  </span>

                  <MdLockOutline className="absolute top-[.5rem] left-2 h-5 w-5 z-10 text-gray-400 " />

                  <input
                    type={show ? "text" : "password"}
                    placeholder="Password"
                    required
                    value={password}
                    minLength={6}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`h-[2.7rem] w-full rounded-lg border-none bg-gray-100  outline-customBrown text-black pl-8`}
                  />
                </div>

                {/* Button */}
                <div className="flex items-center justify-center w-full py-4 px-2 sm:px-[4rem] ">
                  <button type="submit" className={`${Style.button1}`}>
                    {loading ? (
                      <CgSpinnerTwo className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        {/* Image */}
        <div className="col-span-4 w-full h-full hidden sm:block">
          <div className="relative w-full h-screen">
            <Image
              src="/flooring.jpg"
              alt="login"
              layout="fill"
              objectFit="fill"
              priority={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
