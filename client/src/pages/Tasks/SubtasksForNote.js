import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { LoadingDots } from "../../utlis/CustomLoaders";

const SubtasksForNote = ({ taskId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [subTaskData, setSubTaskData] = useState([]);

  const getSingleTask = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/single/${taskId}`
      );
      if (data) {
        setIsLoading(false);
        setSubTaskData(data?.task?.subtasks);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast.error(error?.response?.data?.message || "Error in single task!");
    }
  };

  useEffect(() => {
    getSingleTask();
  }, [taskId]);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };




  
  return (
    <div className="relative inline-block text-left z-[999] w-[60%] ">
      {/* Styled Select Input */}

      {isLoading && (
        <div className="flex items-center justify-start ">
          <LoadingDots />
        </div>
      )}

      {!isLoading && subTaskData.length > 0 && (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer hover:border-gray-400 bg-white"
        >
          <div className="flex items-center gap-2 text-gray-700">
            {/* <FiFilter className="text-gray-500" /> */}
            <span>{"Select Subtask"}</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[999]">
          <ul className="py-1">
            {subTaskData.map((el) => (
              <li
                key={el._id}
                className={`w-full px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center m-0 text-sm   ${
                  selected === el.subTask ? "bg-gray-100 font-medium" : ""
                }`}
                onClick={() => handleSelect(el.subTask)}
              >
                {el.subTask}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SubtasksForNote;
