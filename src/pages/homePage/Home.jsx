import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const Home = () => {
  const navigate = useNavigate(); // moved here

  return (
    <div>
      <Navbar />

      <section className="text-center px-6 py-20">
        {/* Top label */}
        <p className="text-sm text-(--color-primary) mb-4">
          Structured Math Learning • Personalized • Results Driven
        </p>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Personalized Math Learning <br /> That Actually Works
        </h1>

        {/* Description */}
        <p className="text-gray-600 max-w-xl mx-auto mb-8">
          Every learner follows a customized path guided by a dedicated tutor.
          Track progress, identify gaps, and improve performance through
          structured lessons, homework, and assessments.
        </p>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          {/* Diagnostic Test */}
          <button
            onClick={() => navigate("/diagnostic")}
            className="bg-(--color-primary) text-white px-6 py-3 rounded-full cursor-pointer transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Take Diagnostic Test
          </button>

          {/* Tutor Login */}
          <button
            onClick={() => navigate("/tutor-dashboard")}
            className="border px-6 py-3 rounded-full cursor-pointer transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Tutor Login
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
