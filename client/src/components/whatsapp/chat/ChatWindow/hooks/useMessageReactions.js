import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export function useMessageReactions(chat, setMessages) {
  const [activeReactionMenuId, setActiveReactionMenuId] = useState(null);

  const handleSelectReaction = async (messageId, emoji) => {
    setActiveReactionMenuId(null);

    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId
          ? { ...msg, reactions: [...(msg.reactions || []), { emoji }] }
          : msg
      )
    );

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages/${messageId}/reactions`,
        { emoji, companyName: chat.companyName }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: data.data.reactions } : msg
        )
      );
    } catch (err) {
      console.error("Failed to send reaction:", err);
      toast.error("Failed to send reaction");
    }
  };

  return { activeReactionMenuId, setActiveReactionMenuId, handleSelectReaction };
}