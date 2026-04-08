import { Menu } from "lucide-react";

const Header = ({ open, setOpen }) => {
  return (
    <div className="flex justify-between items-center px-4 lg:px-6 py-4 bg-white">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Toggle button */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden bg-gray-100 p-2 rounded-lg cursor-pointer"
        >
          <Menu size={18} />
        </button>

        <h2 className="text-base lg:text-lg font-semibold text-gray-800">
          Tutor Dashboard
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 lg:gap-4">
        <span className="hidden sm:block text-sm text-gray-500">
          Welcome back 👋
        </span>

        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
          T
        </div>
      </div>
    </div>
  );
};

export default Header;
