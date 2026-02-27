import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const useTaskData = () => {
  const { auth } = useSelector((state) => state.auth);

  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoad, setIsLoad] = useState(false);

  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [labelData, setLabelData] = useState([]);

  // -------Get All Tasks------->
  const getAllTasks = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/all`,
      );

      if (auth.user.role.name === "Admin") {
        setTasksData(data?.tasks);
      } else {
        const filteredTasks = data?.tasks?.filter((item) =>
          item?.project?.users_list?.some(
            (user) => user?.name === auth?.user?.name,
          ),
        );
        setTasksData(filteredTasks || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------Get Tasks Without Loader-----
  const getTasks1 = async () => {
    setIsLoad(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/all`,
      );

      if (auth.user.role.name === "Admin") {
        setTasksData(data?.tasks);
      } else {
        const filteredTasks = data?.tasks?.filter((item) =>
          item?.project?.users_list?.some(
            (user) => user?.name === auth?.user?.name,
          ),
        );
        setTasksData(filteredTasks || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoad(false);
    }
  };

  // ---------- Get All Projects-----------
  const getAllProjects = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/projects/get_all/project`,
      );
      setAllProjects(data?.projects);
      if (auth.user.role.name === "Admin") {
        setProjects(data?.projects);
      } else {
        const filteredProjects = data.projects.filter((project) =>
          project.users_list.some((user) => user._id === auth?.user?.id),
        );
        setProjects(filteredProjects);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ---------- Get All Departments-----------
  const getAllDepartments = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/department`,
      );
      if (data?.success) {
        if (auth?.user?.role?.name === "Admin") {
          setDepartments(data?.departments || []);
        } else {
          const userProjects = allProjects.filter((project) =>
            project.users_list.some((user) => user._id === auth?.user?.id),
          );
          const projectDepartmentIds = userProjects
            .flatMap((proj) => proj.departments?.map((d) => d._id))
            .filter(Boolean);
          const uniqueDeptIds = [...new Set(projectDepartmentIds)];
          const filteredDepartments = data.departments.filter((dep) =>
            uniqueDeptIds.includes(dep._id),
          );
          setDepartments(filteredDepartments || []);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`,
      );
      setUsers(
        data?.users?.filter((user) =>
          user?.role?.access?.some((item) => item?.permission?.includes("Tasks")),
        ) || [],
      );
      setUserName(
        data?.users
          ?.filter((user) =>
            user?.role?.access?.map((item) => item.permission.includes("Tasks")),
          )
          ?.map((user) => user.name),
      );
    } catch (error) {
      console.log(error);
    }
  };

  // ---------- Get All Labels-----------
  const getlabel = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/label/get/labels/task`,
      );
      if (data.success) {
        setLabelData(data.labels);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllTasks();
    getAllUsers();
    getlabel();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getAllProjects();
    // eslint-disable-next-line
  }, [auth]);

  useEffect(() => {
    if (auth) {
      getAllDepartments();
    }
    // eslint-disable-next-line
  }, [auth, allProjects]);

  return {
    // state
    tasksData,
    setTasksData,
    loading,
    isLoad,
    projects,
    allProjects,
    departments,
    users,
    userName,
    setUserName,
    labelData,
    // fetchers
    getAllTasks,
    getTasks1,
    getAllProjects,
    getAllDepartments,
    getAllUsers,
    getlabel,
  };
};

export default useTaskData;
