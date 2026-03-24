import { useState, useEffect } from "react";
import axios from "axios";

const useLeadModals = (auth) => {
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [clientCompanyName, setClientCompanyName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [showSendModal, setShowSendModal] = useState(false);
  const [access, setAccess] = useState([]);

  const [emailPopup, setEmailPopup] = useState({
    open: false,
    email: "",
    clientName: "",
  });

  const getEmails = async () => {
    try {
      await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/tickets`,
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (auth?.user) {
      const filterAccess = auth.user.role.access
        .filter((role) => role.permission === "Tickets")
        .flatMap((jobRole) => jobRole.subRoles);
      setAccess(filterAccess);
    }
  }, [auth]);

  return {
    showNewTicketModal,
    setShowNewTicketModal,
    clientCompanyName,
    setClientCompanyName,
    clientEmail,
    setClientEmail,
    clientName,
    setClientName,
    companyName,
    setCompanyName,
    showSendModal,
    setShowSendModal,
    access,
    emailPopup,
    setEmailPopup,
    getEmails,
  };
};

export default useLeadModals;
