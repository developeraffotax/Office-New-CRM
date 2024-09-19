import React, { useState } from "react";

import Layout from "../../components/Loyout/Layout";
import { style } from "../../utlis/CommonStyle";
import { IoClose } from "react-icons/io5";
import SendEmailModal from "../../components/Tickets/SendEmailModal";

export default function Tickets() {
  const [showSendModal, setShowSendModal] = useState(false);
  return (
    <Layout>
      <div className=" relative w-full min-h-screen py-4 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className=" text-xl sm:text-2xl font-semibold ">Tickets</h1>

            <span
              className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
              // onClick={() => {
              //   handleClearFilters();
              // }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6  cursor-pointer" />
            </span>
          </div>

          {/* ---------Template Buttons */}
          <div className="flex items-center gap-4">
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShowSendModal(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              New Ticket
            </button>
          </div>
        </div>

        {/* ---------------------Send Email Modal------------------ */}
        {showSendModal && (
          <div className="fixed top-0 left-0 z-[999] w-full h-full py-1 bg-gray-700/70 flex items-center justify-center">
            <SendEmailModal setShowSendModal={setShowSendModal} />
          </div>
        )}
      </div>
    </Layout>
  );
}
