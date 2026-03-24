import React from "react";
import { TbLoader2 } from "react-icons/tb";
import { style } from "../../../utlis/CommonStyle";
//CONSTANTS
import {
  DEPARTMENTS,
  SOURCES,
  BRANDS,
  LEAD_SOURCES,
  LEAD_STAGES,
} from "../constants/dropdownOptions";

const BulkLeadEditForm = ({
  updates,
  isUpdating,
  onChange,
  onSubmit,
  users = [],
  statuses = [],
}) => {
  return (
    <div className="w-full  p-4 ">
      <form
        onSubmit={onSubmit}
        className="w-full grid grid-cols-12 gap-4 max-2xl:grid-cols-8  "
      >
        <div className="inputBox w-full">
          <input
            name="companyName"
            type="text"
            value={updates.companyName || ""}
            onChange={onChange}
            className={`${style.input} w-full `}
            // placeholder="Company Name"
          />
          <span>Company Name</span>
        </div>

        <div className="inputBox w-full">
          <input
            name="clientName"
            type="text"
            value={updates.clientName || ""}
            onChange={onChange}
            className={`${style.input} w-full `}
          />
          <span>Client Name</span>
        </div>

        <div className="w-full">
          <select
            name="jobHolder"
            value={updates.jobHolder || ""}
            onChange={onChange}
            className={`${style.input} w-full`}
          >
            <option value="empty">Job Holder</option>
            {users.map((jobHold, i) => (
              <option value={jobHold.name} key={i}>
                {jobHold.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <select
            name="department"
            value={updates.department || ""}
            onChange={onChange}
            className={`${style.input} w-full`}
          >
            <option value="empty">Department</option>
            {DEPARTMENTS.map((department, i) => (
              <option value={department} key={i}>
                {department}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <select
            name="source"
            value={updates.source || ""}
            onChange={onChange}
            className={`${style.input} w-full`}
          >
            <option value="empty">Source</option>
            {SOURCES.map((source, i) => (
              <option value={source} key={i}>
                {source}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <select
            name="brand"
            value={updates.brand || ""}
            onChange={onChange}
            className={`${style.input} w-full`}
          >
            <option value="empty">Brand</option>
            {BRANDS.map((brand, i) => (
              <option value={brand} key={i}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div className="inputBox w-full">
          <input
            name="value"
            type="text"
            value={updates.value || ""}
            onChange={onChange}
            className={`${style.input} w-full `}
          />
          <span>Value</span>
        </div>

        <div className="inputBox w-full">
          <input
            name="number"
            type="text"
            value={updates.number || ""}
            onChange={onChange}
            className={`${style.input} w-full `}
          />
          <span>Number</span>
        </div>

        <div className="w-full">
          <select
            name="lead_Source"
            value={updates.lead_Source || ""}
            onChange={onChange}
            className={`${style.input} w-full`}
          >
            <option value="empty">Lead Source</option>
            {LEAD_SOURCES.map((el, i) => (
              <option value={el} key={i}>
                {el}
              </option>
            ))}
          </select>
        </div>

        <div className="inputBox">
          <input
            type="date"
            name="followUpDate"
            value={updates.followUpDate || ""}
            onChange={onChange}
            className={`${style.input} w-full `}
          />
          <span>Follow-Up Deadline</span>
        </div>

        <div className="inputBox">
          <input
            type="date"
            name="JobDate"
            value={updates.JobDate || ""}
            onChange={onChange}
            className={`${style.input} w-full `}
          />
          <span>Job Date</span>
        </div>

        <div className="">
          <select
            name="stage"
            value={updates.stage || ""}
            onChange={onChange}
            className={`${style.input} w-full`}
          >
            <option value="empty">Stage</option>
            {LEAD_STAGES.map((el, i) => (
              <option value={el} key={i}>
                {el}
              </option>
            ))}
          </select>
        </div>

        <div className="">
          <select
            name="status"
            value={updates.status || ""}
            onChange={onChange}
            className={`${style.input} w-full`}
          >
            <option value="empty">Status</option>
            {(statuses.length ? statuses : ["progress", "won", "lost"]).map(
              (el, i) => (
                <option value={el} key={i}>
                  {el}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="inputBox w-full col-span-2">
          <input
            name="Note"
            type="text"
            value={updates.Note || ""}
            onChange={onChange}
            className={`${style.input} w-full `}
          />
          <span>Note</span>
        </div>

        <div className="w-full flex items-center justify-end  ">
          <button
            className={`${style.button1} text-[15px] w-full `}
            type="submit"
            disabled={isUpdating}
            style={{ padding: ".5rem  " }}
          >
            {isUpdating ? (
              <TbLoader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </form>
      <hr className="mb-1 bg-gray-300 w-full h-[1px] mt-4" />
    </div>
  );
};

export default BulkLeadEditForm;
