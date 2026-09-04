import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Thread from "../thread/Thread";
 
import { useGetInboxUsersQuery } from "../../../redux/api/inboxUserApi";
import { useGetCategoriesQuery } from "../../../redux/api/inboxCategoryApi";
import { useMailModalActions } from "../context/MailModalsContext";
import { useIsMobile } from "../hooks/useIsMobile";
import ThreadMobile from "../thread/ThreadMobile";

export default function MailThreadPage() {
  const { threadId } = useParams();
  const [searchParams] = useSearchParams();
  const companyName = searchParams.get("companyName");
  const navigate = useNavigate();
 
  const handleClose = () => {
    navigate(-1);
  };


 
  
    const {
    data: users = [],
    isLoading: usersLoading,
    isFetching: usersFetching,
    error: usersError,
  } = useGetInboxUsersQuery();
  
  
   
  
    const {
    data: categories = [],
    isLoading,
    isFetching,
  } = useGetCategoriesQuery();
  
      const { openComments, openReminder } = useMailModalActions();
  
const isMobile = useIsMobile(768);

  return (
    <div className="h-full min-w-0">

     {isMobile ? (
        <ThreadMobile
          threadId={threadId}
          companyName={companyName}
          onClose={handleClose}
          users={users}
          categories={categories}
          openComments={openComments}
        />
      ) : (
        <Thread
          variant="full"
          threadId={threadId}
          companyName={companyName}
          onClose={handleClose}
          users={users}
          categories={categories}
          openComments={openComments}
        />
      )}

    </div>
  );
}