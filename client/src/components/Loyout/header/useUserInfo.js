import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

export const useUserInfo = () => {
  const auth = useSelector((state) => state.auth.auth);
  const [userInfo, setUserInfo] = useState([]);
  const [show, setShow] = useState(false);

  const getUserInfo = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_user/${auth.user.id}`
      );
      setUserInfo(data?.user);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, [auth.user]);

  const userInitials = auth?.user?.name
    ? auth?.user?.name?.slice(0, 1).toUpperCase()
    : "";

  return {
    userInfo,
    show,
    setShow,
    userInitials,
  };
};
