import { useState } from "react";
import { LuRefreshCcw } from "react-icons/lu";
import axios from "axios";
import toast from "react-hot-toast";

const RefreshTicketsButton = ({ getAllEmails }) => {
  const [loading, setLoading] = useState(false);

  // const triggerManualTicketUpdates = async () => {
  //   setLoading(true);
  //   try {
  //     const { status } = await axios.get(
  //       `${process.env.REACT_APP_API_URL}/api/v1/tickets/update-tickets`
  //     );
  //     if (status === 200) {
  //       toast.success("Updating table...")
  //       getAllEmails();
  //     }
  //   } catch (error) {
  //     console.error("Failed to get latest tickets", error);
  //     toast.error("Failed to get latest tickets");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <button
      onClick={getAllEmails}
      disabled={loading}
      title="Refresh Data"
      className={`p-1 rounded-md border bg-gray-50 hover:shadow-md transition 
        ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <LuRefreshCcw
        className={`text-[22px] transition-transform duration-300 ${
          loading ? "animate-spin" : ""
        }`}
      />
    </button>
  );
};

export default RefreshTicketsButton;
