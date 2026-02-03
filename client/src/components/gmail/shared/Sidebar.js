import { NavLink, useSearchParams } from "react-router-dom";
import {
  FiInbox,
  FiStar,
  FiSend,
  FiTrash2,
  FiAlertCircle,
  FiChevronDown,
} from "react-icons/fi";

const Item = ({ icon, label, folder }) => {
  const [searchParams] = useSearchParams();
  const activeFolder = searchParams.get("folder") || "inbox";
  const isActive = activeFolder === folder;

  const params = new URLSearchParams(searchParams);
  params.set("folder", folder);

  return (
    <NavLink
      to={`/mail?${params.toString()}`}
      className={`
        group flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all duration-200
        ${isActive 
          ? "bg-blue-50 text-blue-700 font-semibold shadow-sm" 
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
      `}
    >
      <span className={`transition-colors ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
    </NavLink>
  );
};

export default function Sidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const companyName = searchParams.get("companyName") || "affotax";

  const handlecompanyNameChange = (e) => {
    const value = e.target.value;
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set("companyName", value);
      return params;
    });
  };

  return (
    <div className="w-56 min-w-56 h-full border-r border-slate-200 bg-white flex flex-col py-6 space-y-6">
      {/* Company Selector Section */}
      <div className="px-4">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 mb-2 block">
          Workspace
        </label>
        <div className="relative group">
          <select
            value={companyName}
            onChange={handlecompanyNameChange}
            className="w-full appearance-none cursor-pointer text-sm font-medium px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="affotax">Affotax</option>
            <option value="outsource">Outsource</option>
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600" />
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex flex-col gap-1">
        <div className="px-5 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mailboxes</span>
        </div>
        <Item icon={<FiInbox className="size-[18px]" />} label="Inbox" folder="inbox" />
        <Item icon={<FiSend className="size-[18px]" />} label="Sent" folder="sent" />
        {/* <Item icon={<FiStar className="size-[18px]" />} label="Starred" folder="starred" />
        <Item icon={<FiAlertCircle className="size-[18px]" />} label="Spam" folder="spam" />
        <Item icon={<FiTrash2 className="size-[18px]" />} label="Trash" folder="trash" /> */}
      </nav>

      {/* Optional: Footer section for user or settings could go here */}
    </div>
  );
}