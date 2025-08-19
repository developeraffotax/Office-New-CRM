import React, { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import axios from "axios";
import EntityDropdown from "./EntityDropdown";
 

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/tasks/department`;

const DepartmentDropdown = ({
  showDepartment,
   
  departments,
  getAllDepartments,
   
  setShowDepartment,
  setDepartmentId,
  setOpenAddDepartment,
}) => {
  const dropdownRef = useRef(null); // <-- create a real ref for dropdown box

  // --------- Delete department ---------
  const handleDeleteConfirmation = (departmentId) => {
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
        deleteProject(departmentId);
        Swal.fire("Deleted!", "Your department has been deleted.", "success");
      }
    });
  };

  const deleteProject = async (id) => {
    try {
      const { data } = await axios.delete(`${API_URL}/${id}`);
      if (data) {
        getAllDepartments();
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
        setShowDepartment(false); // close when clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <EntityDropdown
      show={showDepartment}
      ref={dropdownRef} // pass the ref here
      entities={departments}
      labelKey="departmentName"
      onEdit={(id) => {
        setDepartmentId(id);
        setOpenAddDepartment(true);
      }}
      onDelete={handleDeleteConfirmation}
    />
  );
};

export default DepartmentDropdown;
