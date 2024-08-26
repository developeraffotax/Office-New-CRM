import React, { useEffect, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { useAuth } from "../../context/authContext";
import { FaPen } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { style } from "../../utlis/CommonStyle";
import { BiLoaderCircle } from "react-icons/bi";

export default function Profile() {
  const { auth } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [emergency_contact, setEmergency_contact] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoad, setImageLoad] = useState(false);

  //    Get User Info
  const getUserInfo = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_user/${auth.user.id}`
      );
      setName(data?.user?.name);
      setUsername(data?.user?.username);
      setPhone(data?.user?.phone);
      setEmergency_contact(data?.user?.emergency_contact);
      setAddress(data?.user?.address);
      setAvatar(data?.user?.avatar);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    getUserInfo();

    // eslint-disable-next-line
  }, [auth.user]);

  // Upload Image In CLoudanry

  const uploadAvatar = (image) => {
    if (image === undefined) {
      toast.error("Please select an image!");
      return;
    }
    setImageLoad(true);

    if (
      image.type === "image/jpeg" ||
      image.type === "image/png" ||
      image.type === "image/jpg" ||
      image.type === "image/*"
    ) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "crmaffotax");
      formData.append("cloud_name", "dc3rkqrry");

      fetch("https://api.cloudinary.com/v1_1/dc3rkqrry/image/upload", {
        method: "post",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          setAvatar(data.url.toString());
          setImageLoad(false);
        })
        .catch((err) => {
          console.error("Error uploading image:", err);
          toast.error("Error uploading image");
          setImageLoad(false);
        });
    } else {
      toast.error("Please select an image!", { duration: 3000 });
      setImageLoad(false);
    }
  };

  // Update User Info

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/user/update/Profile/${auth.user.id}`,
        {
          name,
          username,
          phone,
          emergency_contact,
          address,
          avatar,
        }
      );
      if (data) {
        getUserInfo();
        setLoading(false);
        toast.success("Profile Updated!");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error.response.data.message);
    }
  };

  return (
    <Layout>
      <div className="w-full min-h-screen">
        <div className="bg-gradient-to-br from-orange-600 via-orange-300 to-orange-500 h-[10rem] rounded-b-lg"></div>
        <div className="flex items-center justify-center translate-y-[-10rem] w-full z-[10] py-4 px-3">
          <div className="w-[28rem] min-h-[15rem]  shadow-md rounded-md  bg-gray-50 py-4 px-3">
            <h1 className="w-full text-center font-semibold text-2xl mb-4">
              Profile
            </h1>
            <div className=" flex items-center justify-center">
              <div className="relative">
                <img
                  src={`${avatar ? avatar : "/profile1.jpeg"}`}
                  alt="Avatar"
                  className={`rounded-full w-[6rem] h-[6rem] border-2 border-orange-600`}
                />
                <input
                  type="file"
                  id="logo"
                  className="hidden"
                  onChange={(e) => uploadAvatar(e.target.files[0])}
                />
                <label
                  htmlFor="logo"
                  disabled={imageLoad}
                  className={`absolute bottom-6 right-[-.6rem] cursor-pointer p-1 rounded-full bg-gray-600/20 hover:bg-gray-600/60 ${
                    imageLoad && "cursor-not-allowed"
                  }`}
                >
                  {imageLoad ? (
                    <BiLoaderCircle className="h-4 w-4  text-orange-600 animate-spin " />
                  ) : (
                    <FaPen className="h-4 w-4  text-orange-600 transition-all duration-150 " />
                  )}
                </label>
              </div>
            </div>
            <form onSubmit={updateProfile} className="mt-4 flex flex-col gap-4">
              <div className="inputBox">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${style.input} w-full`}
                />
                <span>Name</span>
              </div>

              <div className="inputBox">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`${style.input} w-full`}
                />
                <span>User Name</span>
              </div>
              <div className="inputBox">
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`${style.input} w-full`}
                />
                <span>Phone</span>
              </div>
              <div className="inputBox">
                <input
                  type="text"
                  required
                  value={emergency_contact}
                  onChange={(e) => setEmergency_contact(e.target.value)}
                  className={`${style.input} w-full`}
                />
                <span>Emergency Contact</span>
              </div>
              <div className="inputBox">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`${style.input} w-full`}
                />
                <span>Address</span>
              </div>
              <div className="flex items-center justify-end w-full">
                <button
                  disabled={loading}
                  className={`px-6 h-[2.6rem] min-w-[7rem] flex items-center justify-center  rounded-md cursor-pointer shadow-md bg-orange-500 text-white border-none outline-none hover:bg-orange-600 ${
                    loading && "cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <BiLoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    "Update"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
