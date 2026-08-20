import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export function useMessageComposer({
  chat,
  replyingTo,
  setReplyingTo,
  setMessages,
  selectedFiles,
  clearAllSelectedFiles,
  textareaRef,
}) {
  const [inputMsg, setInputMsg] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(false);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputMsg.trim() && selectedFiles.length === 0) return;

    try {
      setLoadingMsg(true);
      let data;

      const contextPayload = replyingTo
        ? { messageId: replyingTo._id, whatsappMessageId: replyingTo.whatsappMessageId }
        : null;

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append("to", chat.phone);
        formData.append("body", inputMsg);
        formData.append("companyName", chat.companyName);
        if (contextPayload) {
          formData.append("context", JSON.stringify(contextPayload));
        }
        selectedFiles.forEach((file) => formData.append("files", file));

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        data = response.data;
      } else {
        const payload = {
          to: chat.phone,
          type: "text",
          body: inputMsg,
          companyName: chat.companyName,
          ...(contextPayload && { context: contextPayload }),
        };
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
          payload
        );
        data = response.data;
      }

      setMessages((prev) => [...prev, ...data]);
      setInputMsg("");
      setReplyingTo(null);
      clearAllSelectedFiles();

      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (err) {
      console.error("Failed to send message sequence:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to send message");
    } finally {
      setLoadingMsg(false);
    }
  };

  return { inputMsg, setInputMsg, loadingMsg, setLoadingMsg, handleSend };
}