import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaSpinner, FaCog, FaSync } from "react-icons/fa";
import { FiCircle } from "react-icons/fi";



export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <AiOutlineLoading3Quarters
        className="animate-spin text-blue-500"
        size={40}
      />
    </div>
  );
};



export const LoadingDots = () => {
  return (
    <div className="flex items-center justify-center gap-2  ">
      <FiCircle
        className="animate-bounce text-red-500"
        size={20}
        style={{ animationDelay: "0ms" }}
      />
      <FiCircle
        className="animate-bounce text-yellow-500"
        size={20}
        style={{ animationDelay: "100ms" }}
      />
      <FiCircle
        className="animate-bounce text-green-500"
        size={20}
        style={{ animationDelay: "200ms" }}
      />
    </div>
  );
};



export const ColorfulLoader = () => {
  return (
    <div className="flex items-center justify-center gap-6 h-screen">
      <FaSpinner className="animate-spin text-purple-500" size={30} />
      <FaCog className="animate-spin text-orange-500" size={30} />
      <FaSync className="animate-spin text-teal-500" size={30} />
    </div>
  );
};




export const DotBounceLoader = () => {
  return (
    <div className="flex items-center justify-center space-x-2 h-screen">
      <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce"></div>
    </div>
  );
};




