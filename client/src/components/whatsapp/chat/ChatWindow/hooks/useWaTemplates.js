import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getTemplateBodyText, getTemplateVariableCount, interpolateTemplate } from "../../../utils/chat";

export function useWaTemplates(chat, setMessages, setLoadingMsg) {
  const [waTemplates, setWaTemplates] = useState([]);
  const [selectedWaTemplate, setSelectedWaTemplate] = useState(null);
  const [waTemplateVars, setWaTemplateVars] = useState([]);

  const getAllWaTemplates = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/templates`,
        { params: { companyName: chat?.companyName } }
      );
      setWaTemplates(data?.templates);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!chat?.companyName) return;
    getAllWaTemplates();
    // eslint-disable-next-line
  }, [chat?.companyName]);

  const waTemplateOptions = waTemplates.map((t) => ({
    value: t.id,
    label: `${t.name} (${t.category})`,
    template: t,
  }));

  const handleWaTemplateChange = (selectedOption) => {
    if (!selectedOption) {
      setSelectedWaTemplate(null);
      setWaTemplateVars([]);
      return;
    }
    const tpl = selectedOption.template;
    setSelectedWaTemplate(tpl);
    setWaTemplateVars(Array(getTemplateVariableCount(tpl)).fill(""));
  };

  const handleSendWaTemplate = async () => {
    if (!selectedWaTemplate) return;
    try {
      setLoadingMsg(true);
      const previewText = interpolateTemplate(getTemplateBodyText(selectedWaTemplate), waTemplateVars);

      const payload = {
        to: chat.phone,
        type: "template",
        companyName: chat.companyName,
        template: JSON.stringify({
          name: selectedWaTemplate.name,
          language: selectedWaTemplate.language,
          bodyParams: waTemplateVars,
          previewText,
        }),
      };

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/conversations/${chat._id}/messages`,
        payload
      );

      setMessages((prev) => [...prev, ...data]);
      setSelectedWaTemplate(null);
      setWaTemplateVars([]);
    } catch (err) {
      console.error("Failed to send template:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to send template");
    } finally {
      setLoadingMsg(false);
    }
  };

  return {
    waTemplateOptions,
    selectedWaTemplate,
    setSelectedWaTemplate,
    waTemplateVars,
    setWaTemplateVars,
    handleWaTemplateChange,
    handleSendWaTemplate,
  };
}