import { useRef, useState } from "react";

export function useFileAttachments() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    const newPreviews = newFiles.map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        url: isImage ? URL.createObjectURL(file) : null,
      };
    });
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (indexToRemove) => {
    if (filePreviews[indexToRemove]?.url) {
      URL.revokeObjectURL(filePreviews[indexToRemove].url);
    }
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setFilePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearAllSelectedFiles = () => {
    filePreviews.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    setSelectedFiles([]);
    setFilePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return {
    selectedFiles,
    filePreviews,
    fileInputRef,
    handleFileChange,
    removeSelectedFile,
    clearAllSelectedFiles,
  };
}