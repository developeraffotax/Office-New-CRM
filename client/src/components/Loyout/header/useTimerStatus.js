import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

export const formatElapsedTime = (createdAt) => {
  const now = new Date();
  const createdTime = new Date(createdAt);
  const diffInMinutes = Math.floor((now - createdTime) / (1000 * 60));

  if (diffInMinutes < 1) {
    return "0m";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else {
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h`;
  }
};

export const useTimerStatus = () => {
  const auth = useSelector((state) => state.auth.auth);
  const [timerStatus, setTimerStatus] = useState([]);
  const [showTimerStatus, setShowTimerStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  const getTimerStatus = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/timer/get/timer_task/Status/${auth.user.id}`
      );
      setTimerStatus(data.timerStatus);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTimerStatus();
  }, [auth.user]);

  return {
    timerStatus,
    showTimerStatus,
    setShowTimerStatus,
    loading,
    getTimerStatus,
  };
};
