import MailLayout from "../layout/MailLayout";
import { useMailThreads } from "../hooks/useMailThreads";
import { useEffect, useState } from "react";
import axios from "axios";
import { fetchCategories } from "../categories/categoryApi";

export default function Mailbox() {
  const [users, setUsers] = useState([]);
  const [team, setTeam] = useState([]);
  const [categories, setCategories] = useState([]);


  const mail = useMailThreads({
    endpoint: `${process.env.REACT_APP_API_URL}/api/v1/gmail/get-mailbox`,
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



    const getTeam = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get/active/team`
      );

      console.log("TEAMMMM", data)
      setTeam( data?.users);


    } catch (error) {
      console.log(error);
    }
  };


  
 
    useEffect(() => {
      getAllUsers();
getTeam()      

      fetchCategories().then(res => setCategories(res.data));
  }, []);

  return <MailLayout users={users}  team={team}  categories={categories} {...mail} />;
}
