import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { TbLoader2 } from "react-icons/tb";
import { style } from "../../utlis/CommonStyle";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function HandleQualityModal({ setShowQuickList, getQuickList }) {
  const [task, setTask] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [qualityData, setQualityData] = useState([]);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState("");
  const types = [
    "Bookkeeping",
    "Payroll",
    "Vat Return",
    "Personal Tax",
    "Accounts",
    "Company Sec",
    "Address",
  ];
  console.log("qualityData", qualityData);

  //   Get All Labels
  const getlabel = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/quicklist/get/all`
      );
      if (data) {
        console.log("data", data);
        setQualityData(data.qualityChecks);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getlabel();

    // eslint-disable-next-line
  }, []);

  // Add Label
  const handelAddQuality = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/quicklist/create/quality`,
        { task, type }
      );
      if (data.success) {
        getlabel();
        getQuickList();
        setLoading(false);
        setTask("");
        setType("");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };

  //   Delete label
  const removeQuality = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/quicklist/delete/${id}`
      );
      if (data.success) {
        getlabel();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in delete label!");
    }
  };

  const groupedData = qualityData?.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  console.log("groupedData", groupedData);

  return (
    <div className="flex flex-col w-[21rem] sm:w-[38rem] bg-white shadow-md rounded-md ">
      <div className="flex items-center justify-between py-4 px-3 sm:px-4 border-b border-gray-300">
        <h1 className="text-xl font-semibold">Manage Quality List</h1>
        <span
          onClick={() => {
            setShowQuickList(false);
          }}
        >
          <IoClose className="h-6 w-6 cursor-pointer" />
        </span>
      </div>
      {/*  */}
      <form onSubmit={handelAddQuality} className="py-4 px-3 sm:px-4 mt-3">
        <div className="w-full border rounded-md py-2 px-2 ">
          <div className=" flex flex-col gap-2 w-full h-[2.4rem] p-1 border rounded-md my-4 ">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-full border-none outline-none bg-transparent px-3"
            >
              <option value="">Select Type</option>
              {types?.map((item, i) => (
                <option key={i} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className=" flex flex-col gap-2 w-full h-[2.4rem] p-1 border rounded-md my-4 ">
            <input
              type="text"
              placeholder="Quality task..."
              value={task}
              required
              onChange={(e) => setTask(e.target.value)}
              className="w-full h-full border-none outline-none bg-transparent px-3"
            />
          </div>

          <div className="flex items-center justify-end w-full">
            <button
              className={`${style.button1} text-[15px] ${
                !task && "cursor-no-drop"
              } `}
              disabled={!task}
              type="submit"
              style={{ padding: ".4rem 1rem" }}
            >
              {loading ? (
                <TbLoader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      </form>
      {/*  */}
      <div className="w-full max-h-[35rem] mt-2 overflow-y-auto">
        {Object.keys(groupedData).length > 0 && (
          <div className="flex flex-col gap-4 w-full p-3 border mb-2">
            {Object.entries(groupedData).map(([type, items]) => (
              <div key={type} className="flex flex-col gap-2">
                <div
                  onClick={() => setShow(!show)}
                  className="flex items-center justify-between border"
                >
                  <h3 className="text-lg font-semibold text-gray-700">
                    {type}
                  </h3>
                  <span
                    onClick={() => {
                      setSelected(type);
                      setShow(!show);
                    }}
                    className="cursor-pointer p-1 rounded-full hover:bg-gray-200 bg-gray-100"
                  >
                    {show && selected === type ? (
                      <FaChevronUp className="h-5 w-5" />
                    ) : (
                      <FaChevronDown className="h-5 w-5" />
                    )}
                  </span>
                </div>
                {show && selected === type && (
                  <div className="w-full flex flex-col gap-2">
                    {items.map((item) => (
                      <div
                        key={item?._id}
                        className="flex items-center justify-between gap-2 relative py-[2px] px-2 rounded-md hover:shadow cursor-pointer bg-white border border-gray-300"
                      >
                        <span className="text-[14px] text-gray-800">
                          {item?.task}
                        </span>
                        <span
                          onClick={() => removeQuality(item?._id)}
                          className="w-[1.5rem] h-[1.5rem] flex items-center justify-center bg-gray-500/50 border rounded-full p-[3px] cursor-pointer z-[10]"
                        >
                          <IoClose className="h-5 w-5 cursor-pointer text-black" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {/* {qualityData.length > 0 && (
          <div className="flex flex-col gap-2 w-full  p-3 border rounded-md mb-2">
            {qualityData &&
              qualityData?.map((item) => (
                <div
                  className={` flex items-center  justify-between gap-2 relative py-[2px] px-2 rounded-md hover:shadow  cursor-pointer  bg-white border border-gray-300`}
                >
                  <span className="tet-[14px] text-gray-800">{item?.task}</span>
                  <span
                    onClick={() => removeQuality(item._id)}
                    className=" w-[1.5rem] h-[1.5rem] flex items-center justify-center bg-gray-500/50 border rounded-full p-[3px] cursor-pointer z-[10]"
                  >
                    <IoClose className="h-5 w-5 cursor-pointer text-black" />
                  </span>
                </div>
              ))}
          </div>
        )} */}
      </div>
    </div>
  );
}
