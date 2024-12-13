import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function HandleHRModal({
  setShowAddTask,
  taskId,
  setTaskId,
  users,
  getAllTasks,
}) {
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [software, setSoftware] = useState("");
  const [description, setDescription] = useState("");
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const departments = [];

  //---------- Get Single Project-----------
  const getSingleTemplate = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/hr/remove/task/${taskId}`
      );
      setSoftware(data?.template?.software);
      setDepartment(data?.template?.department);
      setCategory(data?.template?.category);
      setDescription(data?.template?.description);
      setUserList(data?.template?.userList);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSingleTemplate();
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
          { software, department, description, category, users: userList }
        );
        if (data?.success) {
          setLoading(false);
          getAllTasks();
          setTaskId("");
          setSoftware("");
          setDepartment("");
          setDescription("");
          setCategory("");
          setUserList([]);
          setShowAddTask(false);
          toast.success("HR tasks updated!");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/hr/create/task`,
          { software, department, description, category, users: userList }
        );
        if (data) {
          getAllTasks();
          setLoading(false);
          toast.success("HR task created successfully!");
          setShowAddTask(false);
          setSoftware("");
          setDepartment("");
          setDescription("");
          setCategory("");
          setUserList([]);
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };

  //   Add Users
  const handleAddUser = (user) => {
    if (!Array.isArray(userList)) {
      setUserList([user]);
      return;
    }

    if (userList.some((existingUser) => existingUser._id === user._id)) {
      return toast.error("User already exists!");
    }
    setUserList([...userList, user]);
  };

  //   Remove user
  const handleRemoveUser = (id) => {
    const newUsers = userList.filter((user) => user._id !== id);

    setUserList(newUsers);
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
        <form onSubmit={handleTemplate} className="w-full flex flex-col gap-4 ">
          <select
            value={department}
            className={`${style.input}`}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option>Select Department</option>
            {departments &&
              departments?.map((dep, i) => (
                <option
                  key={i}
                  value={dep}
                  className=" flex items-center gap-1"
                >
                  {dep}
                </option>
              ))}
          </select>
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

          {/* ------------- */}
          {userList?.length > 0 && (
            <div className="w-full flex items-center gap-4 flex-wrap border py-2 px-2 rounded-md border-gray-400">
              {userList &&
                userList.map((user) => (
                  <div
                    key={user?._id}
                    className="flex items-center gap-3 bg py-1 px-2 rounded-md text-white bg-purple-600"
                  >
                    <span className="text-white text-[15px]">{user?.name}</span>
                    <span
                      className="cursor-pointer bg-red-500/50 p-[2px] rounded-full hover:bg-red-500"
                      onClick={() => handleRemoveUser(user?._id)}
                    >
                      <IoClose className="h-4 w-4 " />
                    </span>
                  </div>
                ))}
            </div>
          )}
          <select
            value=""
            className={`${style.input}`}
            onChange={(e) => handleAddUser(JSON.parse(e.target.value))}
          >
            <option>Select User</option>
            {users &&
              users?.map((user) => (
                <option
                  key={user._id}
                  value={JSON.stringify({
                    _id: user._id,
                    name: user.name,
                  })}
                  className=" flex items-center gap-1"
                >
                  {user?.name}
                </option>
              ))}
          </select>
          {/*  */}

          {/*  */}
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
      </div>
    </div>
  );
}
