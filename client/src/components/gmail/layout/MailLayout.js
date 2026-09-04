import { Outlet } from "react-router-dom";
import Sidebar from "../shared/Sidebar";
import { MailModalsProvider } from "../context/MailModalsContext";
import MailModalsRenderer from "../modals/MailModalsRenderer";

export default function MailLayout() {
  return (
    <MailModalsProvider>
      <div className="flex h-[105vh] bg-white overflow-hidden relative">
        {/* Desktop Sidebar only */}
        <div className="hidden md:block shrink-0">
          <Sidebar />
        </div>

        <main className="flex-1 h-full min-w-0 min-h-0">
          <Outlet />
        </main>

        <MailModalsRenderer />
      </div>
    </MailModalsProvider>
  );
}