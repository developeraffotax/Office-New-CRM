import { useState } from "react";
import { LuRefreshCcw } from "react-icons/lu";

const RefreshLeadsButton = ({ getAllLeads }) => {
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={getAllLeads}
      disabled={loading}
      title="Refresh Data"
      className={`p-1 rounded-md border bg-gray-50 hover:shadow-md transition 
        ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <LuRefreshCcw
        className={`text-[22px] transition-transform duration-300 ${
          loading ? "animate-spin " : ""
        }`}
      />
    </button>
  );
};

export default RefreshLeadsButton;
