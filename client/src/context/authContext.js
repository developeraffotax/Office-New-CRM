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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
