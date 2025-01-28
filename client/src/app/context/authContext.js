"use client";
import axios from "axios";
import { useEffect, useState, createContext, useContext } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, token: null });
  console.log("auth:", auth);

  axios.defaults.headers.common["Authorization"] = auth?.token;

  useEffect(() => {
    const data = localStorage.getItem("auth");

    if (data) {
      const parseData = JSON.parse(data);
      setAuth((prevData) => ({
        ...prevData,
        user: parseData.user,
        token: parseData.token,
      }));
    }
  }, []);

  // Refresh Token
  useEffect(() => {
    const refreshToken = async () => {
      if (!auth.token) {
        return;
      }

      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/refresh`
        );

        if (data.token) {
          setAuth((prevAuth) => ({
            ...prevAuth,
            token: data.token,
          }));

          const updateAuthData = {
            user: auth.user,
            token: data.token,
          };

          localStorage.setItem("auth", JSON.stringify(updateAuthData));
        }
      } catch (error) {
        console.log(error);
      }
    };
    refreshToken();
  }, [auth.token]);

  // Update Auth Info
  const getUserInfo = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/userDetail/${auth.user._id}`
      );

      if (data) {
        const updatedAuth = {
          user: data.user,
          token: auth.token,
        };
        setAuth((prevAuth) => ({
          ...prevAuth,
          user: data.user,
        }));

        localStorage.setItem("auth", JSON.stringify(updatedAuth));
      }
    } catch (error) {
      console.log("Error fetching user info:", error);
    }
  };

  useEffect(() => {
    getUserInfo();

    // eslint-disable-next-line
  }, []);

  // Check token expiry
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
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
