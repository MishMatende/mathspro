import { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { Outlet } from "react-router-dom";

const TutorDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* THIS is where pages render */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default TutorDashboardLayout;
