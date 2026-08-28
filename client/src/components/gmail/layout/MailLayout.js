import { Outlet } from "react-router-dom";
import Sidebar from "../shared/Sidebar";

 

export default function MailLayout() {
  return (
    <div className="flex h-[105vh] bg-white overflow-hidden">

      {/* Permanent Mail Sidebar */}
      <Sidebar />

      {/* Page changes here */}
      <main className="flex-1 h-full min-w-0 min-h-0">
        <Outlet />
      </main>

    </div>
  );
}