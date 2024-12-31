import { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });
  const [token, setToken] = useState("");
  const [active, setActive] = useState("dashboard");
  const [anyTimerRunning, setAnyTimerRunning] = useState(false);
  const [time, setTime] = useState("");
  const [filterId, setFilterId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [jid, setJid] = useState("");

  // check token
  axios.defaults.headers.common["Authorization"] = auth?.token;

  useEffect(() => {
    const data = localStorage.getItem("auth");

    if (data) {
      const parseData = JSON.parse(data);
      setAuth((prevAuth) => ({
        ...prevAuth,
        user: parseData?.user,
        token: parseData?.token,
      }));
    }

    // eslint-disable-next-line
  }, []);

  const getUserDetail = async (id) => {
    if (!id) {
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_user/${id}`
      );

      console.log("SingleUserData:", data.user);

      const updatedUser = {
        ...data.user,
        id: data.user._id,
      };
      delete updatedUser._id;

      const updateAuthData = {
        user: updatedUser,
        token: auth.token,
      };
      localStorage.setItem("auth", JSON.stringify(updateAuthData));
      setAuth(updateAuthData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const userId = auth?.user?.id;
    if (userId) {
      getUserDetail(userId);
    }
    //eslint-disable-next-line
  }, [auth?.user?.id]);

  useEffect(() => {
    const checkTokenExpiry = () => {
      const data = localStorage.getItem("auth");
      if (data) {
        const { token } = JSON.parse(data);
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const isExpired = decodedToken.exp * 1000 < Date.now();
        if (isExpired) {
          setAuth({ user: null, token: "" });
          localStorage.removeItem("auth");
        }
      }
    };
    checkTokenExpiry();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        token,
        setToken,
        active,
        setActive,
        anyTimerRunning,
        setAnyTimerRunning,
        filterId,
        setFilterId,
        time,
        setTime,
        searchValue,
        setSearchValue,
        jid,
        setJid,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
