import { useState } from "react";
import { LuRefreshCcw } from "react-icons/lu";
import axios from "axios";
import toast from "react-hot-toast";

const RefreshLeadsButton = ({ getAllLeads }) => {
  const [loading, setLoading] = useState(false);

  const triggerManualLeadUpdates = async () => {
    setLoading(true);
    try {
      const { status } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/update-leads`
      );
      if (status === 200) {
        toast.success("Updating table...")
        getAllLeads();
      }
    } catch (error) {
      console.error("Failed to get latest leads", error);
      toast.error("Failed to get latest leads");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={triggerManualLeadUpdates}
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
