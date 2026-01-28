import { NavLink, useSearchParams } from "react-router-dom";
import {
  FiInbox,
  FiStar,
  FiSend,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";

const Item = ({ icon, label, folder }) => {
  const [searchParams] = useSearchParams();

  const activeFolder = searchParams.get("folder") 
 

  const isActive = activeFolder === folder;

  // preserve companyName when switching folders
  const params = new URLSearchParams(searchParams);
  params.set("folder", folder);
 

  return (
    <NavLink
      to={`/tickets/mail?${params.toString()}`}
      className={() =>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const companyName = searchParams.get("companyName") || "affotax"

  const handlecompanyNameChange = (e) => {
    const value = e.target.value;
  
    
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set("companyName", value);
      
      return params;
    });
  };

  return (
    <div className="min-w-48 border-r bg-gray-50 pt-4 space-y-2">
      {/* companyName Selector */}
      <div className="px-4">
        <select
          value={companyName}
          onChange={handlecompanyNameChange}
          className="w-full text-sm px-2 py-1.5 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {/* <option value={""}>All Companies</option> */}
          <option value="affotax">Affotax</option>
          <option value="outsource">Outsource</option>
          {/* later: map from API */}
        </select>
      </div>

      {/* Folders */}
      <Item icon={<FiInbox className="size-4" />} label="Inbox" folder="inbox" />
      <Item icon={<FiSend className="size-4" />} label="Sent" folder="sent" />
      <Item icon={<FiStar className="size-4" />} label="Starred" folder="starred" />
      <Item icon={<FiAlertCircle className="size-4" />} label="Spam" folder="spam" />
      <Item icon={<FiTrash2 className="size-4" />} label="Trash" folder="trash" />
    </div>
  );
}
