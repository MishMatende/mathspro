import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4">
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="text-xl font-bold text-(--color-primary) cursor-pointer"
      >
        MathsPro
      </div>

      {/* Links */}
      <div className="hidden md:flex gap-6 text-sm text-gray-700">
        <button
          onClick={() => navigate("/")}
          className="hover:text-black cursor-pointer transition hover:scale-[1.02] active:scale-[0.98]"
        >
          Home
        </button>
        <button
          onClick={() => navigate("/diagnostic")}
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

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Tutor Login */}
        <button
          onClick={() => navigate("/tutor-dashboard")}
          className="border py-2 px-4 rounded-full text-sm text-gray-700 cursor-pointer transition hover:scale-[1.02] active:scale-[0.98]"
        >
          Tutor Login
        </button>

        {/* Primary CTA */}
        <button
          onClick={() => navigate("/diagnostic")}
          className="bg-(--color-primary) text-white px-4 py-2 rounded-full text-sm cursor-pointer transition hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Diagnostic
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
