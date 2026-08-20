import { useEffect, useState } from "react";
import axios from "axios";

export function useTemplates(setInputMsg, textareaRef) {
  const [templates, setTemplates] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const getAllTemplates = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/templates/get/all/template`
      );
      setTemplates(data?.templates);
      console.log("TEMPLATES 🌹🎈🎈🎈🎈🧡🧡❤️❤️❤️", data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllTemplates();
    // eslint-disable-next-line
  }, []);

  const templateOptions = templates.map((item) => ({
    value: item._id,
    label: `${item.name} - ${item.description} `,
    description: item.template,
  }));

  const selectedTemplateOption = templateOptions.find(
    (option) => option.value === selectedTemplateId
  );

  const handleClearSelect = () => {
    setSelectedTemplateId(null);
    setInputValue("");
  };

  const htmlTemplateToPlainText = (html) => {
    if (!html) return "";
    const container = document.createElement("div");
    container.innerHTML = html;

    container.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    container.querySelectorAll("p, div").forEach((el) => el.append("\n"));

    return (container.textContent || "")
      .replace(/\u00A0/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const handleTemplateChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedTemplateId(selectedOption.value);
      setInputMsg(htmlTemplateToPlainText(selectedOption.description));

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      });
    } else {
      handleClearSelect();
    }
  };

  return {
    inputValue,
    setInputValue,
    templateOptions,
    selectedTemplateOption,
    handleTemplateChange,
    handleClearSelect,
  };
}