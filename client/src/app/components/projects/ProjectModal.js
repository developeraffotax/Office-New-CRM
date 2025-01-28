import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import toast from "react-hot-toast";
import axios from "axios";
import { FaSpinner } from "react-icons/fa6";
import { Style } from "@/app/utils/CommonStyling";
import { IoIosClose } from "react-icons/io";
import Image from "next/image";
import { IoCameraOutline } from "react-icons/io5";

const types = [
  "End User",
  "Dealer",
  "Builder",
  "Owners",
  "Designers",
  "Constructors",
];

export default function ProjectModal({
  setShowAdd,
  projectId,
  setprojectId,
  fetchProjects,
}) {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [dealer_quoted_price, setDealer_quoted_price] = useState("");
  const [price_difference, setPrice_difference] = useState("");
  const [variance_budget, setVariance_budget] = useState("");
  const [quality, setQuality] = useState("");
  const [total_area, setTotal_area] = useState("");
  const [sum_area, setSum_area] = useState("");
  const [loading, setLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  // Get Project Details
  const getProjectDetails = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/project/project/${projectId}`
      );

      if (data) {
        setName(data.project.name);
        setBudget(data.project.budget);
        setTotalPrice(data.project.totalPrice);
        setDealer_quoted_price(data.project.dealer_quoted_price);
        setPrice_difference(data.project.price_difference);
        setVariance_budget(data.project.variance_budget);
        setQuality(data.project.quality);
        setTotal_area(data.project.total_area);
        setSum_area(data.project.sum_area);
        setThumbnails(
          data.project.thumbnails && Array.isArray(data.project.thumbnails)
            ? data.project.thumbnails
            : ["No Thumbnails"]
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProjectDetails();
  }, [projectId]);

  // Handle Media Upload
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    setThumbnails((prevMedia) => [...prevMedia, ...files]);
  };

  // Handle Media Removal
  const removeMedia = (indexToRemove) => {
    setThumbnails((prevMedia) => {
      const removedItem = prevMedia[indexToRemove];
      if (typeof removedItem === "string") {
        setDeletedImages((prevDeleted) => [...prevDeleted, removedItem]);
      }
      return prevMedia.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const projectData = new FormData();
      projectData.append("name", name);
      projectData.append("budget", budget);
      projectData.append("totalPrice", totalPrice);
      projectData.append("dealer_quoted_price", dealer_quoted_price);
      projectData.append("price_difference", price_difference);
      projectData.append("variance_budget", variance_budget);
      projectData.append("quality", quality);
      projectData.append("sum_area", sum_area);
      projectData.append("total_area", total_area);
      thumbnails.forEach((file) => projectData.append("file", file));
      projectData.append("deletedImages", JSON.stringify(deletedImages));

      if (projectId) {
        const { data } = await axios.put(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/project/update/${projectId}`,
          projectData
        );
        if (data) {
          fetchProjects();
          toast.success("Project updated successfully!");
          setShowAdd(false);
          setName("");
          setBudget(""),
            setTotalPrice(""),
            setDealer_quoted_price(""),
            setPrice_difference(""),
            setVariance_budget(""),
            setQuality(""),
            setTotal_area(""),
            setSum_area("");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/project/create`,
          projectData
        );

        if (data) {
          fetchProjects();
          toast.success("Project added successfully!");
          setShowAdd(false);
          setName("");
          setBudget(""),
            setTotalPrice(""),
            setDealer_quoted_price(""),
            setPrice_difference(""),
            setVariance_budget(""),
            setQuality(""),
            setTotal_area(""),
            setSum_area("");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
      setprojectId("");
    }
  };
  return (
    <div className="w-full bg-white rounded-md overflow-hidden  overflow-y-auto shadow min-h-[15rem] max-h-[99vh] shidden flex flex-col">
      <div className="flex items-center justify-between bg-customBrown px-4 py-2 sm:py-3 ">
        <h3 className="text-lg font-medium text-white">
          {projectId ? "Edit Project" : "Add Project"}
        </h3>
        <span
          onClick={() => {
            setprojectId("");
            setShowAdd(false);
          }}
          className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer "
        >
          <CgClose className="text-[18px]" />
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 px-4 py-2 mt-4 h-full w-full "
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* --------------Add Media -------------------*/}
          <div className="border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center rounded-md">
            <label className="cursor-pointer flex flex-col items-center">
              <span>
                <IoCameraOutline className="text-[35px] text-sky-700 hover:text-sky-700" />
              </span>
              <span className="text-sky-800 px-4 py-[.3rem] text-[13px] font-normal rounded-sm text-sm border-2 border-sky-700  hover:bg-sky-700 hover:text-white transition-all duration-300 hover:shadow-md">
                Add Media
              </span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleMediaUpload}
              />
            </label>
          </div>
          {thumbnails && (
            <div className="flex mt-4 gap-2 flex-wrap">
              {thumbnails?.map((file, index) => (
                <div
                  key={index}
                  className="relative w-[3.9rem] h-[3.2rem] bg-gray-200 flex items-center justify-center rounded-md "
                >
                  <div className="w-[3.5rem] h-[2.8rem] relative rounded-md overflow-hidden flex items-center justify-center">
                    <Image
                      src={
                        file instanceof File ? URL.createObjectURL(file) : file
                      }
                      layout="fill"
                      alt={"Thumnail"}
                      className="w-full h-full"
                    />
                  </div>

                  <span
                    onClick={() => removeMedia(index)}
                    className="absolute top-[-.4rem] right-[-.4rem] z-10 bg-red-600 text-white text-xs rounded-full cursor-pointer"
                  >
                    <IoIosClose className="text-[20px]" />
                  </span>
                </div>
              ))}
            </div>
          )}
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              Name<span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${Style.input} w-full`}
              placeholder="Full Name"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              Budget<span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={`${Style.input} w-full`}
              placeholder="100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              Total Price<span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              className={`${Style.input} w-full`}
              placeholder="150"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              Dealer Quoted Price<span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={dealer_quoted_price}
              onChange={(e) => setDealer_quoted_price(e.target.value)}
              className={`${Style.input} w-full`}
              placeholder="150"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              Price Difference<span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={price_difference}
              onChange={(e) => setPrice_difference(e.target.value)}
              className={`${Style.input} w-full`}
              placeholder="50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              Variance Budget
            </label>
            <input
              type="text"
              value={variance_budget}
              onChange={(e) => setVariance_budget(e.target.value)}
              className={`${Style.input} w-full`}
              placeholder="50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              Quality
            </label>
            <input
              type="text"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className={`${Style.input} w-full`}
              placeholder="New"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              Total Area
            </label>
            <input
              type="text"
              value={total_area}
              onChange={(e) => setTotal_area(e.target.value)}
              className={`${Style.input} w-full`}
              placeholder="40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700">
              Sum Area
            </label>
            <input
              type="text"
              value={sum_area}
              onChange={(e) => setSum_area(e.target.value)}
              className={`${Style.input} w-full`}
              placeholder="80"
            />
          </div>
        </div>
        <div className="flex items-center justify-end w-full pb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setprojectId("");
                setShowAdd(false);
              }}
              type="button"
              className="w-[6rem] py-[.3rem] text-[14px] rounded-sm border-2 border-red-600 text-red-700 hover:bg-gray-100 hover:shadow-md hover:scale-[1.03] transition-all duration-300 "
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="w-[6rem] py-[.4rem] text-[14px] flex items-center justify-center rounded-sm bg-customBrown hover:shadow-md hover:scale-[1.03] transition-all duration-300 text-white"
            >
              {loading ? (
                <span>
                  <FaSpinner className="h-5 w-5 text-white animate-spin" />
                </span>
              ) : (
                <span>{projectId ? "Save" : "SUBMIT"}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
