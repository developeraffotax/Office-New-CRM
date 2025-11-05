import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import EmailDetailDrawer from "../../pages/Tickets/EmailDetailDrawer";
import ActivityLogDrawer from "../Modals/ActivityLogDrawer";
import DetailComments from "../../pages/Tasks/TaskDetailComments";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

const EmailDetailDrawerNewWrapper = ({
  email,
  clientName,
  open,
  setEmailPopup,
}) => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [ticketId, setTicketId] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");

  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);

  const toggleDrawer = (newOpen = false) => {
    setEmailPopup((prev) => ({ ...prev, open: newOpen }));
  };

  const fetchTicketsByName = async () => {
    setIsLoading(true);

    const url = email
      ? `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/ticketsByClientName?email=${email}`
      : `${process.env.REACT_APP_API_URL}/api/v1/tickets/all/ticketsByClientName?clientName=${clientName}`;

    try {
      const { data } = await axios.get(url);

      if (data && data?.emails?.length > 0) {
        setTickets(data?.emails);

        const ticketsArr = data?.emails;
        const lastTicketIndex = ticketsArr?.length - 1;
        const lastTicket = ticketsArr[lastTicketIndex];

        setTicketId(lastTicket?._id);
      } else {
        toast.error("Could not find any ticket for this Lead");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsByName();
  }, []);


  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)

  const isReplyModalOpenCb = (isOpen) => {
    setIsReplyModalOpen(isOpen)
  }



  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape key shortcut
      if (e.key === "Escape") {

        if(!isReplyModalOpen) {
            toggleDrawer(false);
            setTicketId("");
            setTicketSubject("");
        }
        
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isReplyModalOpen]);

  return (
    <div className="fixed inset-0 z-[499] flex items-center justify-center bg-black/30 backdrop-blur-sm  h-full     ">
      <div className="h-[95%] bg-gray-100 rounded-xl shadow-lg w-[95%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[70%] 3xl:w-[60%]    py-4 px-5   ">
        <div className="h-full w-full flex flex-col justify-start items-center relative">
          <div className="flex items-center justify-between border-b pb-2 mb-3 self-start w-full">
            <h3 className="text-lg font-semibold">
              Ticket: {ticketSubject ? ticketSubject : "Loading..."}
            </h3>
            <button
              className="p-1 rounded-2xl bg-gray-50 border hover:shadow-md hover:bg-gray-100"
              onClick={() => {
                toggleDrawer(false);
                setTicketId("");
                setTicketSubject("");
              }}
            >
              <IoClose className="h-5 w-5" />
            </button>
          </div>

          {ticketId ? (
            <div className=" w-full h-full flex justify-center items-center gap-8 px-8 py-4 overflow-hidden ">
              <EmailDetailDrawer
                id={ticketId}
                setTicketSubject={setTicketSubject}

                isReplyModalOpenCb={isReplyModalOpenCb}
              />

              <div className="w-full h-full flex flex-col justify-start items-start gap-5 ">
                <div className="max-w-lg w-full h-[50%] px-3">
                  <ActivityLogDrawer
                    isOpen={isActivityDrawerOpen}
                    onClose={() => setIsActivityDrawerOpen(false)}
                    ticketId={ticketId}
                  />
                </div>

                <div className="max-w-lg w-full  h-[50%]">
                  <DetailComments
                    type={"ticket"}
                    jobId={ticketId}
                    getTasks1={() => {}}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Loading ticket...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDetailDrawerNewWrapper;
