import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";

import ActivityLogDrawer from "../Modals/ActivityLogDrawer";
import DetailComments from "../../pages/Tasks/TaskDetailComments";
import EmailDetailDrawer from "../../pages/Tickets/EmailDetailDrawer";
import { closeTicketModal } from "../../redux/slices/ticketModalSlice";

const TicketModalGlobal = () => {
    
  const dispatch = useDispatch();
  const { isModalOpen, ticketId } = useSelector((state) => state.ticketModal);

  const [ticketSubject, setTicketSubject] = useState("");
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  const isReplyModalOpenCb = (isOpen) => {
    setIsReplyModalOpen(isOpen);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      
      if (e.key === "Escape") {
        if (!isReplyModalOpen) {
          dispatch(closeTicketModal());
          setTicketSubject("");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () =>  window.removeEventListener("keydown", handleKeyDown);
  }, [isReplyModalOpen]);

  return (
    <>
      {isModalOpen && (
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
                    dispatch(closeTicketModal());

                    setTicketSubject("");
                    //   navigate(location.pathname, { replace: true });
                  }}
                >
                  <IoClose className="h-5 w-5" />
                </button>
              </div>

              <div className=" w-full h-full flex justify-center items-center gap-8 px-8 py-4 overflow-hidden ">
                <EmailDetailDrawer
                  id={ticketId}
                  setTicketSubject={setTicketSubject}
                  isReplyModalOpenCb={isReplyModalOpenCb}
                  // setEmailData={setEmailData}
                />

                <div className="w-full h-full flex flex-col justify-start items-start gap-5 ">
                  <div className="max-w-lg w-full h-[50%] px-3">
                    <ActivityLogDrawer ticketId={ticketId} />
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketModalGlobal;
