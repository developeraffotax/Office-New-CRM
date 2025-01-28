import React from "react";
import { useAuth } from "../context/authContext";
import Spinner from "../utils/Spinner";

export default function AdminProtected({ children }) {
  const { auth } = useAuth();

  if (!auth?.token || auth?.user?.role !== "admin") {
    return <Spinner />;
  }

  return <>{children}</>;
}
