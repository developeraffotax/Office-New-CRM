import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setAuth } from "../../redux/slices/authSlice";
import axios from "axios";
import { TbLoader3 } from "react-icons/tb";
import { IoArrowBack } from "react-icons/io5";
import { OtpInput } from "./components/OtpInput";

const OTP_DURATION = 600;
const API_URL = process.env.REACT_APP_API_URL;

const btnCls = `
  w-full py-3 rounded-xl font-semibold text-sm text-white
  bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600
  shadow-[0_6px_20px_rgba(249,115,22,0.3)]
  hover:shadow-[0_10px_28px_rgba(249,115,22,0.4)] hover:-translate-y-[1px]
  active:translate-y-0
  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0
  transition-all duration-200 flex items-center justify-center gap-2
`;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { tempToken: initialTempToken, email, password } = location.state || {};

  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(OTP_DURATION);
  const [tempToken, setTempToken] = useState(initialTempToken || "");


  // 🔐 Redirect guard
  useEffect(() => {
    if (!initialTempToken || !email) {
      navigate("/login", { replace: true });
    }
  }, []);

  // ── AUTO-SUBMIT WHEN 4 DIGITS ARE REACHED ──
  useEffect(() => {
    if (otp.length === 4 && !otpLoading) {
      handleVerifyOtp();
    }
  }, [otp]);

  // ✅ Set expiry only once
  const setOtpExpiry = () => {
    const expiry = Date.now() + OTP_DURATION * 1000;
    localStorage.setItem("otp_expiry", expiry);
  };

  useEffect(() => {
    if (!localStorage.getItem("otp_expiry")) {
      setOtpExpiry();
    }
  }, []);



 
  // ✅ Timer based on expiry
  useEffect(() => {
    const interval = setInterval(() => {
      const expiry = localStorage.getItem("otp_expiry");

      if (!expiry) return;

      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));

      setTimer(remaining);

      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimer = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0",
    )}`;

  const maskedEmail = (email || "").replace( /(.{2})(.*)(@.*)/, (_, a, b, c) => a + b.replace(/./g, "•") + c, );

  // ── VERIFY OTP ──
  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      toast.error("Enter all 4 digits");
      return;
    }

    setOtpLoading(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/api/v1/user/verify-otp`,
        { otp },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
          },
        },
      );

      if (data.success) {
        localStorage.setItem("auth", JSON.stringify(data));
        localStorage.removeItem("otp_expiry");

        dispatch(setAuth({ user: data.user, token: data.token }));
        axios.defaults.headers.common["Authorization"] = data.token;
        
        toast.success("Login successful!");
        navigate("/employee/dashboard", {replace: true});
      } else {
        setOtp("");
        toast.error(data.message || "Invalid OTP");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── RESEND OTP ──
const handleResend = async () => {
  setOtp("");
  setResendLoading(true);

  try {
    const { data } = await axios.post(`${API_URL}/api/v1/user/login/user`, {
      email,
      password,
    });

    if (data.success) {
      setTempToken(data.tempToken);

      setOtpExpiry();            // ✅ new expiry
      setTimer(OTP_DURATION);    // ✅ instantly reset timer UI

      toast.success("New OTP sent!");
    }
  } finally {
    setResendLoading(false);
  }
};

 

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#ffffff",
            color: "#1f2937",
            border: "1px solid rgba(0,0,0,0.05)",
            fontSize: "13.5px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)",
          },
        }}
      />

      <div  className="h-[111vh]  flex items-center justify-center px-4 py-8 bg-[#f8fafc8c]  relative overflow-hidden  font-google">
        {/* light theme glow */}
        <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-orange-200/30 rounded-full blur-[140px] -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-amber-100/40 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />

        {/* light grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.02) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div
          className="animate-card-in relative z-10 w-full max-w-[420px] rounded-2xl px-8 py-9  
          bg-white/50 backdrop-blur-lg
            shadow-md"
           
        >
          {/* top accent */}
          <div className="absolute top-0 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent" />

          <div className="flex justify-center mb-6">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 drop-shadow-[0_4px_10px_rgba(249,115,22,0.2)]"
            />
          </div>

          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1.5 text-slate-400 hover:text-orange-500 text-xs mb-5 transition"
          >
            <IoArrowBack size={13} /> Back
          </button>

          <h1 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">
            Verify your identity
          </h1>

          <p className="text-sm text-slate-500 mb-6">
            Enter the 4-digit code sent to your email
          </p>

          {/* email badge - light version */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 text-sm text-orange-600 font-medium animate-badge-pop">
              ✉ {maskedEmail}
            </span>
          </div>

          <OtpInput value={otp} onChange={setOtp} />

          {/* ── TIMER ── */}
          <p className="text-center text-xs mb-4">
            {timer > 0 ? (
              <span className="text-slate-500">
                Expires in{" "}
                <span className="text-orange-600 font-semibold">
                  {formatTimer(timer)}
                </span>
              </span>
            ) : (
              <span className="text-red-500 font-medium">Code expired</span>
            )}
          </p>

          <button
            onClick={handleVerifyOtp}
            disabled={otpLoading || otp.length < 4}
            className={`mb-4 ${btnCls}`}
          >
            {otpLoading ? (
              <>
                <TbLoader3 className="animate-spin" size={17} />
                Verifying…
              </>
            ) : (
              "Verify & Sign In"
            )}
          </button>

          <p className="text-center text-sm text-slate-500">
            Didn't receive it?{" "}
            <button
              onClick={handleResend}
              disabled={resendLoading || timer > 540}
              className="text-orange-600 hover:text-orange-700 disabled:text-slate-300 font-medium transition"
            >
              {resendLoading ? "Sending…" : "Resend code"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}