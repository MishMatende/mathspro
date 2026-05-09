import { Menu } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function Header({ open, setOpen }) {
  const { user } = useAuth();

  const firstLetter = user?.user_metadata?.name.charAt(0)?.toUpperCase() || "A";

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
          Dashboard
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 lg:gap-4">
        <span className="hidden sm:block text-sm text-gray-500">
          Welcome back 👋
        </span>

        <div
          className="
            w-8 h-8 rounded-full
            bg-(--color-primary)/10
            text-(--color-primary)
            flex items-center justify-center
            text-sm font-semibold
          "
        >
          {firstLetter}
        </div>
      </div>
    </div>
  );
}
