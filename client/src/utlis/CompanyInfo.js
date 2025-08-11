import { createPortal } from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
 import axios from "axios";
 import { useSelector } from "react-redux";

// Helper Components
const InfoRow = ({ label, value, copyValue }) => {
  const handleCopy = (text) => {
    if (!text || typeof text !== "string") return;
    navigator.clipboard.writeText(text);
    toast.success(`${text} copied!`);
  };

  return (
    <div className="flex justify-between items-center border border-gray-200 rounded px-2 py-1 bg-white cursor-pointer  transition-all duration-300 hover:scale-[1.02] ">
      <span className="font-medium text-gray-700 w-[40%]">{label}</span>
      <span
        className="w-[60%] text-gray-800  text-right truncate "
        title="Click to copy"
        onClick={() =>
          handleCopy(copyValue || (typeof value === "string" ? value : ""))
        }
      >
        {value || <NA />}
      </span>
    </div>
  );
};

const NA = () => <span className="text-red-500">N/A</span>;

const CompanyInfo = ({ anchorRef, clientId, onClose }) => {
      const auth = useSelector((state => state.auth.auth));

  const popupRef = useRef(null);
  const [position, setPosition] = useState(null);

  const [clientDetail, setClientDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("subtasks");

  const getClient = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/client/single/client/${clientId}`
      );
      if (data) {
        setLoading(false);
        setClientDetail(data.clientJob);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message || "Error in client Jobs");
    }
  };

  useEffect(() => {
    if (clientId) {
      getClient();
    }
  }, [clientId]);

  useEffect(() => {
    const anchor = anchorRef?.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    const popupHeight = 450; // estimate or measure your popup height
    const viewportHeight = window.innerHeight;

    // Determine whether there's enough space below, else position above
    const showAbove = rect.bottom + popupHeight > viewportHeight;

    setPosition({
      top: showAbove
        ? rect.top + scrollTop - popupHeight - 10
        : rect.top + rect.height + scrollTop + 4,
      left: rect.left + scrollLeft,
    });
  }, [anchorRef]);


  

useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleClickOutside = (event) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(event.target) &&
      !anchorRef?.current?.contains(event.target)
    ) {
      onClose();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);




  if (!position) return null;

  return createPortal(
    <div
      ref={popupRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left + 200}px`,
      }}
      className="fixed z-[9999] w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border border-gray-200 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-white p-4 text-sm transition-all duration-100  "
    >
      {/* Main Sections */}
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <span className="text-white">Loading...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Job Details*/}
          <section className="bg-gray-50 p-2 rounded-xl border shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-3 border-b pb-1">
              Job Details
            </h3>
            <div className="space-y-2">
              <InfoRow label="Client Name" value={clientDetail?.clientName} />
              <InfoRow
                label="Company Name"
                value={
                  <span className="inline-block py-0.5 px-3 rounded-full shadow-sm bg-cyan-600 text-white text-[13px] font-medium">
                    {clientDetail?.companyName}
                  </span>
                }
                copyValue={clientDetail?.companyName}
              />
              <InfoRow
                label="Registration Name"
                value={clientDetail?.regNumber}
              />
              {auth?.user?.role?.name === "Admin" && (
                <InfoRow label="Email" value={clientDetail?.email} />
              )}

               {auth?.user?.role?.name === "Admin" && (
                <InfoRow label="Phone" value={clientDetail?.phone} />
              )}


              <InfoRow label="Hours" value={clientDetail?.totalHours} />
            </div>
          </section>

          {/* Login Credentials */}
          <section className="bg-gray-50 p-2 rounded-xl border shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-3 border-b pb-1">
              Login Info
            </h3>
            <div className="space-y-2">
              {[
                { label: "CT Login", login: "ctLogin", password: "ctPassword" },
                {
                  label: "PYE Login",
                  login: "pyeLogin",
                  password: "pyePassword",
                },
                { label: "TR Login", login: "trLogin", password: "trPassword" },
                {
                  label: "VAT Login",
                  login: "vatLogin",
                  password: "vatPassword",
                },
              ].map(({ label, login, password }, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border border-gray-200 rounded-md px-2 py-1 bg-white shadow-sm cursor-pointer  transition-all duration-300 hover:scale-[1.02]"
                >
                  <span className="font-medium text-gray-700 w-[40%]">
                    {label}
                  </span>
                  <div className="flex gap-2 items-center w-[60%] text-gray-600 text-sm truncate">
                    <span
                      className="truncate cursor-pointer hover:text-black"
                      title="Click to copy login"
                      onClick={() => {
                        if (clientDetail?.[login]) {
                          navigator.clipboard.writeText(clientDetail[login]);
                          toast.success("Login copied!");
                        }
                      }}
                    >
                      {clientDetail?.[login] || <NA />}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span
                      className="truncate cursor-pointer hover:text-black"
                      title="Click to copy password"
                      onClick={() => {
                        if (clientDetail?.[password]) {
                          navigator.clipboard.writeText(clientDetail[password]);
                          toast.success("Password copied!");
                        }
                      }}
                    >
                      {clientDetail?.[password] || <NA />}
                    </span>
                  </div>
                </div>
              ))}
              <InfoRow
                label="Authentication Code"
                value={
                  <span className="inline-block py-0.5 px-3 rounded-full bg-teal-600 text-white shadow text-xs font-semibold">
                    {clientDetail?.authCode}
                  </span>
                }
                copyValue={clientDetail?.authCode}
              />
              <InfoRow label="UTR" value={clientDetail?.utr} />
            </div>
          </section>
        </div>
      )}
    </div>,
    document.body
  );
};

export default CompanyInfo;
