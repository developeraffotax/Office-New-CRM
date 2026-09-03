import WhatsAppList from "./WhatsAppList";
import { useWhatsAppConversations } from "../hooks/useWhatsAppConversations";
import { useGetActiveWhatsappTeamQuery, useGetWhatsappUsersQuery } from "../../../redux/api/whatsappUserApi";
import { useGetWhatsappCategoriesQuery } from "../../../redux/api/whatsappCategoryApi";
 
 

export default function WhatsAppBox() {
  const { data: users = [] } = useGetWhatsappUsersQuery();
  const { data: team = [] } = useGetActiveWhatsappTeamQuery();
  const { data: categories = [] } = useGetWhatsappCategoriesQuery();

  const chatData = useWhatsAppConversations({
    endpoint: `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations`,
  });

  return (
    <WhatsAppList
      users={users}
      team={team}
      categories={categories}
      {...chatData}
    />
  );
}