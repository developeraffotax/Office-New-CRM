import React, { useEffect, useState } from "react";
import { ImSpinner10 } from "react-icons/im";
import { useNavigate } from "react-router-dom";

export default function Spinner() {
  const router = useNavigate();
  const [count, setCount] = useState(3);

  useEffect(() => {
    const counter = setInterval(() => {
      setCount((prevVal) => {
        if (prevVal === 0) {
          router("/");
          clearInterval(counter);
        }
        return prevVal - 1;
      });
    }, 1000);

    return () => clearInterval(counter);
  }, [count, router]);
  return (
    <div className="w-full min-h-screen flex items-center justify-center ">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl flex flex-col gap-2font-semibold text-center">
          <span className="text-2xl text-red-500 font-bold text-center">
            Unauthorised Access
          </span>
          Redirecting to you in {count} seconds
        </h1>
        <span>
          <ImSpinner10 className="h-10 w-10 text-blue-500 animate-spin" />
        </span>
      </div>
    </div>
  );
}
