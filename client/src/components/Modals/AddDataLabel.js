import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { TbLoader2 } from "react-icons/tb";
import { style } from "../../utlis/CommonStyle";
import { MdOutlineModeEditOutline } from "react-icons/md";

export default function AddDataLabel({ setShowDataLable, getDatalable }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#fff");
  const [loading, setLoading] = useState(false);
  const [labelData, setLabelData] = useState([]);
  const [labelId, setlabelId] = useState("");
  console.log("labelData", labelData);

  //   Get All Labels
  const getlabel = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/label/data/labels`
      );
      if (data) {
        setLabelData(data.labels);
        getDatalable();
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
  const handelAddlabel = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      if (labelId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/label/update/label/${labelId}`,
          { name, color }
        );
        if (data) {
          getlabel();
          setlabelId("");
          toast.success("Data label updated!");
          setName("");
          setColor("#40E0D0");
          setLoading(false);
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/label/create/label`,
          { name, color, type: "data" }
        );
        if (data.success) {
          getlabel();
          setLoading(false);
          setName("");
          setColor("#40E0D0");
          setlabelId("");
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };

  //   Delete label
  const removelabel = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/label/delete/label/${id}`
      );
      if (data.success) {
        getlabel();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in delete label!");
    }
  };

  return (
    <div className="flex flex-col w-[21rem] sm:w-[38rem] bg-white shadow-md rounded-md">
      <div className="flex items-center justify-between py-4 px-3 sm:px-4 border-b border-gray-300">
        <h1 className="text-xl font-semibold">Manage Data Label</h1>
        <span
          onClick={() => {
            setShowDataLable(false);
          }}
        >
          <IoClose className="h-6 w-6 cursor-pointer" />
        </span>
      </div>
      {/*  */}
      <form onSubmit={handelAddlabel} className="  py-4 px-3 sm:px-4 mt-3">
        <div className="w-full border rounded-md py-2 px-2">
          <div className="flex flex-wrap gap-3 w-full items-center justify-center">
            <span
              className={`w-6 h-6 rounded-md hover:rounded-2xl border border-gray-300 transition-all duration-700 ${
                color === "#fff" && "w-[3rem]  rounded-2xl"
              }  bg-[#fff] cursor-pointer hover:shadow-md`}
              onClick={() => {
                setColor("#fff");
              }}
            ></span>
            <span
              className={`w-6 h-6 rounded-md    hover:rounded-2xl transition-all duration-700 ${
                color === "#40E0D0" && "w-[3rem]  rounded-2xl"
              }  bg-[#40E0D0] cursor-pointer hover:shadow-md`}
              onClick={() => {
                setColor("#40E0D0");
              }}
            ></span>
            <span
              className={`w-6 h-6 rounded-md   hover:rounded-2xl transition-all duration-700 bg-[#e0a840] cursor-pointer hover:shadow-md ${
                color === "#e0a840" && "w-[3rem]  rounded-2xl"
              } `}
              onClick={() => {
                setColor("#e0a840");
              }}
            ></span>
            <span
              className={` w-6 h-6 rounded-md   hover:rounded-2xl transition-all duration-700 bg-[#40e07b] cursor-pointer hover:shadow-md ${
                color === "#40e07b" && "w-[3rem]  rounded-2xl"
              } `}
              onClick={() => {
                setColor("#40e07b");
              }}
            ></span>
            <span
              className={`w-6 h-6 rounded-md   hover:rounded-2xl transition-all duration-700 bg-[#cde040] cursor-pointer hover:shadow-md ${
                color === "#cde040" && "w-[3rem]  rounded-2xl"
              } `}
              onClick={() => {
                setColor("#cde040");
              }}
            ></span>
            <span
              className={`w-6 h-6 rounded-md   hover:rounded-2xl transition-all duration-700 bg-[#9840e0] cursor-pointer hover:shadow-md ${
                color === "#9840e0" && "w-[3rem]  rounded-2xl"
              } `}
              onClick={() => {
                setColor("#9840e0");
              }}
            ></span>
            <span
              className={`w-6 h-6 rounded-md   hover:rounded-2xl transition-all duration-700 bg-[#e040d0] cursor-pointer hover:shadow-md ${
                color === "#e040d0" && "w-[3rem]  rounded-2xl"
              } `}
              onClick={() => {
                setColor("#e040d0");
              }}
            ></span>
            <span
              className={`w-6 h-6 rounded-md   hover:rounded-2xl transition-all duration-700 bg-[#4065e0] cursor-pointer hover:shadow-md ${
                color === "#4065e0" && "w-[3rem]  rounded-2xl"
              } `}
              onClick={() => {
                setColor("#4065e0");
              }}
            ></span>
            <span
              className={`w-6 h-6 rounded-md   hover:rounded-2xl transition-all duration-700 bg-[#7ddd53] cursor-pointer hover:shadow-md ${
                color === "#7ddd53" && "w-[3rem]  rounded-2xl"
              } `}
              onClick={() => {
                setColor("#7ddd53");
              }}
            ></span>
            <span
              className={`w-6 h-6 rounded-md   hover:rounded-2xl transition-all duration-700 bg-[#7dcea0] cursor-pointer hover:shadow-md ${
                color === "#7dcea0" && "w-[3rem]  rounded-2xl"
              } `}
              onClick={() => {
                setColor("#7dcea0");
              }}
            ></span>
            <span
              className={`w-6 h-6 rounded-md   hover:rounded-2xl transition-all duration-700 bg-[#6c6c6d] cursor-pointer hover:shadow-md ${
                color === "#6c6c6d" && "w-[3rem]  rounded-2xl"
              } `}
              onClick={() => {
                setColor("#6c6c6d");
              }}
            ></span>
            <span
              className={`w-6 h-6 rounded-md hover:rounded-2xl transition-all duration-700 bg-[#f3403d] cursor-pointer hover:shadow-md ${
                color === "#f3403d" && "w-[3rem]  rounded-2xl"
              } `}
              onClick={() => {
                setColor("#f3403d");
              }}
            ></span>
          </div>
          {/*  */}
          <div className=" flex gap-1 w-full h-[3rem] p-1 border rounded-md my-4 ">
            <input
              type="text"
              placeholder="Label..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-full border-none outline-none bg-transparent px-3"
            />
            <button
              className={`${style.button1} text-[15px] ${
                !name && "cursor-no-drop"
              } `}
              disabled={!name}
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
          {/*  */}
          {labelData.length > 0 && (
            <div className="flex flex-wrap gap-4 w-full  p-3 border rounded-md mb-2">
              {labelData &&
                labelData?.map((item) => (
                  <div
                    className={`label relative py-[2px] px-2 rounded-md hover:shadow  cursor-pointer  ${
                      item.color === "#fff" ? "text-gray-950" : "text-white"
                    }`}
                    style={{ background: `${item.color}` }}
                  >
                    <span>{item?.name}</span>
                    <span
                      onClick={() => removelabel(item._id)}
                      className=" delete w-[1.2rem] h-[1.2rem] flex items-center justify-center absolute  top-[-.7rem] right-[-.7rem] bg-gray-500/50 border rounded-full p-[3px] cursor-pointer z-[10]"
                    >
                      <IoClose className="h-4 w-4 cursor-pointer" />
                    </span>
                    <span
                      onClick={() => {
                        setlabelId(item._id);
                        setName(item?.name);
                        setColor(item?.color);
                      }}
                      className=" delete w-[1.2rem] h-[1.2rem] flex items-center justify-center absolute  top-[-.7rem] right-[1rem] bg-gray-500/50 border rounded-full p-[3px] cursor-pointer z-[10]"
                    >
                      <MdOutlineModeEditOutline className="h-5 w-5 cursor-pointer text-sky-600" />
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
