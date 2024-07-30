import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { TbLoader3 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { auth, setAuth } = useAuth();
  const [isShow, setIsShow] = useState(false);
  const navigate = useNavigate();

  //   Login User
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/user/login/user`,
        {
          email,
          password,
        }
      );

      if (data?.success) {
        setAuth({ ...auth, user: data?.user, token: data?.token });
        localStorage.setItem("auth", JSON.stringify(data));
        navigate("/dashboard");
        toast.success("Login successfully!", { duration: 2000 });
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message, { duration: 2000 });
      setLoading(false);
    }
  };
  return (
    <div className="w-full min-h-screen flex items-center justify-center py-6 px-4">
      <div className="bg-gray-100 rounded-md shadow1 py-4 px-4 w-[30rem]">
        <h3 className="text-2xl font-semibold text-black text-center w-full ">
          Sign In to Affotax
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="" className="text-[1.1rem] font-[400] ">
              Enter your Email
            </label>
            <input
              type="email"
              placeholder="loginmail@gmail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="py-2 px-3 border-2  text-[15px] outline-none border-gray-900 rounded-md shadow-md"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="" className="text-[1.1rem] font-[400] ">
              Enter your Password
            </label>
            <div className="relative w-full">
              <div
                className="absolute top-2 right-2 z-10 cursor-pointer"
                onClick={() => setIsShow(!isShow)}
              >
                {!isShow ? (
                  <IoMdEyeOff size={25} className="cursor-pointer" />
                ) : (
                  <IoMdEye size={25} className="cursor-pointer" />
                )}
              </div>
              <input
                type={!isShow ? "password" : "text"}
                placeholder="password!@#%"
                required
                value={password}
                // minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2 px-3 border-2  text-[15px] outline-none border-gray-900 rounded-md shadow-md"
              />
            </div>
            {/* <div className="flex items-start sm:items-center flex-col sm:flex-row justify-normal sm:justify-between my-3">
              <span
                type="button"
                // onClick={() => setRoute("ResetPassword")}
                className="text-blue-500 font-Poppins font-medium text-[1.1rem] hover:text-blue-600 cursor-pointer "
              >
                Reset Password
              </span>
            </div> */}
            <button
              type="submit"
              className={`btn ${
                loading && "animate-pulse pointer-events-none"
              }`}
            >
              {loading ? (
                <TbLoader3 className="h-5 w-5 animate-spin " />
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
