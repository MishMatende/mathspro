import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, GraduationCap } from "lucide-react";

export default function AdminSidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin-dashboard",
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
  ];

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
          <h1 className="text-2xl font-bold text-(--color-primary)">
            MathsPro
          </h1>
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
        <div className="mt-auto pt-6 text-xs text-gray-400">Admin access</div>
      </div>
    </>
  );
}
