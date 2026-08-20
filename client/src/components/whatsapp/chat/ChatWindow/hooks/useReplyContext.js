import { useState } from "react";
import toast from "react-hot-toast";

export function useReplyContext() {
  const [replyingTo, setReplyingTo] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  const scrollToMessage = (targetId) => {
    if (!targetId) return;
    const element = document.getElementById(`msg-${targetId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessageId(targetId);
      setTimeout(() => setHighlightedMessageId(null), 2000);
    } else {
      toast.error("Message reference missing from view history");
    }
  };

  return { replyingTo, setReplyingTo, highlightedMessageId, scrollToMessage };
}