import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function AddTemplateModal({
  setAddTemplate,
  templateId,
  setTemplateId,
  users,
  setTemplateData,
  categoryData,
  getTemplates,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [template, setTemplate] = useState("");
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);

  //---------- Get Single Project-----------
  const getSingleTemplate = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/templates/get/single/template/${templateId}`
      );
      setName(data?.template?.name);
      setDescription(data?.template?.description);
      setCategory(data?.template?.category);
      setTemplate(data?.template?.template);
      setUserList(data?.template?.userList);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSingleTemplate();
    // eslint-disable-next-line
  }, [templateId]);

  // -----------Create / Update Template-------->
  const handleTemplate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (templateId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/templates/update/template/${templateId}`,
          { name, description, template, category, userList }
        );
        if (data?.success) {
          setLoading(false);
          getTemplates();
          setTemplateId("");
          setName("");
          setDescription("");
          setTemplate("");
          setCategory("");
          setUserList([]);
          setAddTemplate(false);
          toast.success("Template Updated!");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/templates/create/template`,
          { name, description, template, category, userList }
        );
        if (data) {
          setTemplateData((prevData) => [...prevData, data.template]);
          getTemplates();
          setLoading(false);
          toast.success("Template created successfully!");
          setAddTemplate(false);
          setName("");
          setDescription("");
          setTemplate("");
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
    <div className="w-[21rem] sm:w-[38rem] rounded-md shadow border flex flex-col gap-4 bg-white">
      <div className="flex items-center justify-between px-4 pt-2">
        <h1 className="text-[20px] font-semibold text-black">
          {templateId ? "Update Template" : "Add Template"}
        </h1>
        <span
          className=" cursor-pointer"
          onClick={() => {
            setTemplateId("");
            setAddTemplate(false);
          }}
        >
          <IoClose className="h-6 w-6 " />
        </span>
      </div>
      <hr className="h-[1px] w-full bg-gray-400 " />
      <div className="w-full py-2 px-4">
        <form onSubmit={handleTemplate} className="w-full flex flex-col gap-4 ">
          <input
            type="text"
            placeholder="Template Name"
            required
            className={`${style.input} w-full`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className={`${style.input}`}
            value={category}
            required
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Select Category</option>
            {categoryData &&
              categoryData?.map((cat) => (
                <option
                  key={cat?._id}
                  value={cat?.name}
                  className=" flex items-center gap-1"
                >
                  {cat?.name}
                </option>
              ))}
          </select>
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
          <textarea
            placeholder="Template Name"
            required
            className={`${style.input} w-full resize-none h-[4rem]`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {/*  */}
          <ReactQuill
            theme="snow"
            modules={modules}
            formats={formats}
            className="rounded-md relative min-h-[11rem] max-[28rem] h-[12rem] 2xl:h-[22rem]"
            value={template}
            onChange={setTemplate}
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
                <span>{templateId ? "Update" : "Create"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
