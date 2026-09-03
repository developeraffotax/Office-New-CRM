import { Outlet } from "react-router-dom";
import Sidebar from "../shared/Sidebar";
import { WhatsappModalsProvider } from "../context/WhatsappModalsContext";
import WhatsappModalsRenderer from "../modals/WhatsappModalsRenderer";
 

 

export default function WhatsappLayout() {
  return (
    <WhatsappModalsProvider>
       <div className="flex h-[105vh] bg-[#f0f2f5] overflow-hidden text-gray-800 font-google">
        <Sidebar />
        <main className="flex-1 h-full min-w-0 min-h-0">
          <Outlet />
        </main>
        <WhatsappModalsRenderer />
      </div>
    </WhatsappModalsProvider>
  );
}