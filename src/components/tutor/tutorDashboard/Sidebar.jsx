import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  Calendar,
} from "lucide-react";

const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/tutor-dashboard" },
    { label: "Schedule", icon: Calendar, path: "/tutor-schedule" },
    { label: "Learners", icon: Users, path: "/learners" },
    { label: "Homework", icon: FileText, path: "/homework" },
    { label: "Tests", icon: ClipboardList, path: "/tests" },
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
        />
      )}

      <div
        className={`fixed lg:static z-40 h-screen w-64 bg-white px-6 py-8 flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <h1 className="text-2xl font-bold text-primary mb-10">MathsPro</h1>

        <nav className="flex flex-col gap-2 text-sm">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition
                  ${isActive ? "bg-gray-100 font-medium" : "hover:bg-gray-100"}
                `}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
