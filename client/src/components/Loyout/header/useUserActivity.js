import { useEffect, useState } from "react";
import axios from "axios";

export const useUserActivity = () => {
  const [userActivity, setUserActivity] = useState(null);

  useEffect(() => {
    const getUserActivity = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/agent/activity`
        );
        setUserActivity(data?.user);
      } catch (error) {
        console.log(error);
      }
    };

    getUserActivity();
  }, []);

  return { userActivity };
};
