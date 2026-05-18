import axios from "axios";
import toast from "react-hot-toast";

export const getClientIdFromCompanyName = async (companyName) => {
  try {
    const { data } = await axios.get( `${ process.env.REACT_APP_API_URL }/api/v1/client/search?companyName=${encodeURIComponent( companyName )}` );
    return data?.client?._id || "";
  } catch (error) {
    console.log(error);
    toast.error(error?.response?.data?.message || "Failed to fetch client information. Please try again.");
    return "";
  }
};