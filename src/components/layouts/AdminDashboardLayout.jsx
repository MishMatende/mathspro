import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../admin/Header";
import AdminSidebar from "../admin/AdminSidebar";

export default function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* THIS is where pages render */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
