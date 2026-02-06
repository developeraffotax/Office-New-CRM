import React, { useEffect, useState } from "react";
 
import { style } from "../../utlis/CommonStyle";
import AddRole from "./AddRole";
import axios from "axios";
import toast from "react-hot-toast";
import { RiEdit2Line } from "react-icons/ri";
import { AiTwotoneDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { TbLoader2 } from "react-icons/tb";
import Loader from "../../utlis/Loader";

export default function Roles() {
  const [show, setShow] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [roleData, setRoleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [pagesAccess, setPagesAccess] = useState([]);
  const [subRoles, setSubRoles] = useState([
    {
      pageName: "",
      subRole: [],
    },
  ]);

  console.log("subRoles", subRoles);

  const pages = [
    "Dashboard",
    "Tasks",
    "Jobs",
    "Tickets",
    "Templates",
    "Leads",
    "Proposals",
    "Goals",
    "Timesheet",
    "MyList",
    "Subscription",
    "Workflow",
    "Complaints",
    "Roles",
    "Editor",
    "Meeting",
    "HR",
    "Users",
  ];

  const subRolesMapping = {
    Tasks: ["Projects"],
    Jobs: ["Fee", "Source", "Data", "Edit", "Delete"],
    Tickets: ["Inbox", "Affotax", "OutSource", "TrustPilot"],
    Templates: ["Template", "FAQ"],
    Timesheet: ["Job-holder", "Edit", "Delete", "Tracker"],
    // Add other pages and subroles as necessary
  };

  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pageName, setPageName] = useState("");

  console.log("subRoles:", subRoles);

  // console.log("roleData:", roleData);

  // Get All Roles
  const handleGetRole = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/roles/fetch/all/roles`
      );
      if (data) {
        setRoleData(data.roles);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    handleGetRole();
  }, []);

  const getRole = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/roles/fetch/all/roles`
      );
      if (data) {
        setRoleData(data.roles);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(data.users);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();

    // eslint-disable-next-line
  }, []);

  // ----------------------Subrole------->
  // Handle main page checkbox change
  const handleCheckboxChange = (page) => {
    setPagesAccess((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    );
  };

  // Handle subrole checkbox change
  const handleSubRoleCheckboxChange = (page, subRole) => {
    setSubRoles((prevSubRoles) =>
      prevSubRoles.map((role) => {
        if (role.pageName === page) {
          const updatedSubRoles = role.subRole.includes(subRole)
            ? role.subRole.filter((sr) => sr !== subRole)
            : [...role.subRole, subRole];

          return { ...role, subRole: updatedSubRoles };
        }
        return role;
      })
    );
  };

  // Delete Role
  const handleDeleteConfirmation = (roleId) => {
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
        deleteRole(roleId);
        Swal.fire("Deleted!", "Your role has been deleted.", "success");
      }
    });
  };
  const deleteRole = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/roles/delete/role/${id}`
      );
      if (data) {
        getRole();
        toast.success("Role Deleted successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // -----------Main Page Access----------

  useEffect(() => {
    if (selectedRole) {
      setPagesAccess(selectedRole.access.map((item) => item.permission) || {});
    }
  }, [selectedRole]);

  // ----------SubRole Access-------
  // useEffect(() => {
  //   if (selectedRole && pageName) {
  //     const selectedPage = selectedRole.access.find(
  //       (item) => item.permission === pageName
  //     );

  //     if (selectedPage) {
  //       const subRole = selectedPage.subRoles.map((subRole) => subRole);

  //       // Update the subRoles state with the new structure
  //       setSubRoles((prev) => {
  //         const existingPage = prev?.find((p) => p.pageName === pageName);

  //         if (existingPage) {
  //           // Update existing page's subRoles
  //           return prev.map((p) =>
  //             p.pageName === pageName ? { ...p, subRole: subRole } : p
  //           );
  //         } else {
  //           // Add a new page entry
  //           return [...prev, { pageName, subRole: subRole }];
  //         }
  //       });
  //     } else {
  //       // Reset subRoles if pageName doesn't match any access item
  //       setSubRoles((prev) => prev.filter((p) => p.pageName !== pageName));
  //     }
  //   }
  // }, [selectedRole, pageName]);

  //
  useEffect(() => {
    if (selectedRole) {
      const accessData = selectedRole.access;

      // Update the subRoles state based on `accessData`
      setSubRoles(
        accessData.map((accessItem) => ({
          pageName: accessItem.permission,
          subRole: accessItem.subRoles,
        }))
      );
    }
  }, [selectedRole]);

  // Update Roles

  const updateRoleAccess = async (id) => {
    try {
      setIsLoading(true);
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/roles/update/role/${id}`,
        { access: pagesAccess, subRoles, pageName }
      );
      if (data) {
        setSelectedRole(data.role);
        getRole();
        toast.success("Role updated successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoading(false);
      setShow(false);
    }
  };

  return (
    <>
      <div className=" relative w-full h-[100%] overflow-y-auto py-4 px-2 sm:px-4 bg-gray-100">
        {/*  */}
        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-11 gap-4 sm:gap-2 ">
            {/* Roles */}
            <div className="col-span-11 sm:col-span-4  px-3 h-full">
              <div className="w-full h-full rounded-md shadow-md bg-white border border-gray-300 min-h-[20rem]">
                <div className="py-4 px-3 flex items-center justify-between bg-gray-200 border-b border-gray-300">
                  <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-4">
                    Roles({roleData.length}){" "}
                    <span
                      className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-100/50 hover:bg-gray-100/70 cursor-pointer border `}
                      onClick={() => {
                        setSelectedRole(null);
                        setActive("");
                      }}
                      title="Clear Select"
                    >
                      <IoClose className="h-5 w-5  cursor-pointer" />
                    </span>
                  </h2>
                  <button
                    className={`${style.button1} text-[15px] `}
                    onClick={() => setShow(true)}
                    style={{ padding: ".4rem 1rem" }}
                  >
                    New Role
                  </button>
                </div>
                {/*  */}
                <div className="py-4 px-4 flex flex-col gap-3 max-h-[85vh] 2xl:max-h-[90vh]  overflow-x-auto">
                  {roleData &&
                    roleData?.map((role) => (
                      <div
                        className={`py-2 px-2 rounded-md hover:shadow-md w-full border hover:border-orange-500 hover:bg-orange-50  ${
                          active === role._id &&
                          "border-orange-500 bg-orange-50"
                        } hover:text-blue-600  transition-all duration-300 flex items-center justify-between`}
                        key={role._id}
                      >
                        <h3
                          onClick={() => {
                            setSelectedRole(role);
                            setActive(role._id);
                          }}
                          className="font-medium text-[18px] h-full cursor-pointer min-w-[6rem] text-blue-500 hover:text-blue-600"
                        >
                          {role?.name}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span>
                            <RiEdit2Line
                              onClick={() => {
                                setRoleId(role._id);
                                setRoleName(role.name);
                                setShow(true);
                              }}
                              className="h-5 w-5 text-sky-500 hover:text-sky-600 cursor-pointer"
                            />
                          </span>
                          <span>
                            <AiTwotoneDelete
                              onClick={() => handleDeleteConfirmation(role._id)}
                              className="h-5 w-5 text-red-500 hover:text-red-600 cursor-pointer"
                            />
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            {/* -----Permissions */}
            <div className=" col-span-11 sm:col-span-7 px-3 h-full">
              {selectedRole ? (
                <div className="w-full h-full rounded-md shadow-md bg-white border border-gray-300">
                  <div className="py-4 px-3 flex items-center justify-between bg-gray-200 border-b border-gray-300">
                    <h2 className=" text-lg sm:text-2xl font-semibold">
                      Permissions ({selectedRole?.name})
                    </h2>
                    <button
                      className={`${style.button1} text-[15px]`}
                      onClick={() =>
                        selectedRole && updateRoleAccess(selectedRole._id)
                      }
                      style={{ padding: ".4rem 1rem" }}
                    >
                      {isLoading ? (
                        <TbLoader2 className="h-5 w-5 animate-spin text-white" />
                      ) : (
                        <span>Save</span>
                      )}
                    </button>
                  </div>
                  <div className="py-4 px-4 flex flex-col gap-3 max-h-[85vh] 2xl:max-h-[90vh] overflow-x-auto">
                    {pages.map((page) => (
                      <div key={page} className="flex flex-col gap-4">
                        <div
                          className={`w-full flex items-center justify-between py-2 px-2 rounded-md hover:shadow-md border hover:border-orange-500 ${
                            page === pageName && "bg-orange-100"
                          } hover:bg-orange-50 transition-all duration-300`}
                        >
                          <label
                            htmlFor={page}
                            className="flex items-center gap-1"
                          >
                            <input
                              type="checkbox"
                              id={page}
                              checked={pagesAccess?.includes(page)}
                              onChange={() => handleCheckboxChange(page)}
                              style={{ accentColor: "orangered" }}
                              className="h-4 w-4 cursor-pointer checked:bg-orange-600"
                            />
                            <span>{page}</span>
                          </label>

                          {isOpen && pageName === page ? (
                            <>
                              <span
                                onClick={() => {
                                  setIsOpen(false);
                                  setPageName("");
                                }}
                                className="p-1 rounded-full cursor-pointer bg-gray-100/70 text-gray-950 hover:text-orange-600 transition-all duration-300"
                              >
                                <FaAngleUp className="h-5 w-5" />
                              </span>
                            </>
                          ) : (
                            <>
                              {subRolesMapping[page] && (
                                <span
                                  onClick={() => {
                                    setIsOpen(true);
                                    setPageName(page);
                                  }}
                                  className="p-1 rounded-full cursor-pointer bg-gray-100/70 text-gray-950 hover:text-orange-600 transition-all duration-300"
                                >
                                  <FaAngleDown className="h-5 w-5" />
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        {/* -------------SubRoles Access--------- */}
                        {isOpen &&
                          pageName === page &&
                          subRolesMapping[page] && (
                            <div className="flex flex-col gap-1">
                              <h3 className="text-black font-semibold">
                                Sub-Roles
                              </h3>
                              <div className="py-4 px-4 flex flex-col gap-3 ml-4 sm:ml-[3rem] max-h-[85vh] 2xl:max-h-[90vh] overflow-x-auto">
                                {subRolesMapping[page].map((subRole) => (
                                  <div
                                    key={subRole}
                                    className="w-full flex items-center justify-between py-2 px-2 rounded-md hover:shadow-md border hover:border-orange-500 hover:bg-orange-50 transition-all duration-300"
                                  >
                                    <label className="flex items-center gap-1">
                                      <input
                                        type="checkbox"
                                        id={subRole}
                                        checked={
                                          subRoles.some(
                                            (role) =>
                                              role.pageName === page &&
                                              role.subRole.includes(subRole)
                                          ) || false
                                        }
                                        onChange={() =>
                                          handleSubRoleCheckboxChange(
                                            page,
                                            subRole
                                          )
                                        }
                                        style={{ accentColor: "orangered" }}
                                        className="h-4 w-4 cursor-pointer checked:bg-orange-600"
                                      />
                                      <span>{subRole}</span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full rounded-md shadow-md bg-white border border-gray-300 min-h-[30rem]">
                  <div className="py-4 px-3 flex items-center justify-between bg-gray-200 border-b border-gray-300">
                    <h2 className=" text-lg sm:text-2xl font-semibold">
                      Permissions
                    </h2>
                  </div>
                  <div className="flex items-center justify-center w-full h-full flex-col mt-[-5rem]">
                    <img
                      src="/no-data-concept-illustration.png"
                      alt="Select"
                      className="w-[12rem] h-[12rem] animate-pulse"
                    />
                    <span>No role selected!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------Add New Role------------ */}
        {show && (
          <div className="fixed top-0 left-0 w-full h-screen z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
            <AddRole
              setShow={setShow}
              roleId={roleId}
              setRoleId={setRoleId}
              getRole={getRole}
              roleName={roleName}
              setRoleName={setRoleName}
            />
          </div>
        )}
      </div>
    </>
  );
}
