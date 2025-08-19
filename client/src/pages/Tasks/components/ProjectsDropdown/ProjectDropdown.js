// ProjectDropdown.jsx
import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import axios from "axios";
import EntityDropdown from "./EntityDropdown";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/projects`


const ProjectDropdown = ({
  showProject,
   
  projects,
  getAllProjects,
  getAllTasks,
  setShowProject,
  setProjectId,
  setOpenAddProject,
   
}) => {
    const dropdownRef = useRef(null); 
  // --------- Delete Project ---------
  const handleDeleteConfirmation = (projectId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProject(projectId);
        Swal.fire("Deleted!", "Your project has been deleted.", "success");
      }
    });
  };

  const deleteProject = async (id) => {
    try {
      const { data } = await axios.delete(
        `${API_URL}/delete/project/${id}`
      );
      if (data) {
        getAllProjects();
        
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // --------- Update Project Status ---------
  const handleUpdateStatus = (projectId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this project!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        updateProjectStatus(projectId);
        Swal.fire(
          "Project Completed!",
          "Your project has been updated.",
          "success"
        );
      }
    });
  };

  const updateProjectStatus = async (id) => {
    try {
      const { data } = await axios.put(
        `${API_URL}/update/status/${id}`
      );
      if (data) {
        getAllProjects();
        getAllTasks();
        setShowProject(false);
        
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };





  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowProject(false); // close when clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  return (
    <EntityDropdown
      show={showProject}
      ref={dropdownRef}
      entities={projects}
      labelKey="projectName"
      onComplete={handleUpdateStatus}
      onEdit={(id) => {
        setProjectId(id);
        setOpenAddProject(true);
      }}
      onDelete={handleDeleteConfirmation}
    />
  );
};

export default ProjectDropdown;
