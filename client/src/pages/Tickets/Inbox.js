import React, { useEffect, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { IoArrowBackOutline, IoSearch } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../../utlis/Loader";
// import { IoCaretBackCircleOutline } from "react-icons/io5";
// import { IoCaretForwardCircleOutline } from "react-icons/io5";

export default function Inbox() {
  const [selectedCompany, setSelectedCompany] = useState("Affotax");
  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [totalEmails, setTotalEmails] = useState(200);
  const pageSize = 20;

  const navigate = useNavigate();

  const getEmail = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/fetch/inbox/${selectedCompany}/${pageNo}`
      );
      if (data) {
        setInboxData(data.email.detailedEmails);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching emails!");
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmail();
  }, [selectedCompany, startIndex]);

  // Handle next page click (moves forward by 20 emails)
  const handleNextPage = () => {
    if (startIndex + pageSize < totalEmails) {
      setStartIndex((prev) => prev + pageSize);
    }
    setPageNo(pageNo + 1);
  };

  // Handle previous page click (moves back by 20 emails)
  const handlePreviousPage = () => {
    if (startIndex - pageSize >= 0) {
      setStartIndex((prev) => prev - pageSize);
    }
    setPageNo(pageNo - 1);
  };

  return (
    <Layout>
      <div className="relative w-full h-full overflow-y-auto py-4 px-2 sm:px-4 pb-[2rem]">
        <div className="flex items-center justify-between flex-wrap gap-5">
          <div className="relative flex items-center gap-4">
            <span
              onClick={() => navigate("/tickets")}
              className="rounded-full p-1 bg-gray-100 hover:bg-orange-500 hover:text-white transition-all duration-300"
            >
              <IoArrowBackOutline className="h-5 w-5 cursor-pointer" />
            </span>
            <div className="relative">
              <span className="absolute top-[.6rem] left-2 z-10">
                <IoSearch className="h-5 w-5 text-orange-500" />
              </span>
              <input
                type="search"
                className="w-[15rem] sm:w-[23rem] h-[2.5rem] rounded-[2rem] border-2 border-gray-600 focus:border-orange-500 pl-[2rem] px-4 outline-none cursor-pointer"
              />
            </div>
          </div>
          <div className="">
            <select
              className={`${style.input}`}
              value={selectedCompany}
              required
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{ width: "19rem" }}
            >
              <option>Select Company</option>
              <option value="Affotax">Affotax-info@affotax.com</option>
              <option value="Outsource">
                Outsource-admin@outsourceaccountings.co.uk
              </option>
            </select>
          </div>
        </div>

        <hr className="w-full bg-gray-300 mt-[1rem] mb-[1rem]" />

        <div className="relative flex flex-col gap-4">
          {loading ? (
            <Loader />
          ) : (
            <div className="flex flex-col gap-2">
              {inboxData?.map((email, i) => (
                <div
                  className="w-full flex items-center justify-between py-2 px-4 rounded-md hover:shadow-md cursor-pointer bg-gray-100 border border-gray-200 hover:border-orange-200 hover:bg-orange-100 transition-all duration-300"
                  key={i}
                >
                  {startIndex + i + 1}. {email.subject || "No Subject"}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={startIndex === 0}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
            >
              Previous
            </button>

            <span>
              Showing {startIndex + 1} -{" "}
              {Math.min(startIndex + pageSize, totalEmails)} of {totalEmails}{" "}
              emails
            </span>

            <button
              onClick={handleNextPage}
              disabled={startIndex + pageSize >= totalEmails}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
