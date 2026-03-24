import axios from "axios";
import toast from "react-hot-toast";

export const createTicket = async ({
  companyName,
  clientName,
  jobHolder,
  subject,
  email,
  mailThreadId,
  myCompany,
}) => {
  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/v1/tickets/create-ticket`,
      {
        companyName,
        clientName,
        jobHolder,
        subject,
        email,

        mailThreadId,

        company: myCompany?.charAt(0).toUpperCase() + myCompany?.slice(1) || "",
        comments: [],
      },
    );

    if (data) {
      toast.success("Ticket created successfully!");
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Error creating ticket");
  } finally {
  }
};
