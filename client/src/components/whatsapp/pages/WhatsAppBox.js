import { useEffect, useState } from "react";
import axios from "axios";
 import { useWhatsAppConversations } from "../hooks/useWhatsAppConversations";
import WhatsAppLayout from "../layout/WhatsAppLayout";

export default function WhatsAppBox() {
  const [team, setTeam] = useState([]);

  const chatData = useWhatsAppConversations({
    endpoint: `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations`,
  });

  const getTeam = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/user/get/active/team`);
      setTeam(data?.users || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTeam();
  }, []);

  return <WhatsAppLayout team={team} {...chatData} />;
}