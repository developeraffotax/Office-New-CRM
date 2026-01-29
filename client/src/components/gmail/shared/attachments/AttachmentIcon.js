import { FiFile, FiImage, FiFileText, FiArchive } from "react-icons/fi";
import { BsFilePdf } from "react-icons/bs";

export function getAttachmentMeta(mimeType) {
  if (!mimeType) return { icon: FiFile, color: "text-gray-400" };

  const type = mimeType.toLowerCase();

  if (type.includes("pdf")) 
    return { icon: BsFilePdf, color: "text-red-500" };
  
  if (type.startsWith("image")) 
    return { icon: FiImage, color: "text-blue-500" };
  
  if (type.includes("zip") || type.includes("rar") || type.includes("compressed")) 
    return { icon: FiArchive, color: "text-amber-600" };

  if (type.includes("word") || type.includes("text") || type.includes("officedocument")) 
    return { icon: FiFileText, color: "text-indigo-500" };

  return { icon: FiFile, color: "text-gray-500" };
}