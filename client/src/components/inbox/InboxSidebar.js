import {
  FiInbox,
  FiStar,
  FiSend,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";

const Item = ({ icon, label }) => (
  <div className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-r-full">
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);

export default function InboxSidebar() {
  return (
    <div className="min-w-48 border-r bg-gray-50 pt-4">
      <Item icon={<FiInbox />} label="Inbox" />
      <Item icon={<FiStar />} label="Starred" />
      <Item icon={<FiSend />} label="Sent" />
      <Item icon={<FiAlertCircle />} label="Spam" />
      <Item icon={<FiTrash2 />} label="Trash" />
    </div>
  );
}
