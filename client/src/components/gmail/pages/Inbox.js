import MailLayout from "../layout/MailLayout";
import { useMailThreads } from "../hooks/useMailThreads";
import { useEffect, useState } from "react";
import axios from "axios";
import { fetchCategories } from "../categories/categoryApi";

export default function Inbox() {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);


  const mail = useMailThreads({
    endpoint: `${process.env.REACT_APP_API_URL}/api/v1/gmail/get-inbox`,
  });


  
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access?.some((item) =>
            item?.permission?.includes("Tickets")
          )
        ) || []
      );


    } catch (error) {
      console.log(error);
    }
  };

 
    useEffect(() => {
      getAllUsers();
      fetchCategories().then(res => setCategories(res.data));
  }, []);

  return <MailLayout users={users} categories={categories} {...mail} />;
}
