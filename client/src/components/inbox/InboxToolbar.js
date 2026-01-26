import { FiRefreshCw, FiMoreVertical } from "react-icons/fi";

export default function InboxToolbar() {
  return (
    <div className="h-12 border-b flex items-center px-4 justify-between">
      <FiRefreshCw className="cursor-pointer" />
      <FiMoreVertical className="cursor-pointer" />
    </div>
  );
}
