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
  departments = [],
  getTasks1,
}) {
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [usersList, setUserList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]); // ✅ array of IDs

  //---------- Get Single Project-----------
  const getSingleProject = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/projects/get_single/project/${projectId}`
      );

      setProjectName(data?.project?.projectName || "");
      setUserList(data?.project?.users_list || []);
      setDepartmentsList(data?.project?.departments || []); // ✅ IDs only
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (projectId) getSingleProject();
    // eslint-disable-next-line
  }, [projectId]);

  // -----------Create / Update Project--------->
  const handleProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        projectName,
        users_list: usersList,
        departments: departmentsList, // ✅ send IDs only
      };

      if (projectId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/projects/update/project/${projectId}`,
          payload
        );
        if (data?.success) {
          toast.success("Project Updated!");
          setProjectId("");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/projects/create/project`,
          payload
        );
        if (data?.success) {
          toast.success("Project Created successfully!");
        }
      }

      setLoading(false);
      getAllProjects();
      getTasks1();
      setProjectName("");
      setUserList([]);
      setDepartmentsList([]);
      setOpenAddProject(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message || "Error saving project!");
    }
  };

  //   Add User
  const handleAddUser = (user) => {
    if (usersList.some((existingUser) => existingUser._id === user._id)) {
      return toast.error("User already exists!");
    }
    setUserList([...usersList, user]);
  };

  //   Remove User
  const handleRemoveUser = (id) => {
    const newUsers = usersList.filter((user) => user._id !== id);
    setUserList(newUsers);
  };

  //   Add Department (by ID)
  const handleAddDepartment = (deptId) => {
    if (!deptId) return;
    if (departmentsList.includes(deptId)) {
      return toast.error("Department already selected!");
    }
    setDepartmentsList([...departmentsList, deptId]);
  };

  //   Remove Department
  const handleRemoveDepartment = (id) => {
    setDepartmentsList(departmentsList.filter((deptId) => deptId !== id));
  };

  return (
    <div className="w-[21rem] sm:w-[34rem] rounded-md shadow border flex flex-col gap-4 bg-white">
      <div className="flex items-center justify-between px-4 pt-2">
        <h1 className="text-[20px] font-semibold text-black">
          {projectId ? "Update Project" : "Add Project"}
        </h1>
        <span
          className="cursor-pointer"
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
          {/* Project Name */}
          <input
            type="text"
            placeholder="Project Name"
            required
            className={`${style.input} w-full`}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />

          {/* Departments */}
          {departmentsList?.length > 0 && (
            <div className="w-full flex items-center gap-2 flex-wrap border py-2 px-2 rounded-md border-gray-400">
              {departmentsList.map((deptId) => {
                const dept = departments.find((d) => d._id === deptId);
                return (
                  <div
                    key={deptId}
                    className="flex items-center gap-3 py-1 px-2 rounded-md text-white bg-blue-600"
                  >
                    <span className="text-white text-[15px]">
                      {dept?.departmentName}
                    </span>
                    <span
                      className="cursor-pointer bg-red-500/50 p-[2px] rounded-full hover:bg-red-500"
                      onClick={() => handleRemoveDepartment(deptId)}
                    >
                      <IoClose className="h-4 w-4 " />
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <select
            value=""
            className={`${style.input}`}
            onChange={(e) => handleAddDepartment(e.target.value)}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.departmentName}
              </option>
            ))}
          </select>

          {/* Users */}
          {usersList?.length > 0 && (
            <div className="w-full flex items-center gap-2 flex-wrap border py-2 px-2 rounded-md border-gray-400">
              {usersList.map((user) => (
                <div
                  key={user?._id}
                  className="flex items-center gap-3 py-1 px-2 rounded-md text-white bg-purple-600"
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
            {users.map((user) => (
              <option
                key={user._id}
                value={JSON.stringify({
                  _id: user._id,
                  name: user.name,
                  profileImage: user.avatar,
                  role: user.role,
                })}
              >
                {user?.name}
              </option>
            ))}
          </select>

          {/* Submit Button */}
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
