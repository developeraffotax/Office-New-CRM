import { NavLink } from "react-router-dom";
import {
  FiInbox,
  FiStar,
  FiSend,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";

const Item = ({ icon, label, to }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        flex items-center gap-3 px-4 py-2 rounded-r-full text-sm
        hover:bg-gray-100
        ${isActive ? "bg-blue-100 text-blue-600 font-medium" : "text-gray-700"}
        `
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default function Sidebar() {
  return (
    <div className="min-w-48 border-r bg-gray-50 pt-4 space-y-1">
      <Item
        icon={<FiInbox className="size-4" />}
        label="Inbox"
        to="/tickets/inbox"
      />
      <Item
        icon={<FiSend className="size-4" />}
        label="Sent"
        to="/tickets/sent"
      />
      <Item
        icon={<FiStar className="size-4" />}
        label="Starred"
        to="/tickets/starred"
      />
      <Item
        icon={<FiAlertCircle className="size-4" />}
        label="Spam"
        to="/tickets/spam"
      />
      <Item
        icon={<FiTrash2 className="size-4" />}
        label="Trash"
        to="/tickets/trash"
      />
    </div>
  );
}
