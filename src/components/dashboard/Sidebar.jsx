import { LayoutDashboard, Users, FileText, ClipboardList } from "lucide-react";

const Sidebar = ({ open, setOpen }) => {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static z-40 h-screen w-64 bg-white px-6 py-8 flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <h1 className="text-2xl font-bold text-primary mb-10">MathsPro</h1>

        <nav className="flex flex-col gap-2 text-sm">
          <button className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-100 cursor-pointer">
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <Users size={18} />
            Learners
          </button>

          <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <FileText size={18} />
            Homework
          </button>

          <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <ClipboardList size={18} />
            Tests
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
