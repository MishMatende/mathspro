import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  LogOut,
  CalendarDays,
  ClipboardList,
  ListChecks,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const menu = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin-dashboard",
    },
    {
      label: "Lessons",
      icon: CalendarDays,
      path: "/admin-lessons",
    },
    {
      label: "Learners",
      icon: GraduationCap,
      path: "/admin-learners",
    },
    {
      label: "Tutors",
      icon: Users,
      path: "/admin-tutors",
    },
    {
      label: "Tests",
      icon: ClipboardList,
      path: "/admin-tests",
    },
    // {
    //   label: "Checklist",
    //   icon: ListChecks,
    //   path: "/admin-checklist",
    // },
  ];

  const handleLogout = async () => {
    await logout();

    navigate("/admin-login");
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static z-40 h-screen w-64 bg-white border-r border-gray-100 px-6 py-8 flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="mb-10">
          <img
            src="/logo.svg"
            alt="MathsPro"
            className="h-14 w-36 object-contain object-left"
          />

          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>

        {/* Navigation */}
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
                className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer
                  ${
                    isActive
                      ? "bg-(--color-primary)/10 text-(--color-primary) font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                <Icon
                  size={18}
                  className={`transition
                    ${
                      isActive
                        ? "text-(--color-primary)"
                        : "text-gray-400 group-hover:text-gray-600"
                    }
                  `}
                />

                <span>{item.label}</span>

                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-(--color-primary)" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between gap-3">
            {/* Admin Info */}
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Admin access</p>

              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.user_metadata?.name || user?.email || "Admin"}
              </p>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="
                w-10 h-10
                rounded-xl
                border border-gray-200
                flex items-center justify-center
                text-gray-500
                hover:bg-red-50
                hover:text-red-500
                hover:border-red-200
                transition
              "
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
