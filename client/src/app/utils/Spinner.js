import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { TbFidgetSpinner } from "react-icons/tb";
import { useAuth } from "../context/authContext";

export default function Spinner() {
  const { auth, setAuth } = useAuth();
  const router = useRouter();
  const [count, setCount] = useState(5);

  useEffect(() => {
    const counter = setInterval(() => {
      setCount((prevVal) => {
        if (prevVal === 0) {
          router.push("/");
          setAuth({ ...auth, user: null, token: "" });
          localStorage.removeItem("auth");
          clearInterval(counter);
        }
        return prevVal - 1;
      });
    }, 1000);

    return () => {
      clearInterval(counter);
    };

    // eslint-disable-next-line
  }, [count, router]);
  return (
    <div className="w-full min-h-screen flex items-center justify-center ">
      <div className="flex flex-col items-center justify-center gap-4">
        <span>
          <TbFidgetSpinner className="h-10 w-10 text-customBrown animate-spin" />
        </span>
        <h1 className="text-2xl flex flex-col gap-2font-semibold text-center">
          <span className="text-2xl text-red-500 font-bold text-center">
            Unauthorised Access
          </span>
          Redirecting to you in {count} seconds
        </h1>
      </div>
    </div>
  );
}
