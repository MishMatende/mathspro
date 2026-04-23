import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <nav className="w-full px-6 md:px-8 py-4 relative">

      {/* main bar */}
      <div className="flex items-center justify-between">

        {/* Logo */}
        <div
          onClick={() => handleNav("/")}
          className="text-xl font-bold text-(--color-primary) cursor-pointer"
        >
          MathsPro
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex gap-6 text-sm text-gray-700">
          <button
            onClick={() => handleNav("/")}
            className="hover:text-black cursor-pointer transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Home
          </button>
          <button
            onClick={() => handleNav("/diagnostic")}
            className="hover:text-black cursor-pointer transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Diagnostic Test
          </button>
          <button className="hover:text-black cursor-pointer transition hover:scale-[1.02] active:scale-[0.98]">
            How It Works
          </button>
          <button className="hover:text-black cursor-pointer transition hover:scale-[1.02] active:scale-[0.98]">
            Contact
          </button>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => handleNav("/login")}
            className="border py-2 px-4 rounded-full text-sm text-gray-700 cursor-pointer transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Tutor Login
          </button>
          <button
            onClick={() => handleNav("/diagnostic")}
            className="bg-(--color-primary) text-white px-4 py-2 rounded-full text-sm cursor-pointer transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Diagnostic
          </button>
        </div>

        {/* Hamburger - mobile only */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 cursor-pointer"
        >
          <span
            className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>

      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-100 flex flex-col gap-1 pt-4">
          <button
            onClick={() => handleNav("/")}
            className="text-left text-sm text-gray-700 hover:text-orange-500 px-2 py-2.5 rounded-lg hover:bg-orange-50 transition"
          >
            Home
          </button>
          <button
            onClick={() => handleNav("/diagnostic")}
            className="text-left text-sm text-gray-700 hover:text-orange-500 px-2 py-2.5 rounded-lg hover:bg-orange-50 transition"
          >
            Diagnostic Test
          </button>
          <button className="text-left text-sm text-gray-700 hover:text-orange-500 px-2 py-2.5 rounded-lg hover:bg-orange-50 transition">
            How It Works
          </button>
          <button className="text-left text-sm text-gray-700 hover:text-orange-500 px-2 py-2.5 rounded-lg hover:bg-orange-50 transition">
            Contact
          </button>

          <div className="border-t border-gray-100 mt-2 pt-4 flex flex-col gap-3">
            <button
              onClick={() => handleNav("/login")}
              className="w-full border border-gray-200 py-2.5 px-4 rounded-full text-sm text-gray-700 cursor-pointer transition hover:border-orange-300 hover:text-orange-500"
            >
              Tutor Login
            </button>
            <button
              onClick={() => handleNav("/diagnostic")}
              className="w-full bg-(--color-primary) text-white px-4 py-2.5 rounded-full text-sm cursor-pointer transition hover:opacity-90"
            >
              Start Diagnostic
            </button>
          </div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;