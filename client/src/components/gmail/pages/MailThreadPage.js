import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Thread from "../thread/Thread";

export default function MailThreadPage() {
  const { threadId } = useParams();
  const [searchParams] = useSearchParams();
  const companyName = searchParams.get("companyName");
  const navigate = useNavigate();
 
  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="h-full min-w-0">

      <Thread
        variant="full"
        threadId={threadId}
        companyName={companyName}
        onClose={handleClose}
      />

    </div>
  );
}