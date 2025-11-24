import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AutoCreateLeadFromURL = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const name = searchParams.get("name");
    const email = searchParams.get("email");

    if (!name || !email) {
      toast.error("Missing name or email in URL");
      return;
    }

    const createLead = async () => {
      try {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/create/lead`,
          { clientName: name, email } // only send name + email
        );

        if (data?.lead) {
          toast.success("Lead created successfully!");

          // Optional redirect back to leads page
          navigate("/leads");
        }
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Failed to create lead");
      }
    };

    createLead();
  }, [navigate]);

  return (
    <div className="p-5 text-center">
      <h2 className="text-lg font-semibold">Creating lead...</h2>
    </div>
  );
};

export default AutoCreateLeadFromURL;
