import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";
import axios from "axios";

export default function AddProjectModal({
  users,
  setOpenAddProject,
  getAllProjects,
  projectId,
  setProjectId,
}) {
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [usersList, setUserList] = useState([]);

  //---------- Get Single Project-----------
  const getSingleProject = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/projects/get_single/project/${projectId}`
      );
      console.log("Project Data:", data);
      setProjectName(data?.project?.projectName);
      setUserList(data?.project?.users_list);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSingleProject();
    // eslint-disable-next-line
  }, [projectId]);

  // -----------Create / Update Task-------->
  const handleProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (projectId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/projects/update/project/${projectId}`,
          { projectName, users_list: usersList }
        );
        if (data?.success) {
          setLoading(false);
          setProjectId("");
          getAllProjects();
          setProjectName("");
          setUserList([]);
          setOpenAddProject(false);
          toast.success("Project Updated!");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/projects/create/project`,
          { projectName, users_list: usersList }
        );
        if (data?.success) {
          setLoading(false);
          getAllProjects();
          setProjectName("");
          setUserList([]);
          setOpenAddProject(false);
          toast.success("Project Created successfully!");
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
    if (!Array.isArray(usersList)) {
      setUserList([user]);
      return;
    }

    if (usersList.some((existingUser) => existingUser._id === user._id)) {
      return toast.error("User already exists!");
    }
    setUserList([...usersList, user]);
  };

  //   Remove user

  const handleRemoveUser = (id) => {
    const newUsers = usersList.filter((user) => user._id !== id);

    setUserList(newUsers);
  };
  return (
    <div className="w-[21rem] sm:w-[34rem] rounded-md shadow border flex flex-col gap-4 bg-white">
      <div className="flex items-center justify-between px-4 pt-2">
        <h1 className="text-[20px] font-semibold text-black">
          {projectId ? "Update Project" : "Add Project"}
        </h1>
        <span
          className=" cursor-pointer"
          onClick={() => {
            setProjectId("");
            setOpenAddProject(false);
          }}
        >
          <IoClose className="h-6 w-6 " />
        </span>
      </div>
      <hr className="h-[1px] w-full bg-gray-400 " />
      <div className="w-full py-2 px-4">
        <form onSubmit={handleProject} className="w-full flex flex-col gap-4 ">
          <input
            type="text"
            placeholder="Project Name"
            required
            className={`${style.input} w-full`}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          {usersList?.length > 0 && (
            <div className="w-full flex items-center gap-4 flex-wrap border py-2 px-2 rounded-md border-gray-400">
              {usersList &&
                usersList.map((user) => (
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
                    profileImage: user.avatar,
                    role: user.role,
                  })}
                  className=" flex items-center gap-1"
                >
                  {user?.name}
                </option>
              ))}
          </select>
          <div className="flex items-center justify-end">
            <button
              className={`${style.button1} text-[15px] `}
              type="submit"
              style={{ padding: ".4rem 1rem" }}
            >
              {loading ? (
                <TbLoader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span>{projectId ? "Update" : "Create"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
