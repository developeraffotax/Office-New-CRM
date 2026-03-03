import { IoClose, IoTicketOutline } from "react-icons/io5";
import { style } from "../../../utlis/CommonStyle";
import QuickAccess from "../../../utlis/QuickAccess";
import { isAdmin } from "../../../utlis/isAdmin";
import OverviewForPages from "../../../utlis/overview/OverviewForPages";

const Header = ({
  auth,
  handleClearFilters,
  setShowSendModal,
  handleCreateLead,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-5">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
          Leads
        </h1>

        {
          <span
            className={`p-1 rounded-full hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-r from-orange-500 to-yellow-600 cursor-pointer border border-transparent hover:border-blue-400 mb-1 hover:rotate-180 `}
            onClick={() => {
              handleClearFilters();
            }}
            title="Clear filters"
          >
            <IoClose className="h-6 w-6 text-white" />
          </span>
        }
        <QuickAccess />
        {isAdmin(auth) && (
          <span className=" ">
            {" "}
            <OverviewForPages />{" "}
          </span>
        )}
      </div>

      {/* ---------Template Buttons */}
      <div className="flex items-center gap-4">
        <button
          className={`${style.button1} text-[15px] flex items-center gap-1`}
          onClick={() => setShowSendModal(true)}
          style={{ padding: ".4rem 1rem" }}
        >
          <span className="text-xl ">
            <IoTicketOutline />
          </span>{" "}
          New Ticket
        </button>

        <button
          className={`${style.button1} text-[15px] `}
          onClick={() => handleCreateLead()}
          style={{ padding: ".4rem 1rem" }}
        >
          New Lead
        </button>
      </div>
    </div>
  );
};

export default Header;
