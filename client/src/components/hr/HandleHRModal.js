import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Loader from "../../utlis/Loader";

export default function HandleHRModal({
  setShowAddTask,
  taskId,
  setTaskId,
  getAllTasks,
  deparmentsData,
  hrRoleData,
  users,
}) {
  const [department, setDepartment] = useState("");
  const [hrRole, setHrRole] = useState("");
  const [category, setCategory] = useState("");
  const [software, setSoftware] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");

  //---------- Get Single Project-----------
  const getSingleTask = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/hr/task/detail/${taskId}`
      );

      setSoftware(data?.task?.software);
      setDepartment(data?.task?.department?._id);
      setHrRole(data?.task?.hrRole?._id);
      setCategory(data?.task?.category);
      setDescription(data?.task?.description);
      setTitle(data?.task?.title);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSingleTask();
    // eslint-disable-next-line
  }, [taskId]);

  // -----------Create / Update Template-------->
  const handleTemplate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (taskId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/hr/edit/task/${taskId}`,
          { software, department, description, category, title, hrRole }
        );
        if (data?.success) {
          setLoading(false);
          getAllTasks();
          setTaskId("");
          setSoftware("");
          setDepartment("");
          setHrRole("");
          setDescription("");
          setCategory("");
          setTitle("");
          setShowAddTask(false);
          toast.success("HR tasks updated!");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/hr/create/task`,
          { software, department, description, category, title, hrRole }
        );
        if (data) {
          getAllTasks();
          setLoading(false);
          toast.success("HR task created successfully!");
          setShowAddTask(false);
          setSoftware("");
          setDepartment("");
          setHrRole("");
          setDescription("");
          setCategory("");
          setTitle("");
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  return (
    <div className="w-full rounded-md shadow border flex flex-col gap-4 bg-white">
      <div className="flex items-center justify-between px-4 pt-2">
        <h1 className="text-[20px] font-semibold text-black">
          {taskId ? "Update HR Task" : "Add HR Task"}
        </h1>
        <span
          className=" cursor-pointer"
          onClick={() => {
            setTaskId("");
            setShowAddTask(false);
          }}
        >
          <IoClose className="h-6 w-6 " />
        </span>
      </div>
      <hr className="h-[1px] w-full bg-gray-400 " />
      <div className="w-full py-2 px-4">
        {isLoading ? (
          <Loader />
        ) : (
          <form
            onSubmit={handleTemplate}
            className="w-full flex flex-col gap-4 "
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                required
                className={`${style.input} w-full`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <select
                value={department}
                className={`${style.input}`}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option>Select Department</option>
                {deparmentsData &&
                  deparmentsData?.map((dep, i) => (
                    <option
                      key={dep._id}
                      value={dep._id}
                      className=" flex items-center gap-1"
                    >
                      {dep?.departmentName}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Category"
                required
                className={`${style.input} w-full`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <input
                type="text"
                placeholder="Software"
                required
                className={`${style.input} w-full`}
                value={software}
                onChange={(e) => setSoftware(e.target.value)}
              />
            </div>




            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               
              <select
                value={hrRole}
                className={`${style.input}`}
                onChange={(e) => setHrRole(e.target.value)}
              >
                <option>Select Role</option>
                {hrRoleData &&
                  hrRoleData?.map((role, i) => (
                    <option
                      key={role._id}
                      value={role._id}
                      className=" flex items-center gap-1"
                    >
                      {role?.roleName}
                    </option>
                  ))}
              </select>
            </div>





            {/*------------ Desciption----------- */}
            <ReactQuill
              theme="snow"
              modules={modules}
              formats={formats}
              className="rounded-md relative min-h-[11rem] max-[28rem] h-[12rem] 2xl:h-[22rem]"
              value={description}
              onChange={setDescription}
            />
            {/*  */}
            <div className="flex items-center justify-end mt-[2.5rem]">
              <button
                disabled={loading}
                className={`${style.button1} text-[15px] `}
                type="submit"
                style={{ padding: ".4rem 1rem" }}
              >
                {loading ? (
                  <TbLoader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <span>{taskId ? "Update" : "Create"}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
