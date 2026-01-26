import {
  FiFile,
  FiImage,
  FiFileText,
  FiArchive,
} from "react-icons/fi";
import { BsFilePdf } from "react-icons/bs";

export function getAttachmentMeta(mimeType) {
  if (!mimeType) return { icon: FiFile, color: "text-gray-500" };

  if (mimeType.includes("pdf"))
    return { icon: BsFilePdf, color: "text-red-500" };

  if (mimeType.startsWith("image"))
    return { icon: FiImage, color: "text-blue-500" };

  if (mimeType.includes("zip") || mimeType.includes("rar"))
    return { icon: FiArchive, color: "text-yellow-600" };

  if (
    mimeType.includes("word") ||
    mimeType.includes("text") ||
    mimeType.includes("officedocument")
  )
    return { icon: FiFileText, color: "text-indigo-500" };

  return { icon: FiFile, color: "text-gray-500" };
}
