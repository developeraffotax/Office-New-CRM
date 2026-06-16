import { useEffect, useState } from "react";
import axios from "axios";
 import { useWhatsAppConversations } from "../hooks/useWhatsAppConversations";
import WhatsAppLayout from "../layout/WhatsAppLayout";

export default function WhatsAppBox() {
    const [users, setUsers] = useState([]);
  const [team, setTeam] = useState([]);
  const [categories, setCategories] = useState([]);

  const chatData = useWhatsAppConversations({
    endpoint: `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations`,
  });

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(
        data?.users?.filter((user) =>
          user.role?.access?.some((item) =>
            item?.permission?.includes("Whatsapp")
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
      setTeam( data?.users);


    } catch (error) {
      console.log(error);
    }
  };

 

    const getCategories = async () => {
    try {
       
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/whatsapp/category`);
      setCategories(data);


    } catch (error) {
      console.log(error);
    }
  };




  useEffect(() => {
    getCategories();
    getAllUsers();
    getTeam();
  }, []);

  return <WhatsAppLayout users={users}  team={team}  categories={categories}  {...chatData} />;
}