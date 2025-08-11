import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../redux/slices/authSlice";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { TbLoader3 } from "react-icons/tb";
import { style } from "../../utlis/CommonStyle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isShow, setIsShow] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth.auth);

  useEffect(() => {
    if (auth.token) {
      navigate("/employee/dashboard");
    }
  }, [auth.token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resultAction = await dispatch(loginUser({ email, password }));
      

      if (loginUser.fulfilled.match(resultAction)) {
        toast.success("Login successfully!", { duration: 2000 });
        navigate("/employee/dashboard");
      } else {
        toast.error(resultAction.payload || "Login failed", { duration: 2000 });
      }
    } catch (err) {
      toast.error("Something went wrong", { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[111vh] flex items-center justify-center py-6 px-4 backgroundC">
      <div className="rounded-md shadow1 py-4 px-4 w-[30rem] bg-white">
        <div className="flex items-center justify-center flex-col">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-[6] h-[6rem] drop-shadow-2xl shadow-gray-200 shadow-opacity-50 shadow-offset-2"
          />
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="inputBox">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${style.input} w-full py-2 px-3 border-2 bg-white text-[15px] outline-none border-gray-900 rounded-md shadow-md`}
              />
              <span>Enter your Email</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="relative w-full">
              <div
                className="absolute top-2 right-2 z-10 cursor-pointer"
                onClick={() => setIsShow(!isShow)}
              >
                {!isShow ? <IoMdEyeOff size={25} /> : <IoMdEye size={25} />}
              </div>

              <div className="inputBox">
                <input
                  type={!isShow ? "password" : "text"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${style.input} w-full py-2 px-3 border-2 bg-white text-[15px] outline-none border-gray-900 rounded-md shadow-md`}
                />
                <span>Password</span>
              </div>
            </div>

            <div className="w-full flex items-center justify-end mt-4">
              <button
                type="submit"
                className={`py-[.5rem] px-[1.6rem] ${style.btn} flex items-center justify-center text-white shadow cursor-pointer ${
                  loading && "animate-pulse pointer-events-none"
                }`}
              >
                {loading ? <TbLoader3 className="h-5 w-5 animate-spin" /> : "Sign In"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
