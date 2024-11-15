import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";
import toast from "react-hot-toast";

export default function AssignToUserModal({
  setShowModal,
  singleEmail,
  setSingleEmail,
  selectedCompany,
}) {
  const { auth } = useAuth();
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [selectedUser, setSelectUser] = useState("");
  const [loading, setLoading] = useState(false);
  // console.log("singleEmail:", singleEmail);

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access?.some((item) =>
            item?.permission?.includes("Tickets")
          )
        ) || []
      );

      setUserName(
        data?.users
          ?.filter((user) =>
            user.role?.access.some((item) =>
              item?.permission?.includes("Tickets")
            )
          )
          .map((user) => user.name)
      );
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  //   Allocate User
  const handleAllocate = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Extract Email
    const fromHeader =
      singleEmail.emailData.payload.headers.find(
        (header) => header.name === "From"
      )?.value || "No Sender";

    // Check if 'fromHeader' contains an email
    const [name, emailAddress] = fromHeader.includes("<")
      ? fromHeader.split(/<|>/)
      : [fromHeader, ""];

    // Clean the email address
    const cleanedEmail = emailAddress ? emailAddress.trim() : "";

    console.log("Email:", name.trim(), cleanedEmail);
    // ----->

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/tickets/assign/email`,
        {
          companyName: cleanedEmail,
          clientName: name ? name.trim() : cleanedEmail,
          company: selectedCompany,
          jobHolder: selectedUser,
          subject: singleEmail.subject,
          threadId: singleEmail.emailData.threadId,
        }
      );
      if (data) {
        setLoading(false);
        toast.success("Email allocated successfully");
        setSingleEmail(null);
        setShowModal(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in allocate user!");
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[100%] flex items-center justify-center py-3 px-4 overflow-y-auto rounded-md ">
      <div className="w-[30rem] rounded-md  border flex flex-col gap-4 bg-white  ">
        <div className="flex items-center justify-between px-4 pt-2">
          <h1 className="text-[20px] font-semibold text-black">Assign Email</h1>
          <span
            className=" cursor-pointer"
            onClick={() => {
              setShowModal(false);
            }}
          >
            <IoClose className="h-6 w-6 " />
          </span>
        </div>
        <hr className="h-[1px] w-full bg-gray-400 " />
        <form
          className="flex flex-col gap-4 w-full pb-4 px-4 "
          onSubmit={handleAllocate}
        >
          <select
            value={selectedUser}
            onChange={(e) => setSelectUser(e.target.value)}
            className={`${style.input} w-full`}
          >
            <option value="">Select User</option>
            {users?.map((jobhold, i) => (
              <option key={i} value={jobhold?.name}>
                {jobhold?.name}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-end ">
            <button
              disabled={loading}
              className={`${style.button1} text-[15px] `}
              type="submit"
              style={{ padding: ".4rem 1rem" }}
            >
              {loading ? (
                <TbLoader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span>Assign</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
