import React from "react";
import Layout from "../../components/Loyout/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center justify-center">
          <img
            src="/notfound.jpg"
            alt="not_found"
            className="w-[18rem] h-[18rem] animate-pulse"
          />
          <span className="text-center text-[14px] font-medium w-[90%] sm:w-[70%]">
            Oops! The page you are looking for could not be found. We're working
            on it. Sorry for the inconvenience.
          </span>
        </div>
      </div>
    </Layout>
  );
}
