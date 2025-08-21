import axios from "axios";
import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

// TO show the hr task description to anyone
export default function Temp() {
  const { hrTaskId } = useParams();

  const [hrTask, setHrTask] = useState(null);

  const fetchTask = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/hr/task/detail/${hrTaskId}`
      );

      console.log(data);

      if (data) {
        setHrTask(data.task);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  useEffect(() => {
    fetchTask();
  }, []);

  return (
    <div className="w-full   flex items-center justify-center py-6 px-4  ">
      <div className="fixed top-0  z-[999] h-16 bg-gradient-to-r from-[#8fc9ae] via-[#548e87] to-[#385b66] w-full flex justify-center items-center    ">
        <h1 className="text-2xl text-white font- ">
          <a className=" " href="https://affotax.com">Affotax | Making Tax Affordable</a> 
        </h1>
      </div>
      <div className="fixed top-0 left-0 z-[998] w-full h-full py-4 px-4 bg-gray-300/70 flex items-center justify-center">
        <div className="flex flex-col gap-2 bg-white rounded-md shadow-md w-[65%] h-[85%] ">
          <div className="flex items-center justify-between px-4 pt-2">
            <h1 className="text-[20px] font-semibold text-black">
              {" "}
              Task Detail{" "}
            </h1>
          </div>
          <hr className="h-[1px] w-full bg-gray-400 " />

          <div className="px-4 w-full">
            <div
              className=" py-4  px-4 w-full max-h-[80vh] text-[14px] overflow-y-auto cursor-pointer"
              dangerouslySetInnerHTML={{ __html: hrTask?.description }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
